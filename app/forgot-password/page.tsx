'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Logo } from '@/components/ui'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
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
          <h1 className="text-h2 mb-4">Check your email</h1>
          <p className="text-[var(--grey-600)] mb-8">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
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
        <h1 className="text-h2 text-center mb-2">Reset password</h1>
        <p className="text-center text-[var(--grey-600)] mb-8">
          Enter your email and we&apos;ll send you a reset link
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button type="submit" className="w-full" loading={loading}>
            Send Reset Link
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
