'use client'

import { Input } from '@/components/ui'
import type { OnboardingData } from '../page'

interface StepIdentityProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

export function StepIdentity({ data, updateData }: StepIdentityProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          value={data.first_name}
          onChange={(e) => updateData({ first_name: e.target.value })}
          required
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          value={data.last_name}
          onChange={(e) => updateData({ last_name: e.target.value })}
          required
        />
      </div>
      
      <Input
        label="Phone Number"
        placeholder="+33 6 12 34 56 78"
        type="tel"
        value={data.phone}
        onChange={(e) => updateData({ phone: e.target.value })}
        hint="Optional - for urgent communications only"
      />
      
      <Input
        label="LinkedIn Profile"
        placeholder="https://linkedin.com/in/yourprofile"
        type="url"
        value={data.linkedin_url}
        onChange={(e) => updateData({ linkedin_url: e.target.value })}
        hint="Optional - helps us verify your experience"
      />
    </div>
  )
}
