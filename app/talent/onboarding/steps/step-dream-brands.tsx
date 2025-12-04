'use client'

import { useState } from 'react'
import { Card, Input } from '@/components/ui'
import type { OnboardingData } from '../page'
import { Check, Star, Heart, Building, Sparkles, AlertCircle } from 'lucide-react'

interface StepDreamBrandsProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

// Comprehensive list of luxury brands organized by segment
const BRAND_SUGGESTIONS = {
  ultra_luxury: [
    'Hermès', 'Chanel', 'Brunello Cucinelli', 'Loro Piana', 'Graff', 'Harry Winston'
  ],
  luxury: [
    'Louis Vuitton', 'Dior', 'Gucci', 'Saint Laurent', 'Bottega Veneta', 'Balenciaga',
    'Celine', 'Loewe', 'Prada', 'Miu Miu', 'Fendi', 'Valentino', 'Givenchy',
    'Alexander McQueen', 'Burberry', 'Cartier', 'Van Cleef & Arpels', 'Bulgari',
    'Tiffany & Co.', 'Chopard', 'Rolex', 'Patek Philippe', 'Audemars Piguet',
    'Omega', 'TAG Heuer', 'Breitling', 'IWC', 'Jaeger-LeCoultre'
  ],
  premium: [
    'Coach', 'Kate Spade', 'Michael Kors', 'Ralph Lauren', 'Hugo Boss',
    'Tommy Hilfiger', 'Calvin Klein', 'Armani Exchange', 'Versace Jeans',
    'Max Mara', 'Moncler', 'Canada Goose'
  ],
  accessible: [
    'Sandro', 'Maje', 'ba&sh', 'The Kooples', 'Zadig & Voltaire', 'IRO',
    'Claudie Pierlot', 'Kenzo', 'Diesel', 'Reiss', 'AllSaints', 'COS', 'Arket'
  ]
}

// Flatten for easy searching
const ALL_BRANDS = [
  ...BRAND_SUGGESTIONS.ultra_luxury,
  ...BRAND_SUGGESTIONS.luxury,
  ...BRAND_SUGGESTIONS.premium,
  ...BRAND_SUGGESTIONS.accessible
].sort()

