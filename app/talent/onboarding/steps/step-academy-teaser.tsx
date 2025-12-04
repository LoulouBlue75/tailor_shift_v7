'use client'

import { Card } from '@/components/ui'
import type { OnboardingData } from '../page'
import { GraduationCap, BookOpen, Target, Briefcase, Users, Check } from 'lucide-react'

interface StepAcademyTeaserProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const INTEREST_AREAS = [
  { id: 'fashion', label: 'Fashion & Ready-to-Wear', icon: '👗', description: 'Clothing, haute couture, and prêt-à-porter' },
  { id: 'leather_goods', label: 'Leather Goods & Accessories', icon: '👜', description: 'Bags, small leather goods, luggage' },
  { id: 'beauty', label: 'Beauty & Fragrance', icon: '💄', description: 'Cosmetics, skincare, and perfumes' },
  { id: 'watches_jewelry', label: 'Watches & Jewelry', icon: '⌚', description: 'Fine jewelry and haute horlogerie' },
  { id: 'hospitality', label: 'Hospitality & Client Experience', icon: '🤝', description: 'VIP services and luxury hospitality' },
]

const ACADEMY_BENEFITS = [
  { 
    icon: BookOpen, 
    title: 'Foundational Training', 
    desc: 'Learn the fundamentals of luxury retail excellence' 
  },
  { 
    icon: Target, 
    title: 'Brand Culture', 
    desc: 'Understand what makes luxury brands unique' 
  },
  { 
    icon: Briefcase, 
    title: 'Career Preparation', 
    desc: 'Get ready for entry-level positions' 
  },
  { 
    icon: Users, 
    title: 'Direct Connections', 
    desc: 'Connect with hiring brands when ready' 
  },
]

export function StepAcademyTeaser({ data, updateData }: StepAcademyTeaserProps) {
  const toggleInterest = (areaId: string) => {
    const current = data.academy_interest_areas || []
    const updated = current.includes(areaId)
      ? current.filter(a => a !== areaId)
      : [...current, areaId]
    updateData({ academy_interest_areas: updated })
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8 -mx-8 -mt-8 px-8 bg-gradient-to-b from-[var(--gold-light)] to-transparent rounded-t-[var(--radius-lg)]">
        <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
          <GraduationCap className="w-10 h-10 text-[var(--gold)]" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--charcoal)]">
          Welcome to TailorShift Academy
        </h2>
        <p className="text-[var(--grey-600)] mt-2 max-w-md mx-auto">
          Your pathway into the world of luxury retail
        </p>
      </div>

      {/* Introduction Message */}
      <div className="bg-[var(--ivory)] rounded-lg p-5 border border-[var(--grey-200)]">
        <p className="text-[var(--charcoal)]">
          Thank you for your interest in luxury retail! <strong>TailorShift Academy</strong> is 
          currently being developed to help aspiring professionals like you enter the world of 
          luxury retail with the right skills and knowledge.
        </p>
        <p className="text-[var(--grey-600)] mt-3 text-sm">
          We'll notify you as soon as Academy launches. In the meantime, tell us about your 
          interests so we can tailor the experience for you.
        </p>
      </div>

      {/* Benefits Grid */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--charcoal)] mb-4 uppercase tracking-wide">
          What you'll get
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {ACADEMY_BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--gold-light)] flex items-center justify-center shrink-0">
                  <benefit.icon className="w-5 h-5 text-[var(--gold-dark)]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[var(--charcoal)]">{benefit.title}</h4>
                  <p className="text-xs text-[var(--grey-600)] mt-0.5">{benefit.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interest Areas Selection */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--charcoal)] mb-2 uppercase tracking-wide">
          Your interests
        </h3>
        <p className="text-sm text-[var(--grey-600)] mb-4">
          What areas of luxury retail interest you most? <span className="text-[var(--grey-500)]">(select all that apply)</span>
        </p>
        <div className="space-y-2">
          {INTEREST_AREAS.map((area) => {
            const isSelected = (data.academy_interest_areas || []).includes(area.id)
            return (
              <Card
                key={area.id}
                variant={isSelected ? 'selected' : 'interactive'}
                className="p-4 cursor-pointer transition-all"
                onClick={() => toggleInterest(area.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{area.icon}</span>
                    <div>
                      <span className="font-medium text-[var(--charcoal)]">{area.label}</span>
                      <p className="text-xs text-[var(--grey-500)] mt-0.5">{area.description}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[var(--gold)] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Motivation (optional) */}
      <div>
        <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2 uppercase tracking-wide">
          Your motivation <span className="text-[var(--grey-500)] font-normal normal-case">(optional)</span>
        </label>
        <p className="text-sm text-[var(--grey-600)] mb-3">
          Why do you want to work in luxury retail? This helps us understand your goals.
        </p>
        <textarea
          className="w-full p-4 border border-[var(--grey-300)] rounded-lg resize-none focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold-light)] focus:outline-none transition-all"
          rows={4}
          placeholder="I've always been passionate about fashion and luxury brands. I'm particularly drawn to the art of clienteling and creating memorable experiences for clients..."
          value={data.academy_motivation || ''}
          onChange={(e) => updateData({ academy_motivation: e.target.value })}
        />
        <p className="text-xs text-[var(--grey-500)] mt-2">
          Your response is private and won't be shared with brands.
        </p>
      </div>

      {/* Promise / Next Steps */}
      <div className="bg-[var(--charcoal)] text-white rounded-lg p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--gold)] flex items-center justify-center">
            <span className="text-lg">✉️</span>
          </div>
          <h4 className="font-semibold">What happens next?</h4>
        </div>
        <ul className="space-y-2 text-sm text-[var(--grey-300)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--gold)]">1.</span>
            You'll be added to our Academy waitlist
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--gold)]">2.</span>
            We'll send you an email when Academy launches
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--gold)]">3.</span>
            You can still browse and add Dream Brands to your profile
          </li>
        </ul>
      </div>
    </div>
  )
}