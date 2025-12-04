import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGroupPermission, getGroupPendingRequests } from '@/lib/auth/group-rbac'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const groupId = searchParams.get('groupId')
  const requiresGroupApproval = searchParams.get('requiresGroupApproval') === 'true'
  
  if (!groupId) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
  }
  
  // Check permission
  const hasPermission = await checkGroupPermission(user.id, groupId, 'approve_brand_requests')
  if (!hasPermission) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  
  try {
    const requests = await getGroupPendingRequests(groupId, {
      requiresGroupApproval
    })
    
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching group pending requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}