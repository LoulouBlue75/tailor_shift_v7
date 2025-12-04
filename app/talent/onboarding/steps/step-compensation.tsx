'use client'

import { Input, Card } from '@/components/ui'
import type { OnboardingData } from '../page'
import { Check, DollarSign, Target, Lock, Unlock, Euro, PoundSterling, CircleDollarSign } from 'lucide-react'

interface StepCompensationProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

const CURRENCIES = [
  { id: 'EUR', name: 'Euro', symbol: '€', icon: Euro },
  { id: 'GBP', name: 'British Pound', symbol: '£', icon: PoundSterling },
  { id: 'USD', name: 'US Dollar', symbol: '$', icon: CircleDollarSign },
  { id: 'CHF', name: 'Swiss Franc', symbol: 'CHF', icon: CircleDollarSign },
  { id: 'AED', name: 'UAE Dirham', symbol: 'د.إ', icon: CircleDollarSign },
]

const FLEXIBILITY_OPTIONS = [
  { 
    id: 'flexible', 
    name: 'Willing to Discuss', 
    desc: 'Open to negotiation for the right opportunity',
    icon: Unlock,
    color: 'bg-[var(--success-light)] text-[var(--success)]'
  },
  { 
    id: 'firm', 
    name: 'This is My Minimum', 
    desc: 'My expectations are non-negotiable',
    icon: Lock,
    color: 'bg-[var(--gold-light)] text-[var(--gold-dark)]'
  },
]

export function StepCompensation({ data, updateData }: StepCompensationProps) {
  // Format number with thousands separator for display
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) return ''
    return value.toLocaleString('en-US')
  }

  // Parse formatted number back to raw number
  const parseNumber = (value: string): number | null => {
    const cleaned = value.replace(/[^0-9]/g, '')
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) ? null : parsed
  }

  return (
    <div className="space-y-8">
      {/* Current Package Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-[var(--gold-dark)]" />
          </div>
          <h3 className="font-medium text-[var(--charcoal)]">Current Package</h3>
        </div>

        <div className="space-y-4 pl-10">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
              Currency
            </label>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((currency) => {
                const isSelected = data.currency === currency.id
                return (
                  <button
                    key={currency.id}
                    type="button"
                    onClick={() => updateData({ currency: currency.id })}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2
                      ${isSelected 
                        ? 'bg-[var(--charcoal)] text-white' 
                        : 'bg-[var(--grey-100)] text-[var(--grey-700)] hover:bg-[var(--grey-200)]'
                      }
                    `}
                  >
                    {currency.symbol} {currency.id}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Base Salary */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Annual Base Salary (Gross)"
              type="text"
              inputMode="numeric"
              placeholder="45,000"
              value={formatNumber(data.current_base)}
              onChange={(e) => updateData({ current_base: parseNumber(e.target.value) })}
              hint={`Your fixed annual salary in ${data.currency || 'EUR'}`}
            />
            <Input
              label="Annual Variable/Bonus"
              type="text"
              inputMode="numeric"
              placeholder="8,000"
              value={formatNumber(data.current_variable)}
              onChange={(e) => updateData({ current_variable: parseNumber(e.target.value) })}
              hint="Optional - commissions, bonuses, etc."
            />
          </div>
        </div>
      </div>

      {/* Expectations Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
            <Target className="w-4 h-4 text-[var(--gold-dark)]" />
          </div>
          <h3 className="font-medium text-[var(--charcoal)]">Your Expectations</h3>
        </div>

        <div className="space-y-4 pl-10">
          {/* Target Package */}
          <Input
            label="Target Total Package"
            type="text"
            inputMode="numeric"
            placeholder="60,000"
            value={formatNumber(data.expectations)}
            onChange={(e) => updateData({ expectations: parseNumber(e.target.value) })}
            hint={`What you're looking for in your next role (in ${data.currency || 'EUR'})`}
          />

          {/* Flexibility */}
          <div>
            <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
              How flexible are you on compensation?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {FLEXIBILITY_OPTIONS.map((option) => {
                const isSelected = data.salary_flexibility === option.id
                const Icon = option.icon

                return (
                  <Card
                    key={option.id}
                    variant={isSelected ? 'selected' : 'interactive'}
                    className="p-4 cursor-pointer"
                    onClick={() => updateData({ salary_flexibility: option.id as 'flexible' | 'firm' })}
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
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-[var(--grey-100)] rounded-[var(--radius-md)] p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.hide_exact_figures}
            onChange={(e) => updateData({ hide_exact_figures: e.target.checked })}
            className="mt-1 w-4 h-4 rounded border-[var(--grey-300)] text-[var(--gold)] focus:ring-[var(--gold)]"
          />
          <div>
            <span className="font-medium text-sm text-[var(--charcoal)] block">
              🔒 Keep my exact figures private
            </span>
            <span className="text-small text-[var(--grey-600)]">
              Brands will only see if you're within their budget range, not your exact salary
            </span>
          </div>
        </label>
      </div>

      {/* Info Note */}
      <div className="text-small text-[var(--grey-500)] text-center">
        <p>💡 This information is confidential and used only to improve matching accuracy.</p>
        <p className="mt-1">You can update it anytime from your profile settings.</p>
      </div>
    </div>
  )
}