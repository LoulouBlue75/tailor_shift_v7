'use client'

import { Input, Card } from '@/components/ui'
import type { OnboardingData } from '../page'
import { Check, MapPin, Globe, Building, Zap, Clock, Search, Pause } from 'lucide-react'

interface StepPreferencesProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const ROLE_LEVELS = [
  { id: 'L1', name: 'Sales Associate' },
  { id: 'L2', name: 'Senior Sales' },
  { id: 'L3', name: 'Team Lead' },
  { id: 'L4', name: 'Assistant Manager' },
  { id: 'L5', name: 'Store Manager' },
  { id: 'L6', name: 'Area Manager' },
  { id: 'L7', name: 'Regional Director' },
  { id: 'L8', name: 'VP / Executive' },
]

const MOBILITY_OPTIONS = [
  { id: 'local', name: 'Local Only', desc: 'Same city', icon: MapPin },
  { id: 'regional', name: 'Regional', desc: 'Same region', icon: Building },
  { id: 'national', name: 'National', desc: 'Anywhere in country', icon: Globe },
  { id: 'international', name: 'International', desc: 'Open to relocate globally', icon: Globe },
]

const TIMELINE_OPTIONS = [
  { id: 'active', name: 'Actively Looking', desc: 'Ready to interview now', icon: Search, color: 'bg-[var(--success-light)] text-[var(--success)]' },
  { id: 'passive', name: 'Open to Opportunities', desc: 'Right opportunity only', icon: Clock, color: 'bg-[var(--gold-light)] text-[var(--gold-dark)]' },
  { id: 'not_looking', name: 'Not Looking', desc: 'Just exploring', icon: Pause, color: 'bg-[var(--grey-100)] text-[var(--grey-600)]' },
]

export function StepPreferences({ data, updateData }: StepPreferencesProps) {
  const toggleTargetRole = (roleId: string) => {
    const current = data.target_role_levels
    const updated = current.includes(roleId)
      ? current.filter(r => r !== roleId)
      : [...current, roleId]
    updateData({ target_role_levels: updated })
  }

  return (
    <div className="space-y-8">
      {/* Timeline / Status */}
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
          Your current job search status <span className="text-[var(--error)]">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {TIMELINE_OPTIONS.map((option) => {
            const isSelected = data.timeline === option.id
            const Icon = option.icon

            return (
              <Card
                key={option.id}
                variant={isSelected ? 'selected' : 'interactive'}
                className="p-4 cursor-pointer"
                onClick={() => updateData({ timeline: option.id })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-medium text-sm block">{option.name}</span>
                      <span className="text-small text-[var(--grey-600)]">{option.desc}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-[var(--gold)]" />
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Target Role Levels */}
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
          Target role levels (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLE_LEVELS.map((role) => {
            const isSelected = data.target_role_levels.includes(role.id)
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleTargetRole(role.id)}
                className={`
                  px-3 py-2 rounded-full text-sm font-medium transition-colors
                  ${isSelected 
                    ? 'bg-[var(--charcoal)] text-white' 
                    : 'bg-[var(--grey-100)] text-[var(--grey-700)] hover:bg-[var(--grey-200)]'
                  }
                `}
              >
                {role.id} • {role.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobility */}
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
          Geographic mobility
        </label>
        <div className="grid grid-cols-2 gap-3">
          {MOBILITY_OPTIONS.map((option) => {
            const isSelected = data.mobility === option.id
            const Icon = option.icon

            return (
              <Card
                key={option.id}
                variant={isSelected ? 'selected' : 'interactive'}
                className="p-4 cursor-pointer"
                onClick={() => updateData({ mobility: option.id })}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[var(--gold)]' : 'text-[var(--grey-500)]'}`} />
                  <div>
                    <span className="font-medium text-sm block">{option.name}</span>
                    <span className="text-small text-[var(--grey-600)]">{option.desc}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Target Locations */}
      <Input
        label="Preferred Locations"
        placeholder="Paris, London, Milan..."
        value={data.target_locations.join(', ')}
        onChange={(e) => {
          // Don't filter empty strings while typing - let user type commas freely
          const rawValue = e.target.value
          // Split by comma but preserve empty strings to allow typing commas
          const locations = rawValue.split(',').map(s => s.trim())
          updateData({ target_locations: locations })
        }}
        onBlur={(e) => {
          // On blur, clean up the array by removing empty strings
          const cleanedLocations = data.target_locations.filter(s => s !== '')
          updateData({ target_locations: cleanedLocations })
        }}
        hint="Separate multiple cities with commas"
      />
    </div>
  )
}
