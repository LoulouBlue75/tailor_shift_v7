'use client'

import { Input, Card } from '@/components/ui'
import type { OnboardingData } from '../page'
import { Check, Sparkles } from 'lucide-react'

interface StepProfessionalProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  onNoExperienceSelected?: () => void  // Callback when L0 is selected
}

// L0 = No experience, Academy candidate
const NO_EXPERIENCE_OPTION = {
  id: 'L0',
  name: 'New to Retail',
  desc: "I don't have retail experience yet, but I want to start a career in luxury retail",
  isNoExperience: true,
}

const ROLE_LEVELS = [
  { id: 'L1', name: 'Sales Associate', desc: 'Entry-level, 0-2 years' },
  { id: 'L2', name: 'Senior Sales Associate', desc: '2-4 years experience' },
  { id: 'L3', name: 'Team Lead / Expert', desc: '4-6 years, specialist role' },
  { id: 'L4', name: 'Assistant Manager', desc: '5-8 years, supervisory' },
  { id: 'L5', name: 'Store Manager', desc: '8+ years, full P&L' },
  { id: 'L6', name: 'Area Manager', desc: 'Multi-store responsibility' },
  { id: 'L7', name: 'Regional Director', desc: 'Regional leadership' },
  { id: 'L8', name: 'VP / Country Manager', desc: 'Executive level' },
]

const STORE_TIERS = [
  { id: 'T1', name: 'Flagship', desc: 'Capital city flagship stores' },
  { id: 'T2', name: 'Premier', desc: 'Major city, high volume' },
  { id: 'T3', name: 'Standard', desc: 'Regional city locations' },
  { id: 'T4', name: 'Outlet', desc: 'Outlet & travel retail' },
  { id: 'T5', name: 'Pop-up / Seasonal', desc: 'Temporary locations' },
]

export function StepProfessional({ data, updateData, onNoExperienceSelected }: StepProfessionalProps) {
  const isNoExperience = data.current_role_level === 'L0'

  const toggleStoreTier = (tierId: string) => {
    const current = data.store_tier_experience || []
    const updated = current.includes(tierId)
      ? current.filter(t => t !== tierId)
      : [...current, tierId]
    updateData({ store_tier_experience: updated })
  }

  const handleRoleLevelSelect = (levelId: string) => {
    updateData({ current_role_level: levelId })
    
    // If L0 selected, trigger callback for branching
    if (levelId === 'L0' && onNoExperienceSelected) {
      onNoExperienceSelected()
    }
  }

  return (
    <div className="space-y-8">
      {/* NO EXPERIENCE OPTION - Highlighted at top */}
      <div>
        <Card
          variant={isNoExperience ? 'selected' : 'interactive'}
          className={`p-5 cursor-pointer border-2 transition-all ${
            isNoExperience
              ? 'border-[var(--gold)] bg-gradient-to-r from-[var(--gold-light)] to-[var(--ivory)]'
              : 'border-dashed border-[var(--grey-300)] hover:border-[var(--gold)] hover:bg-[var(--gold-light)]'
          }`}
          onClick={() => handleRoleLevelSelect('L0')}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isNoExperience ? 'bg-[var(--gold)]' : 'bg-[var(--grey-100)]'
            }`}>
              <Sparkles className={`w-6 h-6 ${isNoExperience ? 'text-white' : 'text-[var(--gold)]'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-[var(--charcoal)]">{NO_EXPERIENCE_OPTION.name}</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--gold-light)] text-[var(--gold-dark)]">
                  Academy Path
                </span>
              </div>
              <p className="text-sm text-[var(--grey-600)] mt-1">{NO_EXPERIENCE_OPTION.desc}</p>
              {isNoExperience && (
                <p className="text-sm text-[var(--gold-dark)] mt-2 font-medium">
                  → You'll be invited to TailorShift Academy when it launches
                </p>
              )}
            </div>
            {isNoExperience && (
              <Check className="w-5 h-5 text-[var(--gold)] shrink-0" />
            )}
          </div>
        </Card>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[var(--grey-200)]" />
        <span className="text-sm text-[var(--grey-500)] font-medium">or select your current level</span>
        <div className="flex-1 h-px bg-[var(--grey-200)]" />
      </div>

      {/* STANDARD ROLE LEVELS */}
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
          Current Role Level <span className="text-[var(--error)]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_LEVELS.map((level) => (
            <Card
              key={level.id}
              variant={data.current_role_level === level.id ? 'selected' : 'interactive'}
              className="p-4 cursor-pointer"
              onClick={() => handleRoleLevelSelect(level.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-[var(--grey-500)]">{level.id}</span>
                    <span className="font-medium text-sm">{level.name}</span>
                  </div>
                  <p className="text-small text-[var(--grey-600)] mt-1">{level.desc}</p>
                </div>
                {data.current_role_level === level.id && (
                  <Check className="w-4 h-4 text-[var(--gold)] shrink-0" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Store Tier - Multi-select */}
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
          Store Tier Experience <span className="text-[var(--grey-500)] font-normal">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {STORE_TIERS.map((tier) => {
            const isSelected = (data.store_tier_experience || []).includes(tier.id)
            return (
              <Card
                key={tier.id}
                variant={isSelected ? 'selected' : 'interactive'}
                className="p-3 cursor-pointer"
                onClick={() => toggleStoreTier(tier.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded flex items-center justify-center text-caption font-medium ${
                      isSelected ? 'bg-[var(--gold-light)] text-[var(--gold-dark)]' : 'bg-[var(--grey-100)]'
                    }`}>
                      {tier.id}
                    </span>
                    <div>
                      <span className="font-medium text-sm">{tier.name}</span>
                      <span className="text-small text-[var(--grey-500)] ml-2">{tier.desc}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[var(--gold)]" />
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Show additional fields only for experienced talents (not L0) */}
      {!isNoExperience && (
        <>
          {/* Years in Luxury */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Years in Luxury Retail"
              type="number"
              min={0}
              max={50}
              placeholder="5"
              value={data.years_in_luxury || ''}
              onChange={(e) => updateData({ years_in_luxury: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Current Maison"
              placeholder="e.g., Louis Vuitton"
              value={data.current_employer}
              onChange={(e) => updateData({ current_employer: e.target.value })}
              hint="Optional"
            />
          </div>
        </>
      )}

      {/* Location - always required */}
      <Input
        label="Current Location"
        placeholder="Paris, France"
        value={data.current_location}
        onChange={(e) => updateData({ current_location: e.target.value })}
        required
      />
    </div>
  )
}
