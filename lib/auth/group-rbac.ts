import { createClient } from '@/lib/supabase/server'
import type { GroupRole, RoleScope } from '@/lib/types/database'

// ============================================================================
// GROUP-LEVEL PERMISSION SYSTEM
// For luxury conglomerate group-level administration (LVMH, Kering, etc.)
// ============================================================================

export type GroupPermission =
  | 'view_group_brands'      // View all brands in the group
  | 'manage_group_brands'    // Add/remove brands from the group
  | 'view_group_team'        // View all group-level team members
  | 'manage_group_team'      // Manage group-level team members
  | 'approve_brand_requests' // Approve team requests at brand level
  | 'override_brand_admins'  // Override brand-level decisions
  | 'view_group_analytics'   // View group-wide analytics
  | 'manage_group_settings'  // Manage group settings

// Group role permission matrix
const GROUP_PERMISSION_MATRIX: Record<GroupRole, GroupPermission[]> = {
  group_owner: [
    'view_group_brands',
    'manage_group_brands',
    'view_group_team',
    'manage_group_team',
    'approve_brand_requests',
    'override_brand_admins',
    'view_group_analytics',
    'manage_group_settings'
  ],
  group_admin: [
    'view_group_brands',
    'manage_group_brands',
    'view_group_team',
    'manage_group_team',
    'approve_brand_requests',
    'override_brand_admins',
    'view_group_analytics'
  ],
  group_hr: [
    'view_group_brands',
    'view_group_team',
    'approve_brand_requests',
    'view_group_analytics'
  ],
  group_viewer: [
    'view_group_brands',
    'view_group_analytics'
  ]
}

/**
 * Get the user's group membership and role
 */
export async function getUserGroupMembership(userId: string): Promise<{
  groupId: string | null
  role: GroupRole | null
  roleScope: RoleScope | null
} | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('group_team_members')
    .select('group_id, role, role_scope')
    .eq('profile_id', userId)
    .eq('status', 'active')
    .single()

  if (error || !data) {
    return null
  }

  return {
    groupId: data.group_id,
    role: data.role as GroupRole,
    roleScope: data.role_scope as RoleScope
  }
}

/**
 * Check if a user has a specific group-level permission
 */
export async function checkGroupPermission(
  userId: string,
  groupId: string,
  permission: GroupPermission
): Promise<boolean> {
  const membership = await getUserGroupMembership(userId)

  if (!membership || membership.groupId !== groupId) {
    return false
  }

  const permissions = GROUP_PERMISSION_MATRIX[membership.role!] || []
  return permissions.includes(permission)
}

/**
 * Get all brands in a luxury group
 */
export async function getGroupBrands(groupId: string): Promise<Array<{
  id: string
  name: string
  logo_url: string | null
  segment: string | null
  verified: boolean
  requires_group_approval: boolean
}>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('brands')
    .select('id, name, logo_url, segment, verified, requires_group_approval')
    .eq('group_id', groupId)
    .order('name')

  if (error) {
    console.error('Error fetching group brands:', error)
    return []
  }

  return data || []
}

/**
 * Get pending team requests across all brands in the group
 */
export async function getGroupPendingRequests(
  groupId: string,
  options?: { requiresGroupApproval?: boolean }
): Promise<Array<{
  id: string
  brand_id: string
  brand_name: string
  email: string
  department: string
  requested_role: string
  job_title: string | null
  request_message: string | null
  created_at: string
  requires_group_approval: boolean
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}>> {
  const supabase = await createClient()

  // First get all brands in the group
  const brands = await getGroupBrands(groupId)
  const brandIds = brands.map(b => b.id)

  if (brandIds.length === 0) {
    return []
  }

  let query = supabase
    .from('brand_team_requests')
    .select(`
      id,
      brand_id,
      email,
      department,
      requested_role,
      job_title,
      request_message,
      created_at,
      requires_group_approval,
      profiles!inner(id, full_name, avatar_url),
      brands!inner(name)
    `)
    .in('brand_id', brandIds)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (options?.requiresGroupApproval) {
    query = query.eq('requires_group_approval', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching group pending requests:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    ...item,
    brand_name: item.brands?.name || 'Unknown Brand',
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
  }))
}

