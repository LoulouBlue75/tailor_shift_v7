'use client'

import { useState, useMemo } from 'react'
import { Card, Input } from '@/components/ui'
import type { OnboardingData } from '../page'
import { Check, Star, Heart, Building, Sparkles, AlertCircle, ChevronUp, ChevronDown, X, TrendingUp } from 'lucide-react'

interface StepDreamBrandsProps {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
}

// Comprehensive list of luxury brands organized by segment with related brands
const BRAND_DATA: Record<string, { segment: string; related: string[] }> = {
  // Ultra Luxury
  'Hermès': { segment: 'ultra_luxury', related: ['Chanel', 'Brunello Cucinelli', 'Loro Piana'] },
  'Chanel': { segment: 'ultra_luxury', related: ['Hermès', 'Dior', 'Louis Vuitton'] },
  'Brunello Cucinelli': { segment: 'ultra_luxury', related: ['Hermès', 'Loro Piana', 'Zegna'] },
  'Loro Piana': { segment: 'ultra_luxury', related: ['Brunello Cucinelli', 'Hermès', 'Kiton'] },
  'Graff': { segment: 'ultra_luxury', related: ['Harry Winston', 'Van Cleef & Arpels', 'Cartier'] },
  'Harry Winston': { segment: 'ultra_luxury', related: ['Graff', 'Chopard', 'Bulgari'] },
  
  // Luxury - Fashion
  'Louis Vuitton': { segment: 'luxury', related: ['Dior', 'Fendi', 'Celine'] },
  'Dior': { segment: 'luxury', related: ['Louis Vuitton', 'Chanel', 'Givenchy'] },
  'Gucci': { segment: 'luxury', related: ['Saint Laurent', 'Balenciaga', 'Bottega Veneta'] },
  'Saint Laurent': { segment: 'luxury', related: ['Gucci', 'Balenciaga', 'Celine'] },
  'Bottega Veneta': { segment: 'luxury', related: ['Gucci', 'Loewe', 'Celine'] },
  'Balenciaga': { segment: 'luxury', related: ['Gucci', 'Saint Laurent', 'Vetements'] },
  'Celine': { segment: 'luxury', related: ['Louis Vuitton', 'Bottega Veneta', 'Loewe'] },
  'Loewe': { segment: 'luxury', related: ['Celine', 'Bottega Veneta', 'Moynat'] },
  'Prada': { segment: 'luxury', related: ['Miu Miu', 'Gucci', 'Fendi'] },
  'Miu Miu': { segment: 'luxury', related: ['Prada', 'Valentino', 'Gucci'] },
  'Fendi': { segment: 'luxury', related: ['Louis Vuitton', 'Dior', 'Prada'] },
  'Valentino': { segment: 'luxury', related: ['Givenchy', 'Dior', 'Alexander McQueen'] },
  'Givenchy': { segment: 'luxury', related: ['Dior', 'Valentino', 'Celine'] },
  'Alexander McQueen': { segment: 'luxury', related: ['Valentino', 'Givenchy', 'Balenciaga'] },
  'Burberry': { segment: 'luxury', related: ['Coach', 'Ralph Lauren', 'Max Mara'] },
  
  // Luxury - Jewelry & Watches
  'Cartier': { segment: 'luxury', related: ['Van Cleef & Arpels', 'Bulgari', 'Tiffany & Co.'] },
  'Van Cleef & Arpels': { segment: 'luxury', related: ['Cartier', 'Chopard', 'Graff'] },
  'Bulgari': { segment: 'luxury', related: ['Cartier', 'Tiffany & Co.', 'Chopard'] },
  'Tiffany & Co.': { segment: 'luxury', related: ['Cartier', 'Bulgari', 'Van Cleef & Arpels'] },
  'Chopard': { segment: 'luxury', related: ['Van Cleef & Arpels', 'Bulgari', 'Harry Winston'] },
  'Rolex': { segment: 'luxury', related: ['Patek Philippe', 'Audemars Piguet', 'Omega'] },
  'Patek Philippe': { segment: 'luxury', related: ['Rolex', 'Audemars Piguet', 'Vacheron Constantin'] },
  'Audemars Piguet': { segment: 'luxury', related: ['Patek Philippe', 'Rolex', 'Richard Mille'] },
  'Omega': { segment: 'luxury', related: ['Rolex', 'TAG Heuer', 'Breitling'] },
  'TAG Heuer': { segment: 'luxury', related: ['Omega', 'Breitling', 'IWC'] },
  'Breitling': { segment: 'luxury', related: ['TAG Heuer', 'Omega', 'IWC'] },
  'IWC': { segment: 'luxury', related: ['Breitling', 'Jaeger-LeCoultre', 'Panerai'] },
  'Jaeger-LeCoultre': { segment: 'luxury', related: ['IWC', 'Cartier', 'Audemars Piguet'] },
  
  // Premium
  'Coach': { segment: 'premium', related: ['Kate Spade', 'Michael Kors', 'Burberry'] },
  'Kate Spade': { segment: 'premium', related: ['Coach', 'Michael Kors', 'Marc Jacobs'] },
  'Michael Kors': { segment: 'premium', related: ['Coach', 'Kate Spade', 'Tommy Hilfiger'] },
  'Ralph Lauren': { segment: 'premium', related: ['Burberry', 'Hugo Boss', 'Tommy Hilfiger'] },
  'Hugo Boss': { segment: 'premium', related: ['Ralph Lauren', 'Tommy Hilfiger', 'Calvin Klein'] },
  'Tommy Hilfiger': { segment: 'premium', related: ['Hugo Boss', 'Calvin Klein', 'Ralph Lauren'] },
  'Calvin Klein': { segment: 'premium', related: ['Tommy Hilfiger', 'Hugo Boss', 'Armani Exchange'] },
  'Armani Exchange': { segment: 'premium', related: ['Calvin Klein', 'Emporio Armani', 'Versace Jeans'] },
  'Versace Jeans': { segment: 'premium', related: ['Armani Exchange', 'Diesel', 'Hugo Boss'] },
  'Max Mara': { segment: 'premium', related: ['Burberry', 'Moncler', 'Weekend Max Mara'] },
  'Moncler': { segment: 'premium', related: ['Canada Goose', 'Max Mara', 'Burberry'] },
  'Canada Goose': { segment: 'premium', related: ['Moncler', 'Woolrich', 'Mackage'] },
  
  // Accessible Luxury
  'Sandro': { segment: 'accessible', related: ['Maje', 'Claudie Pierlot', 'The Kooples'] },
  'Maje': { segment: 'accessible', related: ['Sandro', 'Claudie Pierlot', 'ba&sh'] },
  'ba&sh': { segment: 'accessible', related: ['Maje', 'Sandro', 'Zadig & Voltaire'] },
  'The Kooples': { segment: 'accessible', related: ['Sandro', 'Zadig & Voltaire', 'AllSaints'] },
  'Zadig & Voltaire': { segment: 'accessible', related: ['The Kooples', 'ba&sh', 'IRO'] },
  'IRO': { segment: 'accessible', related: ['Zadig & Voltaire', 'The Kooples', 'AllSaints'] },
  'Claudie Pierlot': { segment: 'accessible', related: ['Sandro', 'Maje', 'ba&sh'] },
  'Kenzo': { segment: 'accessible', related: ['Sandro', 'Kenzo', 'IRO'] },
  'Diesel': { segment: 'accessible', related: ['AllSaints', 'G-Star', 'Replay'] },
  'Reiss': { segment: 'accessible', related: ['AllSaints', 'COS', 'Arket'] },
  'AllSaints': { segment: 'accessible', related: ['Reiss', 'The Kooples', 'IRO'] },
  'COS': { segment: 'accessible', related: ['Arket', 'Reiss', '& Other Stories'] },
  'Arket': { segment: 'accessible', related: ['COS', '& Other Stories', 'Reiss'] },
}

