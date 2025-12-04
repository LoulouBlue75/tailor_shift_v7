import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Sign out the user
  await supabase.auth.signOut()
  
  // Get the origin from the request to construct the redirect URL
  const { origin } = new URL(request.url)
  
  // Redirect to login page
  return NextResponse.redirect(`${origin}/login`)
}