export function StepDreamBrands({ data, updateData }: StepDreamBrandsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const targetBrands = data.target_brands || []
  const currentEmployer = data.current_employer?.trim()
  
  // Check if current employer is in dream brands (for internal mobility)
  const hasInternalMobility = currentEmployer && 
    targetBrands.some(b => b.toLowerCase() === currentEmployer.toLowerCase())
  const internalMobilityRank = currentEmployer 
    ? targetBrands.findIndex(b => b.toLowerCase() === currentEmployer.toLowerCase()) + 1
    : 0

  // Filter suggestions based on search
  const filteredSuggestions = searchQuery.length >= 2
    ? ALL_BRANDS.filter(brand => 
        brand.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !targetBrands.includes(brand)
      ).slice(0, 8)
    : []

  const addBrand = (brand: string) => {
    if (targetBrands.length >= 5) return
    if (targetBrands.includes(brand)) return
    
    updateData({ target_brands: [...targetBrands, brand] })
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const removeBrand = (brand: string) => {
    updateData({ target_brands: targetBrands.filter(b => b !== brand) })
  }

  const moveBrandUp = (index: number) => {
    if (index === 0) return
    const newBrands = [...targetBrands]
    ;[newBrands[index - 1], newBrands[index]] = [newBrands[index], newBrands[index - 1]]
    updateData({ target_brands: newBrands })
  }

  const moveBrandDown = (index: number) => {
    if (index === targetBrands.length - 1) return
    const newBrands = [...targetBrands]
    ;[newBrands[index], newBrands[index + 1]] = [newBrands[index + 1], newBrands[index]]
    updateData({ target_brands: newBrands })
  }

  const addCurrentEmployer = () => {
    if (!currentEmployer || targetBrands.includes(currentEmployer)) return
    // Add at position 1 (first choice)
    updateData({ target_brands: [currentEmployer, ...targetBrands.slice(0, 4)] })
  }

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="p-4 bg-[var(--gold-light)] rounded-[var(--radius-md)] border border-[var(--gold)]">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-[var(--gold-dark)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--gold-dark)]">Dream Brands</p>
            <p className="text-sm text-[var(--gold-dark)] mt-1">
              Select up to 5 maisons you'd love to work for. We'll prioritize matching you with opportunities from these brands.
            </p>
          </div>
        </div>
      </div>

      {/* Internal Mobility Option - Only shown if current employer is set */}
      {currentEmployer && !targetBrands.includes(currentEmployer) && (
        <Card 
          variant="interactive"
          className="p-4 cursor-pointer border-dashed border-2 border-[var(--burgundy)] bg-[var(--burgundy)]/5"
          onClick={addCurrentEmployer}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--burgundy)]/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-[var(--burgundy)]" />
              </div>
              <div>
                <span className="font-medium text-sm block text-[var(--burgundy)]">
                  Internal Mobility: {currentEmployer}
                </span>
                <span className="text-small text-[var(--grey-600)]">
                  Add your current employer to signal interest in internal opportunities
                </span>
              </div>
            </div>
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--burgundy)] text-white hover:bg-[var(--burgundy)]/90">
              Add as #1
            </button>
          </div>
        </Card>
      )}

      {/* Internal Mobility Detected Message */}
      {hasInternalMobility && (
        <div className="p-4 bg-[var(--success-light)] rounded-[var(--radius-md)] border border-[var(--success)]">
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[var(--success)]">Internal Mobility Interest Detected</p>
              <p className="text-sm text-[var(--success)] mt-1">
                {currentEmployer} is your #{internalMobilityRank} choice. 
                {internalMobilityRank === 1 
                  ? " We'll prioritize internal opportunities from your current employer."
                  : " Move it to #1 if internal mobility is your top priority."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Add Brands */}
      <div className="relative">
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
          Search for brands
        </label>
        <div className="relative">
          <Input
            placeholder="Type to search luxury brands..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            disabled={targetBrands.length >= 5}
          />
          {targetBrands.length >= 5 && (
            <p className="text-small text-[var(--grey-500)] mt-1">
              Maximum 5 brands selected. Remove one to add another.
            </p>
          )}
          
          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--grey-200)] rounded-[var(--radius-md)] shadow-lg max-h-48 overflow-auto">
              {filteredSuggestions.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--grey-50)] transition-colors flex items-center gap-2"
                  onMouseDown={() => addBrand(brand)}
                >
                  <Star className="w-4 h-4 text-[var(--gold)]" />
                  {brand}
                </button>
              ))}
            </div>
          )}
          
          {/* Custom brand option */}
          {showSuggestions && searchQuery.length >= 2 && filteredSuggestions.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--grey-200)] rounded-[var(--radius-md)] shadow-lg">
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--grey-50)] transition-colors flex items-center gap-2"
                onMouseDown={() => addBrand(searchQuery)}
              >
                <Building className="w-4 h-4 text-[var(--grey-500)]" />
                Add "{searchQuery}" as custom brand
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Dream Brands - Ranked List */}
      {targetBrands.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
            Your Dream Brands (drag to reorder priority)
          </label>
          <div className="space-y-2">
            {targetBrands.map((brand, index) => {
              const isCurrentEmployer = currentEmployer && brand.toLowerCase() === currentEmployer.toLowerCase()
              
              return (
                <Card key={brand} variant="default" className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 0 
                          ? 'bg-[var(--gold)] text-white' 
                          : 'bg-[var(--grey-200)] text-[var(--grey-700)]'
                        }
                      `}>
                        {index + 1}
                      </span>
                      <span className="font-medium">{brand}</span>
                      {isCurrentEmployer && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-[var(--burgundy)]/10 text-[var(--burgundy)] rounded-full">
                          Internal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveBrandUp(index)}
                        disabled={index === 0}
                        className="p-1 text-[var(--grey-500)] hover:text-[var(--charcoal)] disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBrandDown(index)}
                        disabled={index === targetBrands.length - 1}
                        className="p-1 text-[var(--grey-500)] hover:text-[var(--charcoal)] disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBrand(brand)}
                        className="p-1 text-[var(--error)] hover:text-[var(--error)]"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Add - Popular Brands */}
      {targetBrands.length < 5 && (
        <div>
          <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
            Popular choices
          </label>
          <div className="flex flex-wrap gap-2">
            {['Hermès', 'Chanel', 'Louis Vuitton', 'Dior', 'Gucci', 'Cartier', 'Prada', 'Saint Laurent']
              .filter(b => !targetBrands.includes(b))
              .slice(0, 6)
              .map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => addBrand(brand)}
                  disabled={targetBrands.length >= 5}
                  className="px-3 py-1.5 rounded-full text-sm border border-[var(--grey-300)] text-[var(--grey-700)] hover:border-[var(--gold)] hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
                >
                  + {brand}
                </button>
              ))
            }
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 bg-[var(--grey-50)] rounded-[var(--radius-md)] border border-[var(--grey-200)]">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--grey-500)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[var(--grey-600)]">
              <strong>Your privacy is protected.</strong> Brands only see anonymized aggregate data
              (e.g., "12 Sales Associates interested") – never individual profiles until there's a mutual match.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}