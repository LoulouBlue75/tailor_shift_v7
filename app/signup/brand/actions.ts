'use server'

import { createClient } from '@/lib/supabase/server'
import type { Department, RoleScope } from '@/lib/types/database'

interface CreateTeamRequestParams {
  brandId: string
  email: string
  department: Department
  jobTitle: string
  message?: string
}

/**
 * Create a team join request for an existing brand
 */
export async function createTeamRequestAction(
  params: CreateTeamRequestParams
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  const supabase = await createClient()
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Check if user already has a pending request for this brand
    const { data: existingRequest } = await supabase
      .from('brand_team_requests')
      .select('id')
      .eq('profile_id', user.id)
      .eq('brand_id', params.brandId)
      .eq('status', 'pending')
      .single()
    
    if (existingRequest) {
      return { success: false, error: 'You already have a pending request for this brand' }
    }
    
    // Check if user is already a team member
    const { data: existingMember } = await supabase
      .from('brand_team_members')
      .select('id')
      .eq('profile_id', user.id)
      .eq('brand_id', params.brandId)
      .eq('status', 'active')
      .single()
    
    if (existingMember) {
      return { success: false, error: 'You are already a member of this brand' }
    }
    
    // Map department to default role
    const departmentRoleMap: Record<Department, string> = {
      direction: 'admin',
      hr: 'recruiter',
      operations: 'viewer',
      business: 'hiring_manager'
    }
    
    // Calculate expiry (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    // Create the team request
    const requestedRole = departmentRoleMap[params.department] || 'viewer'
    const requestedScope: RoleScope = {
      geographic: 'global',
      divisions: []
    }
    
    // Check if brand requires group approval
    const { data: brand } = await supabase
      .from('brands')
      .select('requires_group_approval')
      .eq('id', params.brandId)
      .single()
    
    const { data: request, error: insertError } = await supabase
      .from('brand_team_requests')
      .insert({
        brand_id: params.brandId,
        profile_id: user.id,
        email: params.email,
        department: params.department,
        requested_role: requestedRole,
        requested_scope: requestedScope,
        job_title: params.jobTitle,
        request_message: params.message || null,
        status: 'pending',
        requires_group_approval: brand?.requires_group_approval || false,
        expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single()
    
    if (insertError) {
      throw insertError
    }
    
    // Update user's profile with the pending request
    await supabase
      .from('profiles')
      .update({
        pending_team_request_id: request.id,
        user_type: 'brand'
      })
      .eq('id', user.id)
    
    // Notify brand owners about the new request
    const { data: brandOwners } = await supabase
      .from('brand_team_members')
      .select('profile_id')
      .eq('brand_id', params.brandId)
      .in('role', ['owner', 'admin'])
      .eq('status', 'active')
    
    if (brandOwners) {
      const notifications = brandOwners.map(owner => ({
        user_id: owner.profile_id,
        type: 'team_request_received',
        title: 'New Team Request',
        body: `${params.email} has requested to join your team as ${params.department}`,
        data: {
          request_id: request.id,
          brand_id: params.brandId,
          email: params.email,
          department: params.department
        }
      }))
      
      await supabase.from('notifications').insert(notifications)
    }
    
    return { success: true, requestId: request.id }
    
  } catch (error: any) {
    console.error('Error creating team request:', error)
    return { success: false, error: error.message || 'Failed to create team request' }
  }
}

/**
 * Get brand details by domain (for email domain matching)
 */
export async function getBrandByDomainAction(domain: string): Promise<{
  found: boolean
  brand?: {
    id: string
    name: string
    logo_url: string | null
    segment: string | null
    verified: boolean
  }
}> {
  const supabase = await createClient()
  
  // Common email domains that should not be used for matching
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'icloud.com', 'me.com', 'protonmail.com', 'live.com'
  ]
  
  if (commonDomains.includes(domain.toLowerCase())) {
    return { found: false }
  }
  
  // Try to find brand with matching website domain
  const { data: brandByDomain } = await supabase
    .from('brands')
    .select('id, name, logo_url, segment, verified')
    .or(`website.ilike.%${domain}%,contact_email.ilike.%@${domain}`)
    .limit(1)
    .single()
  
  if (brandByDomain) {
    return { found: true, brand: brandByDomain }
  }
  
  // Try to find by contact email domain
  const { data: brandByEmail } = await supabase
    .from('brands')
    .select('id, name, logo_url, segment, verified')
    .ilike('contact_email', `%@${domain}`)
    .limit(1)
    .single()
  
  if (brandByEmail) {
    return { found: true, brand: brandByEmail }
  }
  
  return { found: false }
}

/**
 * Check the user's team request status
 */
export async function getMyTeamRequestStatusAction(): Promise<{
  hasPendingRequest: boolean
  request?: {
    id: string
    brand_id: string
    brand_name: string
    status: string
    created_at: string
    expires_at: string
  }
}> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { hasPendingRequest: false }
  }
  
  const { data: request } = await supabase
    .from('brand_team_requests')
    .select(`
      id,
      brand_id,
      status,
      created_at,
      expires_at,
      brands (name)
    `)
    .eq('profile_id', user.id)
    .eq('status', 'pending')
    .single()
  
  if (!request) {
    return { hasPendingRequest: false }
  }
  
  return {
    hasPendingRequest: true,
    request: {
      id: request.id,
      brand_id: request.brand_id,
      brand_name: (request.brands as any)?.name || 'Unknown Brand',
      status: request.status,
      created_at: request.created_at,
      expires_at: request.expires_at
    }
  }
}