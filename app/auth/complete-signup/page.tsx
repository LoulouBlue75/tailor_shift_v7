'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo, Card, Button } from '@/components/ui'
import { User, Building2, Check, Loader2 } from 'lucide-react'

type UserType = 'talent' | 'brand' | null

export default function CompleteSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [needsTypeSelection, setNeedsTypeSelection] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    const completeSignup = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          // No user session, redirect to login
          router.push('/login')
          return
        }

        // Check if user already has completed setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, onboarding_completed')
          .eq('id', user.id)
          .single()

        if (profile?.onboarding_completed) {
          // Already completed, redirect to dashboard
          const dashboard = profile.user_type === 'brand' ? '/brand/dashboard' : '/talent/dashboard'
          router.push(dashboard)
          return
        }

        // Check if talent or brand record already exists
        const { data: existingTalent } = await supabase
          .from('talents')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        const { data: existingBrand } = await supabase
          .from('brands')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (existingTalent || existingBrand) {
          // Record already exists, redirect to onboarding
          const onboarding = existingBrand ? '/brand/onboarding' : '/talent/onboarding'
          router.push(onboarding)
          return
        }

        // Read user type from localStorage
        const storedUserType = localStorage.getItem('signup_user_type') as UserType
        
        if (storedUserType && (storedUserType === 'talent' || storedUserType === 'brand')) {
          // We have a stored user type, automatically complete setup
          setUserType(storedUserType)
          await finalizeSignup(user.id, storedUserType, user.user_metadata?.full_name || user.email || '')
        } else {
          // No stored user type, show selection UI
          setNeedsTypeSelection(true)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error completing signup:', err)
        setError('An error occurred while completing your signup. Please try again.')
        setLoading(false)
      }
    }

    completeSignup()
  }, [])

  const finalizeSignup = async (userId: string, selectedType: UserType, fullName: string) => {
    if (!selectedType) return

    setProcessing(true)
    setError(null)

    try {
      // Update profile with correct user_type
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: selectedType })
        .eq('id', userId)

      if (profileError) {
        throw new Error('Failed to update profile: ' + profileError.message)
      }

      // Create talent or brand record
      if (selectedType === 'talent') {
        const names = fullName.trim().split(' ')
        const firstName = names[0] || ''
        const lastName = names.slice(1).join(' ') || ''
        
        const { error: talentError } = await supabase.from('talents').insert({
          profile_id: userId,
          first_name: firstName,
          last_name: lastName,
          status: 'onboarding',
        })

        if (talentError) {
          throw new Error('Failed to create talent record: ' + talentError.message)
        }
      } else {
        const { error: brandError } = await supabase.from('brands').insert({
          profile_id: userId,
          name: fullName, // Will be updated in onboarding
        })

        if (brandError) {
          throw new Error('Failed to create brand record: ' + brandError.message)
        }
      }

      // Clear stored user type
      localStorage.removeItem('signup_user_type')

      // Redirect to onboarding
      const onboardingPath = selectedType === 'brand' ? '/brand/onboarding' : '/talent/onboarding'
      router.push(onboardingPath)
      router.refresh()
    } catch (err) {
      console.error('Error finalizing signup:', err)
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setProcessing(false)
      setLoading(false)
    }
  }

  const handleTypeSelection = async (type: UserType) => {
    if (!type) return
    
    setUserType(type)
    
    // Get user info  
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await finalizeSignup(user.id, type, user.user_metadata?.full_name || user.email || '')
    }
  }

  // Loading state
  if (loading && !needsTypeSelection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
        <Logo variant="full" size="lg" className="mb-8" />
        <div className="flex items-center gap-3 text-[var(--grey-600)]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Completing your signup...</span>
        </div>
      </div>
    )
  }

  // Type selection UI (when localStorage doesn't have user type)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-white">
      <div className="mb-12">
        <Logo variant="full" size="lg" />
      </div>

      <div className="w-full max-w-[600px]">
        <h1 className="text-h2 text-center mb-2">Complete Your Signup</h1>
        <p className="text-center text-[var(--grey-600)] mb-8">
          Please tell us what type of account you&apos;d like to create
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card
            variant={userType === 'talent' ? 'selected' : 'interactive'}
            className="p-6 text-center"
            onClick={() => !processing && setUserType('talent')}
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
            onClick={() => !processing && setUserType('brand')}
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

        <Button
          className="w-full max-w-[400px] mx-auto block"
          disabled={!userType || processing}
          loading={processing}
          onClick={() => handleTypeSelection(userType)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}