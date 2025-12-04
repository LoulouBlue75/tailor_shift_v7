'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Logo, Card } from '@/components/ui'
import { Check, Upload, Building2, Gem, Watch, Sparkles, ShoppingBag, Shirt, AlertTriangle } from 'lucide-react'
import { validateBrandEmail } from '@/lib/auth/domain-validation'

const STEPS = [
  { id: 1, name: 'Brand Identity', description: 'Tell us about your maison' },
  { id: 2, name: 'Divisions', description: 'Your product categories' },
  { id: 3, name: 'Contact', description: 'Primary contact person' },
]

const SEGMENTS = [
  { id: 'ultra_luxury', name: 'Ultra Luxury', desc: 'Hermès, Chanel, Patek Philippe level' },
  { id: 'luxury', name: 'Luxury', desc: 'Louis Vuitton, Gucci, Cartier level' },
  { id: 'premium', name: 'Premium', desc: 'Coach, Michael Kors, Tag Heuer level' },
  { id: 'accessible_luxury', name: 'Accessible Luxury', desc: 'Contemporary & accessible brands' },
]

const DIVISIONS = [
  { id: 'fashion', name: 'Fashion', icon: Shirt },
  { id: 'leather_goods', name: 'Leather Goods', icon: ShoppingBag },
  { id: 'watches', name: 'Watches', icon: Watch },
  { id: 'high_jewelry', name: 'High Jewelry', icon: Gem },
  { id: 'beauty', name: 'Beauty', icon: Sparkles },
  { id: 'fragrance', name: 'Fragrance', icon: Sparkles },
  { id: 'eyewear', name: 'Eyewear', icon: Building2 },
  { id: 'shoes', name: 'Shoes', icon: ShoppingBag },
  { id: 'accessories', name: 'Accessories', icon: ShoppingBag },
]

export interface BrandOnboardingData {
  name: string
  website: string
  segment: string
  headquarters_location: string
  divisions: string[]
  contact_name: string
  contact_role: string
  contact_email: string
  contact_phone: string
}

const initialData: BrandOnboardingData = {
  name: '',
  website: '',
  segment: '',
  headquarters_location: '',
  divisions: [],
  contact_name: '',
  contact_role: '',
  contact_email: '',
  contact_phone: '',
}