const ALL_BRANDS = Object.keys(BRAND_DATA).sort()

// Color schemes by segment
const SEGMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ultra_luxury: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  luxury: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  premium: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  accessible: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
}

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

  // Get smart suggestions based on selected brands
  const smartSuggestions = useMemo(() => {
    if (targetBrands.length === 0) {
      // Default popular brands
      return ['Hermès', 'Chanel', 'Louis Vuitton', 'Dior', 'Gucci', 'Cartier', 'Prada', 'Saint Laurent']
        .filter(b => !targetBrands.includes(b))
        .slice(0, 8)
    }
    
    // Get related brands based on selected brands
    const relatedSet = new Set<string>()
    targetBrands.forEach(brand => {
      const brandData = BRAND_DATA[brand]
      if (brandData?.related) {
        brandData.related.forEach(r => {
          if (!targetBrands.includes(r)) {
            relatedSet.add(r)
          }
        })
      }
    })
    
    // Return related brands, filtered to not include already selected ones
    return Array.from(relatedSet).slice(0, 8)
  }, [targetBrands])

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

  const addCurrentEmployerAsFirst = () => {
    if (!currentEmployer || targetBrands.includes(currentEmployer)) return
    // Add at position 1 (first choice)
    updateData({ target_brands: [currentEmployer, ...targetBrands.slice(0, 4)] })
  }

  // Get segment color for a brand
  const getBrandColors = (brand: string) => {
    const segment = BRAND_DATA[brand]?.segment || 'accessible'
    return SEGMENT_COLORS[segment] || SEGMENT_COLORS.accessible
  }

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="p-4 bg-gradient-to-r from-[var(--gold-light)] to-amber-50 rounded-[var(--radius-md)] border border-[var(--gold)]">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-[var(--gold-dark)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--gold-dark)]">Your Dream Brands</p>
            <p className="text-sm text-[var(--gold-dark)]/80 mt-1">
              Select up to 5 maisons you'd love to work for. We'll prioritize matching you with opportunities from these brands.
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 INTERNAL MOBILITY - SHOWN FIRST WITH MARKETING-FRIENDLY WORDING */}
      {currentEmployer && !targetBrands.includes(currentEmployer) && (
        <Card 
          variant="interactive"
          className="p-5 cursor-pointer border-2 border-[var(--burgundy)] bg-gradient-to-r from-[var(--burgundy)]/5 to-rose-50 hover:from-[var(--burgundy)]/10 hover:to-rose-100 transition-all"
          onClick={addCurrentEmployerAsFirst}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--burgundy)]/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--burgundy)]" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-base block text-[var(--burgundy)]">
                Grow within {currentEmployer}
              </span>
              <span className="text-sm text-[var(--grey-600)]">
                Explore internal opportunities and advance your career with your current maison
              </span>
            </div>
            <button className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--burgundy)] text-white hover:bg-[var(--burgundy)]/90 transition-colors shadow-sm">
              Add as #1 Priority
            </button>
          </div>
        </Card>
      )}

      {/* Internal Mobility Confirmed Message */}
      {hasInternalMobility && (
        <div className="p-4 bg-gradient-to-r from-[var(--success-light)] to-emerald-50 rounded-[var(--radius-md)] border border-[var(--success)]">
          <div className="flex gap-3">
            <Check className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[var(--success)]">Internal Mobility Priority Set ✓</p>
              <p className="text-sm text-[var(--success)]/80 mt-1">
                {currentEmployer} is your #{internalMobilityRank} choice. 
                {internalMobilityRank === 1 
                  ? " We'll prioritize internal opportunities first."
                  : " Move it to #1 to make internal growth your top priority."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Dream Brands - Ranked List */}
      {targetBrands.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--charcoal)] mb-3">
            Your Dream Brands Ranking
          </label>
          <div className="space-y-2">
            {targetBrands.map((brand, index) => {
              const isCurrentEmployer = currentEmployer && brand.toLowerCase() === currentEmployer.toLowerCase()
              const colors = getBrandColors(brand)
              
              return (
                <Card key={brand} variant="default" className={`p-3 ${colors.bg} ${colors.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 0 
                          ? 'bg-[var(--gold)] text-white shadow-sm' 
                          : 'bg-white text-[var(--grey-700)] border border-[var(--grey-200)]'
                        }
                      `}>
                        {index + 1}
                      </span>
                      <span className={`font-medium ${colors.text}`}>{brand}</span>
                      {isCurrentEmployer && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-[var(--burgundy)] text-white rounded-full">
                          Internal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveBrandUp(index) }}
                        disabled={index === 0}
                        className="p-1.5 text-[var(--grey-500)] hover:text-[var(--charcoal)] hover:bg-white rounded disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveBrandDown(index) }}
                        disabled={index === targetBrands.length - 1}
                        className="p-1.5 text-[var(--grey-500)] hover:text-[var(--charcoal)] hover:bg-white rounded disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeBrand(brand) }}
                        className="p-1.5 text-[var(--error)] hover:bg-[var(--error-light)] rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Search & Add Brands */}
      {targetBrands.length < 5 && (
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
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[var(--grey-200)] rounded-[var(--radius-md)] shadow-lg max-h-48 overflow-auto">
                {filteredSuggestions.map((brand) => {
                  const colors = getBrandColors(brand)
                  return (
                    <button
                      key={brand}
                      type="button"
                      className={`w-full px-4 py-2 text-left text-sm hover:${colors.bg} transition-colors flex items-center gap-2`}
                      onMouseDown={() => addBrand(brand)}
                    >
                      <Star className="w-4 h-4 text-[var(--gold)]" />
                      <span className={colors.text}>{brand}</span>
                    </button>
                  )
                })}
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
      )}

      {/* Smart Suggestions - Dynamic based on selected brands */}
      {targetBrands.length < 5 && smartSuggestions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--charcoal)] mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            {targetBrands.length > 0 ? 'You might also like' : 'Popular choices'}
          </label>
          <div className="flex flex-wrap gap-2">
            {smartSuggestions.map((brand) => {
              const colors = getBrandColors(brand)
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => addBrand(brand)}
                  disabled={targetBrands.length >= 5}
                  className={`
                    px-3 py-2 rounded-full text-sm border transition-all
                    ${colors.border} ${colors.text} hover:${colors.bg}
                    hover:shadow-sm disabled:opacity-50
                  `}
                >
                  + {brand}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Max brands reached */}
      {targetBrands.length >= 5 && (
        <div className="text-center py-3 px-4 bg-[var(--grey-100)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--grey-600)]">
            ✓ Maximum 5 brands selected. Remove one to add another.
          </p>
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