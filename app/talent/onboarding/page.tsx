'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Logo, UserMenu } from '@/components/ui'
import { StepIdentity } from './steps/step-identity'
import { StepProfessional } from './steps/step-professional'
import { StepDivisions } from './steps/step-divisions'
import { StepPreferences } from './steps/step-preferences'
import { StepCompensation } from './steps/step-compensation'
import { StepDreamBrands } from './steps/step-dream-brands'
import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, name: 'About you', description: "Let's start with the essentials" },
  { id: 2, name: 'Your experience', description: 'Where you stand today' },
  { id: 3, name: 'Your expertise', description: 'The areas you know best' },
  { id: 4, name: 'Your aspirations', description: 'Where you want to move next' },
  { id: 5, name: 'Compensation', description: 'Help us match you accurately' },
  { id: 6, name: 'Dream Brands', description: 'Where would you love to work?' },
]

export interface OnboardingData {
  // Step 1: Identity
  first_name: string
  last_name: string
  phone: string
  linkedin_url: string
  // Step 2: Professional
  current_role_level: string
  store_tier_experience: string[]  // Changed to array for multi-select
  years_in_luxury: number
  current_employer: string  // Renamed from current_maison to match DB column
  current_location: string
  // Step 3: Divisions
  divisions_expertise: string[]
  // Step 4: Preferences
  target_role_levels: string[]
  target_locations: string[]
  mobility: string
  timeline: string
  // Step 5: Compensation
  current_base: number | null
  current_variable: number | null
  currency: string
  expectations: number | null
  salary_flexibility: 'flexible' | 'firm'
  hide_exact_figures: boolean
  // Step 6: Dream Brands
  target_brands: string[]
}

const initialData: OnboardingData = {
  first_name: '',
  last_name: '',
  phone: '',
  linkedin_url: '',
  current_role_level: '',
  store_tier_experience: [],  // Changed to array
  years_in_luxury: 0,
  current_employer: '',  // Renamed from current_maison to match DB column
  current_location: '',
  divisions_expertise: [],
  target_role_levels: [],
  target_locations: [],
  mobility: 'national',
  timeline: 'passive',
  // Compensation defaults
  current_base: null,
  current_variable: null,
  currency: 'EUR',
  expectations: null,
  salary_flexibility: 'flexible',
  hide_exact_figures: true,
  // Dream Brands defaults
  target_brands: [],
}

