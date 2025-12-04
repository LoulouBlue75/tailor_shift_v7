import { createClient } from '@/lib/supabase/server'

// ============================================================================
// TEAM NOTIFICATION TYPES
// ============================================================================

export type TeamNotificationType =
  | 'team_request_received'     // Brand owner: someone requested to join
  | 'team_request_approved'     // Requester: request was approved
  | 'team_request_rejected'     // Requester: request was rejected
  | 'team_member_joined'        // Team: new member joined
  | 'group_approval_required'   // Group admin: request needs group approval

interface NotificationData {
  request_id?: string
  brand_id?: string
  email?: string
  department?: string
  assigned_role?: string
  reason?: string
  approved_by_group?: boolean
  rejected_by_group?: boolean
}

// ============================================================================
// NOTIFICATION CREATION HELPERS
// ============================================================================

/**
 * Create a notification for team request received
 */
export async function notifyTeamRequestReceived(params: {
  brandId: string
  requestId: string
  requesterEmail: string
  department: string
}): Promise<void> {
  const supabase = await createClient()
  
  // Get brand name and owners
  const { data: brand } = await supabase
    .from('brands')
    .select('name')
    .eq('id', params.brandId)
    .single()
  
  const { data: owners } = await supabase
    .from('brand_team_members')
    .select('profile_id')
    .eq('brand_id', params.brandId)
    .in('role', ['owner', 'admin'])
    .eq('status', 'active')
  
  if (!owners || owners.length === 0) return
  
  const notifications = owners.map(owner => ({
    user_id: owner.profile_id,
    type: 'team_request_received' as TeamNotificationType,
    title: 'New Team Request',
    body: `${params.requesterEmail} requested to join ${brand?.name || 'your team'}`,
    data: {
      request_id: params.requestId,
      brand_id: params.brandId,
      email: params.requesterEmail,
      department: params.department
    } as NotificationData
  }))
  
  await supabase.from('notifications').insert(notifications)
}

/**
 * Create notification when request is approved
 */
export async function notifyTeamRequestApproved(params: {
  profileId: string
  brandId: string
  brandName: string
  assignedRole: string
  approvedByGroup?: boolean
}): Promise<void> {
  const supabase = await createClient()
  
  await supabase.from('notifications').insert({
    user_id: params.profileId,
    type: 'team_request_approved' as TeamNotificationType,
    title: params.approvedByGroup 
      ? 'Team Request Approved by Group' 
      : 'Team Request Approved',
    body: `Your request to join ${params.brandName} has been approved! You now have ${params.assignedRole} access.`,
    data: {
      brand_id: params.brandId,
      assigned_role: params.assignedRole,
      approved_by_group: params.approvedByGroup
    } as NotificationData
  })
}

/**
 * Create notification when request is rejected
 */
export async function notifyTeamRequestRejected(params: {
  profileId: string
  brandId: string
  brandName: string
  reason: string
  rejectedByGroup?: boolean
}): Promise<void> {
  const supabase = await createClient()
  
  await supabase.from('notifications').insert({
    user_id: params.profileId,
    type: 'team_request_rejected' as TeamNotificationType,
    title: params.rejectedByGroup 
      ? 'Team Request Declined by Group Administration' 
      : 'Team Request Declined',
    body: `Your request to join ${params.brandName} was not approved. Reason: ${params.reason}`,
    data: {
      brand_id: params.brandId,
      reason: params.reason,
      rejected_by_group: params.rejectedByGroup
    } as NotificationData
  })
}

/**
 * Notify group admins when request needs group-level approval
 */
export async function notifyGroupApprovalRequired(params: {
  groupId: string
  brandId: string
  brandName: string
  requestId: string
  requesterEmail: string
}): Promise<void> {
  const supabase = await createClient()
  
  // Get group admins
  const { data: groupAdmins } = await supabase
    .from('group_team_members')
    .select('profile_id')
    .eq('group_id', params.groupId)
    .in('role', ['group_owner', 'group_admin', 'group_hr'])
    .eq('status', 'active')
  
  if (!groupAdmins || groupAdmins.length === 0) return
  
  const notifications = groupAdmins.map(admin => ({
    user_id: admin.profile_id,
    type: 'group_approval_required' as TeamNotificationType,
    title: 'Group Approval Required',
    body: `${params.requesterEmail} needs group approval to join ${params.brandName}`,
    data: {
      request_id: params.requestId,
      brand_id: params.brandId,
      email: params.requesterEmail
    } as NotificationData
  }))
  
  await supabase.from('notifications').insert(notifications)
}

// ============================================================================
// NOTIFICATION FETCHING
// ============================================================================

/**
 * Get unread notifications count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)
  
  return count || 0
}

/**
 * Get recent notifications for a user
 */
export async function getRecentNotifications(
  userId: string,
  limit: number = 10
): Promise<Array<{
  id: string
  type: string
  title: string
  body: string | null
  data: NotificationData
  read_at: string | null
  created_at: string
}>> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
  
  return data || []
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[]
): Promise<void> {
  const supabase = await createClient()
  
  let query = supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)
  
  if (notificationIds && notificationIds.length > 0) {
    query = query.in('id', notificationIds)
  }
  
  await query
}