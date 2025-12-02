'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Logo, Card, Skeleton } from '@/components/ui'
import { User, Building2, Check } from 'lucide-react'

type UserType = 'talent' | 'brand' | null

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get('step')
  
  const [userType, setUserType] = useState<UserType>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showTypeSelection, setShowTypeSelection] = useState(step === 'type' || true)

  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userType) {
      setFormError('Please select whether you are a professional or a brand')
      return
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setFormError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setFormError(error.message)
      setLoading(false)
      return
    }

    // Update the profile with user_type
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: userType, full_name: fullName })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }

      // Create talent or brand record
      if (userType === 'talent') {
        const names = fullName.trim().split(' ')
        const firstName = names[0] || ''
        const lastName = names.slice(1).join(' ') || ''
        
        await supabase.from('talents').insert({
          profile_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          status: 'onboarding',
        })
      } else {
        await supabase.from('brands').insert({
          profile_id: data.user.id,
          name: fullName, // Will be updated in onboarding
        })
      }
    }

    // Redirect to onboarding
    const onboardingPath = userType === 'brand' ? '/brand/onboarding' : '/talent/onboarding'
    router.push(onboardingPath)
    router.refresh()
  }

  const handleOAuthSignup = async (provider: 'google' | 'linkedin_oidc') => {
    if (!userType) {
      setFormError('Please select whether you are a professional or a brand first')
      return
    }

    setLoading(true)
    setFormError(null)

    // Store user type in localStorage for after OAuth callback
    localStorage.setItem('signup_user_type', userType)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setFormError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
      {/* Logo */}
      <div className="mb-12">
        <Logo variant="full" size="lg" />
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-[600px]">
        <h1 className="text-h2 text-center mb-2">Create your account</h1>
        
        {showTypeSelection && (
          <>
            <p className="text-center text-[var(--grey-600)] mb-8">I am a...</p>

            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card
                variant={userType === 'talent' ? 'selected' : 'interactive'}
                className="p-6 text-center"
                onClick={() => setUserType('talent')}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    userType === 'talent' ? 'bg-[var(--gold-light)]' : 'bg-[var(--grey-100)]'
                  }`}>
                    <User className={`w-6 h-6 ${userType === 'talent' ? 'text-[var(--gold)]' : 'text-[var(--grey-600)]'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--charcoal)]">Professional</h3>
                    <p className="text-small text-[var(--grey-600)]">Looking for opportunities</p>
                  </div>
                  {userType === 'talent' && (
                    <Check className="w-5 h-5 text-[var(--gold)]" />
                  )}
                </div>
              </Card>

              <Card
                variant={userType === 'brand' ? 'selected' : 'interactive'}
                className="p-6 text-center"
                onClick={() => setUserType('brand')}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    userType === 'brand' ? 'bg-[var(--gold-light)]' : 'bg-[var(--grey-100)]'
                  }`}>
                    <Building2 className={`w-6 h-6 ${userType === 'brand' ? 'text-[var(--gold)]' : 'text-[var(--grey-600)]'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--charcoal)]">Brand</h3>
                    <p className="text-small text-[var(--grey-600)]">Looking for talent</p>
                  </div>
                  {userType === 'brand' && (
                    <Check className="w-5 h-5 text-[var(--gold)]" />
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {formError && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6 max-w-[400px] mx-auto">
          <Input
            type="text"
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            hint="At least 8 characters"
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!userType}
          >
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8 max-w-[400px] mx-auto">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--grey-200)]" />
          </div>
          <div className="relative flex justify-center text-small">
            <span className="bg-white px-4 text-[var(--grey-500)]">or</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 max-w-[400px] mx-auto">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleOAuthSignup('google')}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleOAuthSignup('linkedin_oidc')}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </Button>
        </div>

        {/* Sign in link */}
        <p className="mt-8 text-center text-small text-[var(--grey-600)]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[var(--charcoal)] font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-small text-[var(--grey-500)]">
        <Link href="/terms" className="hover:text-[var(--charcoal)]">Terms</Link>
        <span className="mx-2">|</span>
        <Link href="/privacy" className="hover:text-[var(--charcoal)]">Privacy</Link>
      </footer>
    </div>
  )
}

function SignupSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="mb-12"><Skeleton className="h-8 w-32" /></div>
      <div className="w-full max-w-[600px] space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupSkeleton />}>
      <SignupForm />
    </Suspense>
  )
}
