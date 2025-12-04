'use client'

import { useState, useMemo } from 'react'
import { Input, Card } from '@/components/ui'
import type { OnboardingData } from '../page'
import {
  Check, DollarSign, Target, Lock, Unlock, Euro, PoundSterling,
  CircleDollarSign, Gift, Briefcase, MapPin, Building2, Info, ChevronDown,
  Search, Globe
} from 'lucide-react'
import {
  COUNTRIES,
  REGIONS,
  getPopularCountries,
  getCountriesByRegion,
  getCitiesForCountry,
  getCountryById,
  searchCountries,
  type Country,
  type City,
} from '@/lib/data/locations'

interface StepCompensationProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

// ============================================================================
// CONSTANTS - Internationalized for Global Platform
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

// ============================================================================
// CONTRACT TYPES - Global terminology
// ============================================================================
const CONTRACT_TYPES = [
  { id: 'permanent', name: 'Permanent', desc: 'Open-ended employment' },
  { id: 'fixed_term', name: 'Fixed-Term', desc: 'Contract with end date' },
  { id: 'temporary', name: 'Temporary / Agency', desc: 'Via staffing agency' },
  { id: 'freelance', name: 'Freelance / Contractor', desc: 'Self-employed' },
]

// ============================================================================
// BRAND SEGMENTS - With ellipsis indicating more examples
// ============================================================================
const BRAND_SEGMENTS = [
  { id: 'ultra_luxury', name: 'Ultra Luxury', examples: 'Hermès, Chanel, Brunello Cucinelli...', variableRatio: '10-20%' },
  { id: 'luxury', name: 'Luxury', examples: 'Louis Vuitton, Dior, Gucci, Prada...', variableRatio: '20-35%' },
  { id: 'premium', name: 'Premium', examples: 'Ralph Lauren, Coach, Michael Kors...', variableRatio: '30-45%' },
  { id: 'accessible_luxury', name: 'Accessible Luxury', examples: 'ba&sh, Maje, Sandro, Zadig & Voltaire...', variableRatio: '35-50%' },
]

