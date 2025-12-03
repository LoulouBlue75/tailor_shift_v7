import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user to check their type and redirect appropriately
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists and has user_type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, onboarding_completed')
          .eq('id', user.id)
          .single()

        if (profile?.onboarding_completed) {
          // Redirect to appropriate dashboard
          const dashboard = profile.user_type === 'brand' ? '/brand/dashboard' : '/talent/dashboard'
          return NextResponse.redirect(`${origin}${dashboard}`)
        } else if (profile?.user_type) {
          // Redirect to onboarding
          const onboarding = profile.user_type === 'brand' ? '/brand/onboarding' : '/talent/onboarding'
          return NextResponse.redirect(`${origin}${onboarding}`)
        } else {
          // New user - needs to complete signup (read user type from localStorage on client)
          return NextResponse.redirect(`${origin}/auth/complete-signup`)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
