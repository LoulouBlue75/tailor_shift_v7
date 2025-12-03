import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  // Handle OAuth provider errors
  if (error_param) {
    console.error('[Auth Callback] OAuth error:', error_param, error_description)
    const errorMsg = encodeURIComponent(error_description || error_param || 'oauth_error')
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=${errorMsg}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('[Auth Callback] Code exchange error:', error.message, error.status)
      const errorMsg = encodeURIComponent(error.message || 'code_exchange_failed')
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=${errorMsg}`)
    }
    
    // Get user to check their type and redirect appropriately
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if profile exists and has user_type
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('[Auth Callback] Profile fetch error:', profileError.message)
      }

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

  // No code provided
  console.error('[Auth Callback] No code provided in callback')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error&message=no_code`)
}
