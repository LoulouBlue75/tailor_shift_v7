'use client'

import { Input, Card } from '@/components/ui'
import type { OnboardingData } from '../page'
import { Check } from 'lucide-react'

interface StepProfessionalProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
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

export function StepProfessional({ data, updateData }: StepProfessionalProps) {
  const toggleStoreTier = (tierId: string) => {
    const current = data.store_tier_experience || []
    const updated = current.includes(tierId)
      ? current.filter(t => t !== tierId)
      : [...current, tierId]
    updateData({ store_tier_experience: updated })
  }

  return (
    <div className="space-y-8">
      {/* Role Level */}
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
              onClick={() => updateData({ current_role_level: level.id })}
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

      {/* Location */}
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
