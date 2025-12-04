import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update talent status to approved
  const { error } = await supabase
    .from('talents')
    .update({ 
      status: 'approved',
      validated_at: new Date().toISOString(),
      validated_by: user.id
    })
    .eq('id', id)

  if (error) {
    console.error('Error approving talent:', error)
    return NextResponse.json({ error: 'Failed to approve talent' }, { status: 500 })
  }

  // Redirect back to the pending queue or talent detail
  const referer = request.headers.get('referer')
  if (referer?.includes('/admin/talents/pending')) {
    return NextResponse.redirect(new URL('/admin/talents/pending', request.url))
  }
  return NextResponse.redirect(new URL(`/admin/talents/${id}`, request.url))
}