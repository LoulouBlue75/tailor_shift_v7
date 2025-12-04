import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { notificationIds, markAll } = body
    
    let query = supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null)
    
    if (!markAll && notificationIds && notificationIds.length > 0) {
      query = query.in('id', notificationIds)
    }
    
    const { error } = await query
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}