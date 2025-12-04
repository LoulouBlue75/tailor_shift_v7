import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { groupApproveTeamRequest } from '@/lib/auth/group-rbac'
import type { RoleScope } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { groupId, requestId, assignedRole, assignedScope, notes } = body
    
    if (!groupId || !requestId || !assignedRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const scope: RoleScope = assignedScope || {
      geographic: 'global',
      divisions: []
    }
    
    const result = await groupApproveTeamRequest(
      user.id,
      groupId,
      requestId,
      assignedRole,
      scope,
      notes
    )
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Error approving request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve request' },
      { status: 500 }
    )
  }
}