/**
 * Group admin approves a team request (overrides brand-level)
 */
export async function groupApproveTeamRequest(
  userId: string,
  groupId: string,
  requestId: string,
  assignedRole: string,
  assignedScope: RoleScope,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Check group permission
  const hasPermission = await checkGroupPermission(userId, groupId, 'approve_brand_requests')
  if (!hasPermission) {
    return { success: false, error: 'You do not have permission to approve at group level' }
  }

  try {
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('brand_team_requests')
      .select('*, brands(id, name, group_id)')
      .eq('id', requestId)
      .single()

    if (requestError || !request) {
      return { success: false, error: 'Request not found' }
    }

    // Verify brand belongs to this group
    if ((request.brands as any)?.group_id !== groupId) {
      return { success: false, error: 'Brand does not belong to your group' }
    }

    // Update request with group approval
    const { error: updateError } = await supabase
      .from('brand_team_requests')
      .update({
        status: 'approved',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
        reviewer_level: 'group',
        assigned_role: assignedRole,
        assigned_scope: assignedScope,
        group_approved_by: userId,
        group_approved_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      throw updateError
    }

    // Create brand team member
    const { error: memberError } = await supabase
      .from('brand_team_members')
      .insert({
        brand_id: request.brand_id,
        profile_id: request.profile_id,
        role: assignedRole,
        role_scope: assignedScope,
        invited_by: userId,
        invited_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        status: 'active'
      })

    if (memberError) {
      throw memberError
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({
        account_status: 'active',
        pending_team_request_id: null
      })
      .eq('id', request.profile_id)

    // Notify the requester
    await supabase
      .from('notifications')
      .insert({
        user_id: request.profile_id,
        type: 'team_request_approved',
        title: 'Team Request Approved by Group',
        body: `Your request to join ${(request.brands as any)?.name || 'the team'} has been approved by group administration!`,
        data: {
          brand_id: request.brand_id,
          assigned_role: assignedRole,
          approved_by_group: true
        }
      })

    return { success: true }

  } catch (error: any) {
    console.error('Error in group approval:', error)
    return { success: false, error: error.message || 'Failed to approve request' }
  }
}

/**
 * Get all group team members
 */
export async function getGroupTeamMembers(groupId: string): Promise<Array<{
  id: string
  profile_id: string
  role: GroupRole
  role_scope: RoleScope
  status: string
  invited_at: string
  accepted_at: string | null
  profiles: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('group_team_members')
    .select(`
      id,
      profile_id,
      role,
      role_scope,
      status,
      invited_at,
      accepted_at,
      profiles!inner(full_name, email, avatar_url)
    `)
    .eq('group_id', groupId)
    .eq('status', 'active')
    .order('role')

  if (error) {
    console.error('Error fetching group team members:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    ...item,
    profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
  }))
}

/**
 * Get the luxury group details
 */
export async function getLuxuryGroup(groupId: string): Promise<{
  id: string
  name: string
  maisons: string[]
  status: string
} | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('luxury_groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Check if user is a group admin for any group
 */
export async function isGroupAdmin(userId: string): Promise<{
  isAdmin: boolean
  groupId?: string
  groupName?: string
  role?: GroupRole
}> {
  const membership = await getUserGroupMembership(userId)

  if (!membership || !membership.groupId) {
    return { isAdmin: false }
  }

  const adminRoles: GroupRole[] = ['group_owner', 'group_admin', 'group_hr']
  if (!adminRoles.includes(membership.role!)) {
    return { isAdmin: false }
  }

  const group = await getLuxuryGroup(membership.groupId)

  return {
    isAdmin: true,
    groupId: membership.groupId,
    groupName: group?.name,
    role: membership.role!
  }
}