export default function TalentOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [talentId, setTalentId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Load existing talent data
  useEffect(() => {
    const loadTalentData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      setUserEmail(user.email || null)

      const { data: talent } = await supabase
        .from('talents')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (talent) {
        setTalentId(talent.id)
        // Extract compensation profile with proper typing
        const compensationProfile = talent.compensation_profile as {
          current_base?: number | null
          current_variable?: number | null
          currency?: string
          expectations?: number | null
          salary_flexibility?: 'flexible' | 'firm'
          hide_exact_figures?: boolean
        } | null

        setData({
          first_name: talent.first_name || '',
          last_name: talent.last_name || '',
          phone: talent.phone || '',
          linkedin_url: talent.linkedin_url || '',
          current_role_level: talent.current_role_level || '',
          store_tier_experience: talent.store_tier_experience || [],
          years_in_luxury: talent.years_in_luxury || 0,
          current_employer: talent.current_employer || '',  // Fixed: use current_employer
          current_location: talent.current_location || '',
          divisions_expertise: talent.divisions_expertise || [],
          target_role_levels: talent.career_preferences?.target_role_levels || [],
          target_locations: talent.career_preferences?.target_locations || [],
          target_brands: talent.career_preferences?.target_brands || [],
          mobility: talent.career_preferences?.mobility || 'national',
          timeline: talent.career_preferences?.timeline || 'passive',
          // Load compensation data
          current_base: compensationProfile?.current_base ?? null,
          current_variable: compensationProfile?.current_variable ?? null,
          currency: compensationProfile?.currency || 'EUR',
          expectations: compensationProfile?.expectations ?? null,
          salary_flexibility: compensationProfile?.salary_flexibility || 'flexible',
          hide_exact_figures: compensationProfile?.hide_exact_figures ?? true,
        })
      }
    }
    loadTalentData()
  }, [supabase, router])

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated - please log in again')

      // Clean up target_locations before saving (remove empty strings)
      const cleanedTargetLocations = data.target_locations.filter(s => s !== '')

      // Calculate profile completion
      let completion = 0
      if (data.first_name && data.last_name) completion += 20
      if (data.current_role_level && data.store_tier_experience.length > 0) completion += 25
      if (data.divisions_expertise.length > 0) completion += 25
      if (data.target_role_levels.length > 0 && data.timeline) completion += 30

      // Update talent record including compensation profile
      const { error: talentError } = await supabase
        .from('talents')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          linkedin_url: data.linkedin_url || null,
          current_role_level: data.current_role_level || null,
          store_tier_experience: data.store_tier_experience,
          years_in_luxury: data.years_in_luxury || null,
          current_employer: data.current_employer || null,  // Fixed: use current_employer
          current_location: data.current_location || null,
          divisions_expertise: data.divisions_expertise,
          // Detect internal mobility: if current employer is in target_brands
          internal_mobility_interest: data.current_employer
            ? data.target_brands.some(b => b.toLowerCase() === data.current_employer.toLowerCase())
            : false,
          career_preferences: {
            target_role_levels: data.target_role_levels,
            target_locations: cleanedTargetLocations,
            target_brands: data.target_brands,
            mobility: data.mobility,
            timeline: data.timeline,
          },
          // Save compensation profile as JSONB
          compensation_profile: {
            current_base: data.current_base,
            current_variable: data.current_variable,
            currency: data.currency,
            expectations: data.expectations,
            salary_flexibility: data.salary_flexibility,
            hide_exact_figures: data.hide_exact_figures,
          },
          status: 'pending_review',
          profile_completion_pct: completion,
        })
        .eq('profile_id', user.id)

      if (talentError) {
        console.error('Talent update error:', talentError)
        throw new Error(`Failed to update profile: ${talentError.message}`)
      }

      // Update profile as onboarding completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          full_name: `${data.first_name} ${data.last_name}`,
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw new Error(`Failed to complete onboarding: ${profileError.message}`)
      }

      router.push('/talent/dashboard')
    } catch (err) {
      console.error('Error completing onboarding:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepIdentity data={data} updateData={updateData} />
      case 2:
        return <StepProfessional data={data} updateData={updateData} />
      case 3:
        return <StepDivisions data={data} updateData={updateData} />
      case 4:
        return <StepPreferences data={data} updateData={updateData} />
      case 5:
        return <StepCompensation data={data} updateData={updateData} />
      case 6:
        return <StepDreamBrands data={data} updateData={updateData} />
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.first_name.trim() !== '' && data.last_name.trim() !== ''
      case 2:
        return data.current_role_level !== '' && data.current_location.trim() !== ''
      case 3:
        return data.divisions_expertise.length > 0
      case 4:
        return data.timeline !== ''
      case 5:
        // Compensation step is optional - always allow proceeding
        // But encourage filling if expectations are set
        return true
      case 6:
        // Dream Brands is optional but recommended
        return true
      default:
        return false
    }
  }

  // Get user initials for the menu
  const userInitials = data.first_name && data.last_name
    ? `${data.first_name[0]}${data.last_name[0]}`.toUpperCase()
    : userEmail
      ? userEmail[0].toUpperCase()
      : '?'
  
  const userFullName = data.first_name && data.last_name
    ? `${data.first_name} ${data.last_name}`
    : undefined

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-small text-[var(--grey-500)]">
              Step {currentStep} of {STEPS.length}
            </span>
            <UserMenu
              initials={userInitials}
              fullName={userFullName}
              email={userEmail || undefined}
            />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-[var(--grey-200)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${currentStep > step.id 
                      ? 'bg-[var(--gold)] text-white' 
                      : currentStep === step.id 
                        ? 'bg-[var(--charcoal)] text-white' 
                        : 'bg-[var(--grey-200)] text-[var(--grey-600)]'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`
                    mt-2 text-small font-medium hidden sm:block
                    ${currentStep >= step.id ? 'text-[var(--charcoal)]' : 'text-[var(--grey-500)]'}
                  `}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-4
                    ${currentStep > step.id ? 'bg-[var(--gold)]' : 'bg-[var(--grey-200)]'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--grey-200)] p-8">
          <h1 className="text-h2 mb-2">{STEPS[currentStep - 1].name}</h1>
          <p className="text-[var(--grey-600)] mb-8">{STEPS[currentStep - 1].description}</p>
          
          {error && (
            <div className="mb-6 p-4 rounded-[var(--radius-md)] bg-[var(--error-light)] border border-[var(--error)] text-[var(--error)]">
              <p className="text-sm font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--grey-200)]">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            {currentStep === STEPS.length ? (
              <Button
                onClick={handleComplete}
                loading={loading}
                disabled={!canProceed()}
              >
                Complete Profile
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
