'use client'

import { Card } from '@/components/ui'
import type { OnboardingData } from '../page'
import { Check, Shirt, Watch, Gem, Sparkles, Eye, ShoppingBag, Footprints, Package } from 'lucide-react'

interface StepDivisionsProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const DIVISIONS = [
  { id: 'fashion', name: 'Fashion & Ready-to-Wear', icon: Shirt },
  { id: 'leather_goods', name: 'Leather Goods & Bags', icon: ShoppingBag },
  { id: 'shoes', name: 'Shoes & Footwear', icon: Footprints },
  { id: 'watches', name: 'Watches & Fine Watchmaking', icon: Watch },
  { id: 'high_jewelry', name: 'High Jewelry & Fine Jewelry', icon: Gem },
  { id: 'beauty', name: 'Beauty & Skincare', icon: Sparkles },
  { id: 'fragrance', name: 'Fragrance & Perfumery', icon: Package },
  { id: 'eyewear', name: 'Eyewear & Optical', icon: Eye },
  { id: 'accessories', name: 'Accessories & Small Leather', icon: Package },
]

export function StepDivisions({ data, updateData }: StepDivisionsProps) {
  const toggleDivision = (divisionId: string) => {
    const current = data.divisions_expertise
    const updated = current.includes(divisionId)
      ? current.filter(d => d !== divisionId)
      : [...current, divisionId]
    updateData({ divisions_expertise: updated })
  }

  return (
    <div className="space-y-6">
      <p className="text-[var(--grey-600)]">
        Select all product divisions you have experience with. This helps us match you with relevant opportunities.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DIVISIONS.map((division) => {
          const isSelected = data.divisions_expertise.includes(division.id)
          const Icon = division.icon

          return (
            <Card
              key={division.id}
              variant={isSelected ? 'selected' : 'interactive'}
              className="p-4 cursor-pointer"
              onClick={() => toggleDivision(division.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isSelected ? 'bg-[var(--gold-light)]' : 'bg-[var(--grey-100)]'}
                  `}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[var(--gold)]' : 'text-[var(--grey-600)]'}`} />
                  </div>
                  <span className={`font-medium text-sm ${isSelected ? 'text-[var(--charcoal)]' : 'text-[var(--grey-700)]'}`}>
                    {division.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[var(--gold)] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {data.divisions_expertise.length > 0 && (
        <p className="text-small text-[var(--grey-500)]">
          {data.divisions_expertise.length} division{data.divisions_expertise.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}