// ============================================================================
// BENEFITS - Global categories (replacing French-specific terms)
// ============================================================================
const BENEFITS = [
  // Universal - Luxury Retail Specific
  { id: 'staff_discount', name: 'Staff Discount', desc: '20-50% off products', icon: '🏷️', category: 'retail' },
  { id: 'clothing_allowance', name: 'Clothing Allowance', desc: 'Uniform or budget', icon: '👔', category: 'retail' },
  { id: 'private_sales', name: 'Private Sales Access', desc: 'Early access + exclusive prices', icon: '✨', category: 'retail' },
  
  // Compensation Related
  { id: 'annual_bonus', name: 'Annual Bonus', desc: '13th month or equivalent', icon: '💰', category: 'compensation' },
  { id: 'profit_sharing', name: 'Profit Sharing', desc: 'Performance-based bonus pool', icon: '📈', category: 'compensation' },
  
  // Health & Welfare
  { id: 'health_insurance', name: 'Health Insurance', desc: 'Medical coverage', icon: '🏥', category: 'welfare' },
  { id: 'wellness_benefits', name: 'Wellness Benefits', desc: 'Gym, mental health, etc.', icon: '🧘', category: 'welfare' },
  
  // Practical
  { id: 'meal_benefits', name: 'Meal Benefits', desc: 'Lunch allowance or vouchers', icon: '🍽️', category: 'practical' },
  { id: 'commute_support', name: 'Commute Support', desc: 'Transport or phone allowance', icon: '🚇', category: 'practical' },
  { id: 'retirement_plan', name: 'Retirement Plan', desc: 'Pension contributions', icon: '🏦', category: 'practical' },
  
  // Special (for senior/relocation)
  { id: 'relocation_support', name: 'Relocation Support', desc: 'Moving assistance', icon: '✈️', category: 'special' },
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

// Salary benchmarks by role level and segment (in EUR for France)
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
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  
  // Get data for location selectors
  const popularCountries = useMemo(() => getPopularCountries(), [])
  const countriesByRegion = useMemo(() => getCountriesByRegion(), [])
  const selectedCountry = useMemo(() => 
    data.compensation_country ? getCountryById(data.compensation_country) : null,
    [data.compensation_country]
  )
  const availableCities = useMemo(() => 
    data.compensation_country ? getCitiesForCountry(data.compensation_country) : [],
    [data.compensation_country]
  )
  
  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return null
    return searchCountries(countrySearch)
  }, [countrySearch])
  
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

  // Handle country selection
  const handleCountrySelect = (countryId: string) => {
    updateData({ 
      compensation_country: countryId,
      compensation_city: null // Reset city when country changes
    })
    setCountryDropdownOpen(false)
    setCountrySearch('')
  }

  // Handle city selection
  const handleCitySelect = (cityId: string) => {
    updateData({ compensation_city: cityId })
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
                <div>
                  <span className="font-medium">{contract.name}</span>
                  <span className={`block text-xs ${data.contract_type === contract.id ? 'text-white/70' : 'text-[var(--grey-500)]'}`}>
                    {contract.desc}
                  </span>
                </div>
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

      {/* Section 2: Location (Country → City) */}
      <div>
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
          <Globe className="inline w-4 h-4 mr-1" />
          Where are you based? <span className="text-[var(--error)]">*</span>
        </label>
        
        {/* Country Selector */}
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
            className={`
              w-full px-4 py-3 rounded-[var(--radius-md)] text-left transition-colors
              flex items-center justify-between border
              ${selectedCountry
                ? 'bg-white border-[var(--gold)]'
                : 'bg-[var(--grey-50)] border-[var(--grey-200)] hover:border-[var(--grey-300)]'
              }
            `}
          >
            {selectedCountry ? (
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.emoji}</span>
                <span className="font-medium">{selectedCountry.name}</span>
              </span>
            ) : (
              <span className="text-[var(--grey-500)]">Select your country...</span>
            )}
            <ChevronDown className={`w-4 h-4 text-[var(--grey-500)] transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Country Dropdown */}
          {countryDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--grey-200)] rounded-[var(--radius-md)] shadow-lg max-h-80 overflow-y-auto">
              {/* Search */}
              <div className="sticky top-0 bg-white p-2 border-b border-[var(--grey-100)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--grey-400)]" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--grey-200)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Search Results or Grouped List */}
              <div className="py-1">
                {filteredCountries ? (
                  // Search results
                  filteredCountries.length > 0 ? (
                    filteredCountries.map(country => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => handleCountrySelect(country.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--grey-50)] flex items-center gap-2"
                      >
                        <span>{country.emoji}</span>
                        <span>{country.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-[var(--grey-500)] text-center">
                      No countries found
                    </div>
                  )
                ) : (
                  // Grouped list
                  <>
                    {/* Popular */}
                    <div className="px-3 py-1.5 text-xs font-semibold text-[var(--grey-500)] bg-[var(--grey-50)]">
                      📍 Popular in Luxury Retail
                    </div>
                    {popularCountries.map(country => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => handleCountrySelect(country.id)}
                        className={`
                          w-full px-3 py-2 text-left text-sm flex items-center gap-2
                          ${data.compensation_country === country.id
                            ? 'bg-[var(--gold-light)] text-[var(--gold-dark)]'
                            : 'hover:bg-[var(--grey-50)]'
                          }
                        `}
                      >
                        <span>{country.emoji}</span>
                        <span>{country.name}</span>
                        {data.compensation_country === country.id && <Check className="w-3 h-3 ml-auto" />}
                      </button>
                    ))}
                    
                    {/* By Region */}
                    {REGIONS.map(region => (
                      <div key={region.id}>
                        <div className="px-3 py-1.5 text-xs font-semibold text-[var(--grey-500)] bg-[var(--grey-50)]">
                          {region.emoji} {region.name}
                        </div>
                        {countriesByRegion[region.id]
                          .filter(c => !popularCountries.find(p => p.id === c.id)) // Avoid duplicates with popular
                          .map(country => (
                            <button
                              key={country.id}
                              type="button"
                              onClick={() => handleCountrySelect(country.id)}
                              className={`
                                w-full px-3 py-2 text-left text-sm flex items-center gap-2
                                ${data.compensation_country === country.id
                                  ? 'bg-[var(--gold-light)] text-[var(--gold-dark)]'
                                  : 'hover:bg-[var(--grey-50)]'
                                }
                              `}
                            >
                              <span>{country.emoji}</span>
                              <span>{country.name}</span>
                              {data.compensation_country === country.id && <Check className="w-3 h-3 ml-auto" />}
                            </button>
                          ))}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* City Selection (appears after country selected) */}
        {selectedCountry && availableCities.length > 0 && (
          <div>
            <label className="block text-xs text-[var(--grey-600)] mb-2">
              City <span className="text-[var(--grey-400)]">(optional - refines salary benchmark)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCities.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city.id)}
                  className={`
                    px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors
                    ${data.compensation_city === city.id
                      ? 'bg-[var(--gold)] text-white'
                      : 'bg-[var(--grey-100)] text-[var(--grey-700)] hover:bg-[var(--grey-200)]'
                    }
                  `}
                >
                  <span className="font-medium">{city.name}</span>
                  {city.premium !== 'Baseline' && city.premium !== 'Variable' && (
                    <span className={`block text-xs ${data.compensation_city === city.id ? 'text-white/80' : 'text-[var(--success)]'}`}>
                      {city.premium}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--grey-500)] mt-2">
              💡 Major cities often have +15-60% salary premium
            </p>
          </div>
        )}
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