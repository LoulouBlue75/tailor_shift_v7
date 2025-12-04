'use server'

import { checkBrandPermission as checkPermission, getBrandTeamMembers as getMembers } from '@/lib/auth/brand-rbac'
import { createClient } from '@/lib/supabase/server'
import type { BrandTeamRequest, RoleScope } from '@/lib/types/database'

// ============================================================================
// PERMISSION CHECKS
// ============================================================================

export async function checkBrandPermissionAction(userId: string, brandId: string, permission: any) {
  return await checkPermission(userId, brandId, permission)
}

export async function getBrandTeamMembersAction(brandId: string) {
  return await getMembers(brandId)
}

// ============================================================================
// TEAM REQUEST MANAGEMENT
// ============================================================================

/**
 * Get pending team requests for a brand
 */
export async function getPendingTeamRequestsAction(brandId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('brand_team_requests')
    .select(`
      id,
      email,
      department,
      requested_role,
      requested_scope,
      job_title,
      request_message,
      created_at,
      expires_at,
      requires_group_approval,
      profiles!inner(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('brand_id', brandId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching pending requests:', error)
    return []
  }
  
  return data || []
}

/**
 * Get count of pending team requests for a brand
 */
export async function getPendingTeamRequestsCountAction(brandId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('brand_team_requests')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brandId)
    .eq('status', 'pending')
  
  if (error) {
    console.error('Error counting pending requests:', error)
    return 0
  }
  
  return count || 0
}

/**
 * Approve a team request
 */
export async function approveTeamRequestAction(
  requestId: string,
  assignedRole: string,
  assignedScope: RoleScope,
  reviewNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('brand_team_requests')
      .select('*, brands(id, name)')
      .eq('id', requestId)
      .single()
    
    if (requestError || !request) {
      return { success: false, error: 'Request not found' }
    }
    
    // Check permission to approve
    const hasPermission = await checkPermission(user.id, request.brand_id, 'manage_team')
    if (!hasPermission) {
      return { success: false, error: 'You do not have permission to approve requests' }
    }
    
    // Start transaction-like operations
    // 1. Update request status
    const { error: updateError } = await supabase
      .from('brand_team_requests')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
        reviewer_level: 'brand',
        assigned_role: assignedRole,
        assigned_scope: assignedScope
      })
      .eq('id', requestId)
    
    if (updateError) {
      throw updateError
    }
    
    // 2. Create brand_team_members record
    const { error: memberError } = await supabase
      .from('brand_team_members')
      .insert({
        brand_id: request.brand_id,
        profile_id: request.profile_id,
        role: assignedRole,
        role_scope: assignedScope,
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        status: 'active'
      })
    
    if (memberError) {
      throw memberError
    }
    
    // 3. Update requester's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        account_status: 'active',
        pending_team_request_id: null
      })
      .eq('id', request.profile_id)
    
    if (profileError) {
      throw profileError
    }
    
    // 4. Create notification for the requester
    await supabase
      .from('notifications')
      .insert({
        user_id: request.profile_id,
        type: 'team_request_approved',
        title: 'Team Request Approved',
        body: `Your request to join ${request.brands?.name || 'the team'} has been approved!`,
        data: {
          brand_id: request.brand_id,
          assigned_role: assignedRole
        }
      })
    
    return { success: true }
    
  } catch (error: any) {
    console.error('Error approving team request:', error)
    return { success: false, error: error.message || 'Failed to approve request' }
  }
}

/**
 * Reject a team request
 */
export async function rejectTeamRequestAction(
  requestId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('brand_team_requests')
      .select('*, brands(id, name)')
      .eq('id', requestId)
      .single()
    
    if (requestError || !request) {
      return { success: false, error: 'Request not found' }
    }
    
    // Check permission to reject
    const hasPermission = await checkPermission(user.id, request.brand_id, 'manage_team')
    if (!hasPermission) {
      return { success: false, error: 'You do not have permission to reject requests' }
    }
    
    // Update request status
    const { error: updateError } = await supabase
      .from('brand_team_requests')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reason,
        reviewer_level: 'brand'
      })
      .eq('id', requestId)
    
    if (updateError) {
      throw updateError
    }
    
    // Update requester's profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        account_status: 'pending', // Keep as pending, they can try again
        pending_team_request_id: null
      })
      .eq('id', request.profile_id)
    
    if (profileError) {
      throw profileError
    }
    
    // Create notification for the requester
    await supabase
      .from('notifications')
      .insert({
        user_id: request.profile_id,
        type: 'team_request_rejected',
        title: 'Team Request Declined',
        body: `Your request to join ${request.brands?.name || 'the team'} was not approved. Reason: ${reason}`,
        data: {
          brand_id: request.brand_id,
          reason
        }
      })
    
    return { success: true }
    
  } catch (error: any) {
    console.error('Error rejecting team request:', error)
    return { success: false, error: error.message || 'Failed to reject request' }
  }
}