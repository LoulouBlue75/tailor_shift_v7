import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGroupPermission } from '@/lib/auth/group-rbac'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { groupId, requestId, reason } = body
    
    if (!groupId || !requestId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check permission
    const hasPermission = await checkGroupPermission(user.id, groupId, 'approve_brand_requests')
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to reject requests at group level' },
        { status: 403 }
      )
    }
    
    // Get the request
    const { data: teamRequest, error: requestError } = await supabase
      .from('brand_team_requests')
      .select('*, brands(id, name, group_id)')
      .eq('id', requestId)
      .single()

    if (requestError || !teamRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Verify brand belongs to this group
    if ((teamRequest.brands as any)?.group_id !== groupId) {
      return NextResponse.json(
        { error: 'Brand does not belong to your group' },
        { status: 403 }
      )
    }
    
    // Update request status
    const { error: updateError } = await supabase
      .from('brand_team_requests')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reason,
        reviewer_level: 'group'
      })
      .eq('id', requestId)

    if (updateError) {
      throw updateError
    }

    // Update requester's profile status
    await supabase
      .from('profiles')
      .update({
        pending_team_request_id: null
      })
      .eq('id', teamRequest.profile_id)

    // Create notification for the requester
    await supabase
      .from('notifications')
      .insert({
        user_id: teamRequest.profile_id,
        type: 'team_request_rejected',
        title: 'Team Request Declined by Group',
        body: `Your request to join ${(teamRequest.brands as any)?.name || 'the team'} was not approved by group administration. Reason: ${reason}`,
        data: {
          brand_id: teamRequest.brand_id,
          reason,
          rejected_by_group: true
        }
      })
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Error rejecting request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reject request' },
      { status: 500 }
    )
  }
}