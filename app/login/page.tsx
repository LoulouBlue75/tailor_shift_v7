'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Logo, Skeleton } from '@/components/ui'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const error = searchParams.get('error')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(error === 'auth_callback_error' ? 'Authentication failed. Please try again.' : null)

  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setFormError(error.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc') => {
    setLoading(true)
    setFormError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    })

    if (error) {
      setFormError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      {/* Logo */}
      <div className="mb-12">
        <Logo variant="full" size="lg" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[400px]">
        <h1 className="text-h2 text-center mb-8">Sign in</h1>

        {formError && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div>
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-small text-[var(--grey-600)] hover:text-[var(--charcoal)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--grey-200)]" />
          </div>
          <div className="relative flex justify-center text-small">
            <span className="bg-white px-4 text-[var(--grey-500)]">or</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => handleOAuthLogin('linkedin_oidc')}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </Button>
        </div>

        {/* Sign up link */}
        <p className="mt-8 text-center text-small text-[var(--grey-600)]">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-[var(--charcoal)] font-medium hover:underline"
          >
            Sign up
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

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="mb-12"><Skeleton className="h-8 w-32" /></div>
      <div className="w-full max-w-[400px] space-y-6">
        <Skeleton className="h-8 w-24 mx-auto" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
