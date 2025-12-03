'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Logo, Skeleton } from '@/components/ui'
import { CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <div className="mb-12">
          <Logo variant="full" size="lg" />
        </div>

        <div className="w-full max-w-[400px] text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--success-light)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[var(--success)]" />
          </div>
          <h1 className="text-h2 mb-4">Password updated!</h1>
          <p className="text-[var(--grey-600)] mb-8">
            Your password has been successfully reset. You will be redirected to the login page shortly.
          </p>
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="mb-12">
        <Logo variant="full" size="lg" />
      </div>

      <div className="w-full max-w-[400px]">
        <h1 className="text-h2 text-center mb-2">Set new password</h1>
        <p className="text-center text-[var(--grey-600)] mb-8">
          Enter your new password below
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-[var(--grey-500)] hover:text-[var(--charcoal)] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-[var(--grey-500)] hover:text-[var(--charcoal)] transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-small text-[var(--grey-500)]">
            Password must be at least 8 characters long
          </p>

          <Button type="submit" className="w-full" loading={loading}>
            Reset Password
          </Button>
        </form>

        <p className="mt-8 text-center">
          <Link
            href="/login"
            className="text-small text-[var(--grey-600)] hover:text-[var(--charcoal)] transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function ResetPasswordSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="mb-12"><Skeleton className="h-8 w-32" /></div>
      <div className="w-full max-w-[400px] space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  )
}