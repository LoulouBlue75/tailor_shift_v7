'use client'

import { useState } from 'react'
import { Input, Card } from '@/components/ui'
import type { OnboardingData } from '../page'
import {
  Check, DollarSign, Target, Lock, Unlock, Euro, PoundSterling,
  CircleDollarSign, Gift, Briefcase, MapPin, Building2, Info, ChevronDown
} from 'lucide-react'

interface StepCompensationProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

// ============================================================================
// CONSTANTS - Based on Luxury Retail Compensation Matrix
// ============================================================================

// Currencies ordered by frequency of use in luxury retail
const CURRENCIES = [
  // Most common (displayed in quick access)
  { id: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', region: 'Europe' },
  { id: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', region: 'Americas' },
  { id: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', region: 'UK' },
  { id: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', region: 'Switzerland' },
  { id: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', region: 'Middle East' },
  // Asia Pacific
  { id: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', region: 'Asia' },
  { id: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', region: 'Asia' },
  { id: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', region: 'Asia' },
  { id: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', region: 'Asia' },
  { id: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', region: 'Oceania' },
  // Other Europe
  { id: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', region: 'Europe' },
  { id: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', region: 'Europe' },
  { id: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', region: 'Europe' },
  // Middle East
  { id: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦', region: 'Middle East' },
  { id: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦', region: 'Middle East' },
  { id: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', region: 'Middle East' },
  // Americas
  { id: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', region: 'Americas' },
  { id: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', region: 'Americas' },
  { id: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', region: 'Americas' },
]

const CONTRACT_TYPES = [
  { id: 'cdi', name: 'CDI', desc: 'Permanent contract' },
  { id: 'cdd', name: 'CDD', desc: 'Fixed-term contract' },
  { id: 'interim', name: 'Intérim', desc: 'Temporary agency' },
  { id: 'freelance', name: 'Freelance', desc: 'Independent contractor' },
]

const BRAND_SEGMENTS = [
  { id: 'ultra_luxury', name: 'Ultra Luxury', examples: 'Hermès, Chanel', variableRatio: '10-20%' },
  { id: 'luxury', name: 'Luxury', examples: 'LV, Dior, Gucci', variableRatio: '20-35%' },
  { id: 'premium', name: 'Premium', examples: 'Ralph Lauren, Coach', variableRatio: '30-45%' },
  { id: 'accessible_luxury', name: 'Accessible Luxury', examples: 'ba&sh, Maje', variableRatio: '35-50%' },
]

const REGIONS = [
  { id: 'france_paris', name: 'France - Paris', premium: '+15-25%' },
  { id: 'france_province', name: 'France - Province', premium: 'Baseline' },
  { id: 'suisse', name: 'Suisse', premium: '+20-30%' },
  { id: 'uae_dubai', name: 'UAE / Dubaï', premium: '+40-60% (tax-free)' },
  { id: 'emea_other', name: 'Reste EMEA', premium: 'Variable' },
  { id: 'asia', name: 'Asie', premium: '+30-50%' },
  { id: 'americas', name: 'Amériques', premium: 'Variable' },
]

const BENEFITS = [
  { id: 'staff_discount', name: 'Staff Discount', desc: '20-50% off', icon: '🏷️' },
  { id: 'uniform', name: 'Uniform / Allowance', desc: '€300-800/year', icon: '👔' },
  { id: 'tickets_restaurant', name: 'Tickets Restaurant', desc: '€5-9/day', icon: '🍽️' },
  { id: 'mutuelle', name: 'Mutuelle', desc: 'Health insurance', icon: '🏥' },
  { id: 'phone_transport', name: 'Phone / Transport', desc: '€50-150/month', icon: '📱' },
  { id: 'private_sales', name: 'Private Sales Access', desc: 'Early access + discounts', icon: '✨' },
  { id: 'thirteenth_month', name: '13th Month', desc: 'Annual bonus', icon: '💰' },
  { id: 'participation', name: 'Participation / Intéressement', desc: '1-6 months salary', icon: '📈' },
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

// Salary benchmarks by role and segment (in EUR for France)
const SALARY_BENCHMARKS: Record<string, Record<string, { min: number; max: number; avg: number }>> = {
  L1: { // Sales Associate
    ultra_luxury: { min: 28000, max: 35000, avg: 32000 },
    luxury: { min: 26000, max: 32000, avg: 29000 },
    premium: { min: 25000, max: 30000, avg: 27500 },
    accessible_luxury: { min: 24000, max: 28000, avg: 26000 },
  },
  L2: { // Senior Sales Associate
    ultra_luxury: { min: 32000, max: 40000, avg: 36000 },
    luxury: { min: 30000, max: 38000, avg: 34000 },
    premium: { min: 28000, max: 35000, avg: 31500 },
    accessible_luxury: { min: 26000, max: 32000, avg: 29000 },
  },
  L3: { // Team Lead / Expert
    ultra_luxury: { min: 38000, max: 48000, avg: 43000 },
    luxury: { min: 35000, max: 45000, avg: 40000 },
    premium: { min: 32000, max: 42000, avg: 37000 },
    accessible_luxury: { min: 30000, max: 38000, avg: 34000 },
  },
  L4: { // Assistant Manager
    ultra_luxury: { min: 45000, max: 55000, avg: 50000 },
    luxury: { min: 42000, max: 52000, avg: 47000 },
    premium: { min: 38000, max: 48000, avg: 43000 },
    accessible_luxury: { min: 35000, max: 45000, avg: 40000 },
  },
  L5: { // Store Manager
    ultra_luxury: { min: 60000, max: 90000, avg: 75000 },
    luxury: { min: 50000, max: 80000, avg: 65000 },
    premium: { min: 45000, max: 70000, avg: 57500 },
    accessible_luxury: { min: 40000, max: 60000, avg: 50000 },
  },
  L6: { // Area Manager
    ultra_luxury: { min: 80000, max: 120000, avg: 100000 },
    luxury: { min: 70000, max: 100000, avg: 85000 },
    premium: { min: 60000, max: 90000, avg: 75000 },
    accessible_luxury: { min: 55000, max: 80000, avg: 67500 },
  },
  L7: { // Regional Director
    ultra_luxury: { min: 120000, max: 180000, avg: 150000 },
    luxury: { min: 100000, max: 150000, avg: 125000 },
    premium: { min: 90000, max: 130000, avg: 110000 },
    accessible_luxury: { min: 80000, max: 120000, avg: 100000 },
  },
  L8: { // VP / Country Manager
    ultra_luxury: { min: 180000, max: 300000, avg: 240000 },
    luxury: { min: 150000, max: 250000, avg: 200000 },
    premium: { min: 120000, max: 200000, avg: 160000 },
    accessible_luxury: { min: 100000, max: 180000, avg: 140000 },
  },
}

// Variable ratios by role level
const VARIABLE_RATIOS: Record<string, { min: number; max: number }> = {
  L1: { min: 15, max: 25 },
  L2: { min: 18, max: 28 },
  L3: { min: 20, max: 32 },
  L4: { min: 22, max: 35 },
  L5: { min: 25, max: 40 },
  L6: { min: 35, max: 50 },
  L7: { min: 40, max: 60 },
  L8: { min: 50, max: 70 },
}

export function StepCompensation({ data, updateData }: StepCompensationProps) {
  const [showBenchmark, setShowBenchmark] = useState(false)
  
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

  // Get benchmark based on role level and segment
  const getBenchmark = () => {
    const roleLevel = data.current_role_level || 'L1'
    const segment = data.brand_segment || 'luxury'
    return SALARY_BENCHMARKS[roleLevel]?.[segment] || SALARY_BENCHMARKS.L1.luxury
  }

  const benchmark = getBenchmark()
  const variableRatio = VARIABLE_RATIOS[data.current_role_level || 'L1'] || VARIABLE_RATIOS.L1

  // Toggle benefit selection
  const toggleBenefit = (benefitId: string) => {
    const current = data.current_benefits || []
    const updated = current.includes(benefitId)
      ? current.filter(b => b !== benefitId)
      : [...current, benefitId]
    updateData({ current_benefits: updated })
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Contract & Segment (Required Context) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contract Type */}
        <div>
          <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
            Contract Type <span className="text-[var(--error)]">*</span>
          </label>
          <div className="space-y-2">
            {CONTRACT_TYPES.map((contract) => (
              <button
                key={contract.id}
                type="button"
                onClick={() => updateData({ contract_type: contract.id })}
                className={`
                  w-full px-3 py-2 rounded-[var(--radius-md)] text-left text-sm transition-colors
                  flex items-center justify-between
                  ${data.contract_type === contract.id
                    ? 'bg-[var(--charcoal)] text-white'
                    : 'bg-[var(--grey-100)] text-[var(--grey-700)] hover:bg-[var(--grey-200)]'
                  }
                `}
              >
                <span>{contract.name}</span>
                {data.contract_type === contract.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Segment */}
        <div>
          <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
            Current Brand Segment <span className="text-[var(--error)]">*</span>
          </label>
          <div className="space-y-2">
            {BRAND_SEGMENTS.map((segment) => (
              <button
                key={segment.id}
                type="button"
                onClick={() => updateData({ brand_segment: segment.id })}
                className={`
                  w-full px-3 py-2 rounded-[var(--radius-md)] text-left text-sm transition-colors
                  ${data.brand_segment === segment.id
                    ? 'bg-[var(--charcoal)] text-white'
                    : 'bg-[var(--grey-100)] text-[var(--grey-700)] hover:bg-[var(--grey-200)]'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{segment.name}</span>
                  {data.brand_segment === segment.id && <Check className="w-4 h-4" />}
                </div>
                <span className={`text-xs ${data.brand_segment === segment.id ? 'text-white/70' : 'text-[var(--grey-500)]'}`}>
                  {segment.examples}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Region */}
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
          Region <span className="text-[var(--error)]">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => updateData({ compensation_region: region.id })}
              className={`
                px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors text-center
                ${data.compensation_region === region.id
                  ? 'bg-[var(--charcoal)] text-white'
                  : 'bg-[var(--grey-100)] text-[var(--grey-700)] hover:bg-[var(--grey-200)]'
                }
              `}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark Display */}
      {data.brand_segment && data.current_role_level && (
        <div className="bg-[var(--gold-light)] rounded-[var(--radius-md)] p-3 border border-[var(--gold)]">
          <button
            type="button"
            onClick={() => setShowBenchmark(!showBenchmark)}
            className="flex items-center gap-2 text-sm font-medium text-[var(--gold-dark)] w-full"
          >
            <Info className="w-4 h-4" />
            <span>View market benchmarks for your profile</span>
            <span className="ml-auto">{showBenchmark ? '−' : '+'}</span>
          </button>
          {showBenchmark && (
            <div className="mt-3 pt-3 border-t border-[var(--gold)] text-sm text-[var(--gold-dark)]">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-medium">Min</p>
                  <p>€{benchmark.min.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium">Average</p>
                  <p>€{benchmark.avg.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium">Max</p>
                  <p>€{benchmark.max.toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-2 text-xs">
                Variable ratio: {variableRatio.min}%-{variableRatio.max}% of base typical for your level
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Current Package */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
            <DollarSign className="w-3 h-3 text-[var(--gold-dark)]" />
          </div>
          <h3 className="font-medium text-sm text-[var(--charcoal)]">Current Package</h3>
        </div>

        <div className="space-y-4 pl-8">
          {/* Currency Selection - Dropdown with quick access */}
          <div>
            <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">Currency</label>
            <div className="relative">
              <select
                value={data.currency}
                onChange={(e) => updateData({ currency: e.target.value })}
                className="
                  w-full px-4 py-2.5 pr-10 rounded-[var(--radius-md)] border border-[var(--grey-200)]
                  bg-white text-sm appearance-none cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent
                "
              >
                {/* Group by region */}
                <optgroup label="🌍 Most Used">
                  {CURRENCIES.slice(0, 5).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.symbol} - {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌏 Asia Pacific">
                  {CURRENCIES.filter(c => c.region === 'Asia' || c.region === 'Oceania').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.symbol} - {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🇪🇺 Other Europe">
                  {CURRENCIES.filter(c => c.region === 'Europe' && !['EUR'].includes(c.id)).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.symbol} - {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌴 Middle East">
                  {CURRENCIES.filter(c => c.region === 'Middle East' && c.id !== 'AED').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.symbol} - {c.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌎 Americas">
                  {CURRENCIES.filter(c => c.region === 'Americas' && c.id !== 'USD').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag} {c.symbol} - {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--grey-500)] pointer-events-none" />
            </div>
            {/* Show selected currency badge */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-[var(--grey-500)]">Selected:</span>
              {data.currency && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--gold-light)] text-[var(--gold-dark)] rounded-full text-xs font-medium">
                  {CURRENCIES.find(c => c.id === data.currency)?.flag} {data.currency}
                </span>
              )}
            </div>
          </div>

          {/* Base + Variable in one row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Annual Base (Gross) *"
              type="text"
              inputMode="numeric"
              placeholder={`e.g., ${benchmark.avg.toLocaleString()}`}
              value={formatNumber(data.current_base)}
              onChange={(e) => updateData({ current_base: parseNumber(e.target.value) })}
            />
            <Input
              label="Variable (% of base) *"
              type="number"
              min={0}
              max={100}
              placeholder={`${variableRatio.min}-${variableRatio.max}%`}
              value={data.variable_percentage || ''}
              onChange={(e) => updateData({ variable_percentage: parseInt(e.target.value) || null })}
              hint="Commissions + bonuses"
            />
          </div>

          {/* Commission (Optional) */}
          <div className="bg-[var(--grey-50)] rounded-[var(--radius-md)] p-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.has_commission || false}
                  onChange={(e) => updateData({ 
                    has_commission: e.target.checked,
                    commission_rate: e.target.checked ? data.commission_rate : null 
                  })}
                  className="w-4 h-4 rounded border-[var(--grey-300)] text-[var(--gold)] focus:ring-[var(--gold)]"
                />
                <span className="text-sm">I receive individual commission on sales</span>
              </label>
              {data.has_commission && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={15}
                    step={0.5}
                    placeholder="1-5%"
                    value={data.commission_rate || ''}
                    onChange={(e) => updateData({ commission_rate: parseFloat(e.target.value) || null })}
                    className="w-20 text-sm"
                  />
                  <span className="text-sm text-[var(--grey-500)]">%</span>
                </div>
              )}
            </div>
            {data.has_commission && (
              <p className="text-xs text-[var(--grey-500)] mt-1 ml-6">
                Typical: 1-3% (LVMH/Kering), 3-7% (independents), up to 10% (jewelry)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Benefits - Quick Multi-select */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
            <Gift className="w-3 h-3 text-[var(--gold-dark)]" />
          </div>
          <h3 className="font-medium text-sm text-[var(--charcoal)]">Benefits You Receive</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 pl-8">
          {BENEFITS.map((benefit) => {
            const isSelected = (data.current_benefits || []).includes(benefit.id)
            return (
              <button
                key={benefit.id}
                type="button"
                onClick={() => toggleBenefit(benefit.id)}
                className={`
                  px-3 py-2 rounded-full text-sm transition-colors flex items-center gap-2
                  ${isSelected
                    ? 'bg-[var(--gold)] text-white'
                    : 'bg-[var(--grey-100)] text-[var(--grey-700)] hover:bg-[var(--grey-200)]'
                  }
                `}
              >
                <span>{benefit.icon}</span>
                <span>{benefit.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section 5: Expectations (Simplified) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
            <Target className="w-3 h-3 text-[var(--gold-dark)]" />
          </div>
          <h3 className="font-medium text-sm text-[var(--charcoal)]">Your Expectations</h3>
        </div>

        <div className="space-y-4 pl-8">
          <Input
            label="Target Total Package"
            type="text"
            inputMode="numeric"
            placeholder="60,000"
            value={formatNumber(data.expectations)}
            onChange={(e) => updateData({ expectations: parseNumber(e.target.value) })}
            hint="Base + variable target for your next role"
          />

          {/* Flexibility - Compact */}
          <div className="grid grid-cols-2 gap-3">
            {FLEXIBILITY_OPTIONS.map((option) => {
              const isSelected = data.salary_flexibility === option.id
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateData({ salary_flexibility: option.id as 'flexible' | 'firm' })}
                  className={`
                    p-3 rounded-[var(--radius-md)] text-left transition-colors border
                    ${isSelected 
                      ? 'border-[var(--gold)] bg-[var(--gold-light)]' 
                      : 'border-[var(--grey-200)] hover:border-[var(--grey-300)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--gold-dark)]' : 'text-[var(--grey-500)]'}`} />
                    <span className="text-sm font-medium">{option.name}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Privacy Section - Compact */}
      <div className="bg-[var(--grey-100)] rounded-[var(--radius-md)] p-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.hide_exact_figures}
            onChange={(e) => updateData({ hide_exact_figures: e.target.checked })}
            className="w-4 h-4 rounded border-[var(--grey-300)] text-[var(--gold)] focus:ring-[var(--gold)]"
          />
          <div>
            <span className="font-medium text-sm text-[var(--charcoal)]">
              🔒 Keep exact figures private
            </span>
            <span className="text-xs text-[var(--grey-600)] block">
              Brands see budget alignment only, not exact salary
            </span>
          </div>
        </label>
      </div>

      {/* Info Note */}
      <p className="text-xs text-[var(--grey-500)] text-center">
        💡 Data used for matching only. Never shared without your consent.
      </p>
    </div>
  )
}