export default function BrandOnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<BrandOnboardingData>(initialData)
  const [loading, setLoading] = useState(false)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean
    message?: string
    requiresReview: boolean
  } | null>(null)

  useEffect(() => {
    const loadBrandData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch both brand data and profile data
      const [{ data: brand }, { data: profile }] = await Promise.all([
        supabase
          .from('brands')
          .select('*')
          .eq('profile_id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single()
      ])

      if (brand) {
        setBrandId(brand.id)
        // Use profile data as fallback for contact info if not set in brand
        setData({
          name: brand.name || '',
          website: brand.website || '',
          segment: brand.segment || '',
          headquarters_location: brand.headquarters_location || '',
          divisions: brand.divisions || [],
          contact_name: brand.contact_name || profile?.full_name || user.user_metadata?.full_name || '',
          contact_role: brand.contact_role || '',
          contact_email: brand.contact_email || profile?.email || user.email || '',
          contact_phone: brand.contact_phone || '',
        })
      }
    }
    loadBrandData()
  }, [supabase, router])

  const updateData = (updates: Partial<BrandOnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))

    // Validate email when contact_email changes
    if (updates.contact_email !== undefined) {
      const validation = validateBrandEmail(updates.contact_email)
      setEmailValidation({
        isValid: validation.isValid,
        message: validation.message,
        requiresReview: validation.requiresManualReview
      })
    }
  }

  const toggleDivision = (divisionId: string) => {
    const current = data.divisions
    const updated = current.includes(divisionId)
      ? current.filter(d => d !== divisionId)
      : [...current, divisionId]
    updateData({ divisions: updated })
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

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Determine brand status based on email validation
      let brandStatus = 'onboarding' // default
      if (emailValidation) {
        if (emailValidation.isValid && !emailValidation.requiresReview) {
          brandStatus = 'verified' // Luxury brand domain - auto verified
        } else if (emailValidation.isValid && emailValidation.requiresReview) {
          brandStatus = 'pending_verification' // Corporate domain - needs manual review
        } else {
          throw new Error(emailValidation.message || 'Email domain not accepted')
        }
      }

      const { error: brandError } = await supabase
        .from('brands')
        .update({
          name: data.name,
          website: data.website || null,
          segment: data.segment || null,
          headquarters_location: data.headquarters_location || null,
          divisions: data.divisions,
          contact_name: data.contact_name || null,
          contact_role: data.contact_role || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          status: brandStatus,
          verified_at: brandStatus === 'verified' ? new Date().toISOString() : null,
        })
        .eq('profile_id', user.id)

      if (brandError) throw brandError

      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          full_name: data.contact_name,
        })
        .eq('id', user.id)

      router.push('/brand/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Could add error state here
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim() !== '' && data.segment !== ''
      case 2:
        return data.divisions.length > 0
      case 3:
        const hasBasicInfo = data.contact_name.trim() !== '' && data.contact_email.trim() !== ''
        const hasValidEmail = emailValidation?.isValid !== false // Allow if not checked yet or valid
        return hasBasicInfo && hasValidEmail
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" />
          <span className="text-small text-[var(--grey-500)]">
            Step {currentStep} of {STEPS.length}
          </span>
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
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`
                    mt-2 text-small font-medium hidden sm:block
                    ${currentStep >= step.id ? 'text-[var(--charcoal)]' : 'text-[var(--grey-500)]'}
                  `}>
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-[var(--gold)]' : 'bg-[var(--grey-200)]'}`} />
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

          {/* Step 1: Brand Identity */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Input
                label="Brand Name"
                placeholder="e.g., Louis Vuitton"
                value={data.name}
                onChange={(e) => updateData({ name: e.target.value })}
                required
              />

              <Input
                label="Website"
                placeholder="https://www.yourbrand.com"
                type="url"
                value={data.website}
                onChange={(e) => updateData({ website: e.target.value })}
              />

              <Input
                label="Headquarters Location"
                placeholder="e.g., Paris, France"
                value={data.headquarters_location}
                onChange={(e) => updateData({ headquarters_location: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium mb-3">
                  Brand Segment <span className="text-[var(--error)]">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {SEGMENTS.map((segment) => (
                    <Card
                      key={segment.id}
                      variant={data.segment === segment.id ? 'selected' : 'interactive'}
                      className="p-4 cursor-pointer"
                      onClick={() => updateData({ segment: segment.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{segment.name}</p>
                          <p className="text-small text-[var(--grey-600)]">{segment.desc}</p>
                        </div>
                        {data.segment === segment.id && (
                          <Check className="w-5 h-5 text-[var(--gold)]" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Divisions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-[var(--grey-600)]">
                Select all product divisions your brand operates in
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DIVISIONS.map((division) => {
                  const isSelected = data.divisions.includes(division.id)
                  const Icon = division.icon
                  return (
                    <Card
                      key={division.id}
                      variant={isSelected ? 'selected' : 'interactive'}
                      className="p-4 cursor-pointer"
                      onClick={() => toggleDivision(division.id)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-[var(--gold)]' : 'text-[var(--grey-600)]'}`} />
                        <span className="text-sm font-medium">{division.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[var(--gold)]" />}
                      </div>
                    </Card>
                  )
                })}
              </div>
              {data.divisions.length > 0 && (
                <p className="text-small text-[var(--grey-500)]">
                  {data.divisions.length} division{data.divisions.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {/* Step 3: Contact */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <p className="text-[var(--grey-600)] mb-4">
                Who will be the primary contact for recruitment activities?
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Contact Name"
                  placeholder="Jean Dupont"
                  value={data.contact_name}
                  onChange={(e) => updateData({ contact_name: e.target.value })}
                  required
                />
                <Input
                  label="Role / Title"
                  placeholder="HR Director"
                  value={data.contact_role}
                  onChange={(e) => updateData({ contact_role: e.target.value })}
                />
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="jean.dupont@brand.com"
                  value={data.contact_email}
                  onChange={(e) => updateData({ contact_email: e.target.value })}
                  required
                />

                {/* Email validation feedback */}
                {data.contact_email && emailValidation && (
                  <div className={`mt-2 p-3 rounded-[var(--radius-md)] text-sm flex items-start gap-2 ${
                    emailValidation.isValid
                      ? emailValidation.requiresReview
                        ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                        : 'bg-[var(--success-light)] text-[var(--success)]'
                      : 'bg-[var(--error-light)] text-[var(--error)]'
                  }`}>
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">
                        {emailValidation.isValid
                          ? emailValidation.requiresReview
                            ? 'Validation manuelle requise'
                            : 'Domaine validé automatiquement'
                          : 'Domaine non accepté'
                        }
                      </p>
                      <p className="text-xs mt-1">{emailValidation.message}</p>
                      {emailValidation.requiresReview && (
                        <p className="text-xs mt-1">
                          Votre compte sera vérifié manuellement par notre équipe avant activation.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Phone"
                type="tel"
                placeholder="+33 1 23 45 67 89"
                value={data.contact_phone}
                onChange={(e) => updateData({ contact_phone: e.target.value })}
                hint="Optional"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--grey-200)]">
            <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
              Back
            </Button>
            
            {currentStep === STEPS.length ? (
              <Button onClick={handleComplete} loading={loading} disabled={!canProceed()}>
                Complete Setup
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
