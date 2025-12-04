// 8D Matching Algorithm for Tailor Shift
// Calculates match percentage between Talent and Opportunity

import type { Dimension } from '@/lib/assessment/questions'

// ============================================================================
// COMPENSATION ALIGNMENT
// ============================================================================

export type CompensationAlignment = 'within_range' | 'above_range' | 'below_range' | 'unknown'

export interface CompensationAlignmentResult {
  alignment: CompensationAlignment
  percentageDiff: number | null  // How far above/below range (e.g., +15% means 15% above max)
  details: string
}

/**
 * Calculate compensation alignment between talent expectations and opportunity range
 */
export function calculateCompensationAlignment(
  talentExpectations: number | null | undefined,
  opportunityMin: number | null | undefined,
  opportunityMax: number | null | undefined,
  talentCurrency?: string,
  opportunityCurrency?: string
): CompensationAlignmentResult {
  // If talent hasn't set expectations, alignment is unknown
  if (!talentExpectations || talentExpectations === 0) {
    return {
      alignment: 'unknown',
      percentageDiff: null,
      details: 'Candidate has not shared salary expectations'
    }
  }

  // If opportunity doesn't have salary range, alignment is unknown
  if (!opportunityMin && !opportunityMax) {
    return {
      alignment: 'unknown',
      percentageDiff: null,
      details: 'Salary range not specified for this role'
    }
  }

  // Use max as upper bound, fallback to min * 1.3 if not set
  const maxRange = opportunityMax || (opportunityMin ? opportunityMin * 1.3 : 0)
  // Use min as lower bound, fallback to max * 0.7 if not set
  const minRange = opportunityMin || (opportunityMax ? opportunityMax * 0.7 : 0)

  // TODO: Add currency conversion in the future
  // For now, assume same currency

  // Calculate alignment
  if (talentExpectations >= minRange && talentExpectations <= maxRange) {
    return {
      alignment: 'within_range',
      percentageDiff: 0,
      details: 'Within budget range'
    }
  }

  if (talentExpectations > maxRange) {
    const percentAbove = Math.round(((talentExpectations - maxRange) / maxRange) * 100)
    return {
      alignment: 'above_range',
      percentageDiff: percentAbove,
      details: `${percentAbove}% above budget`
    }
  }

  if (talentExpectations < minRange) {
    const percentBelow = Math.round(((minRange - talentExpectations) / minRange) * 100)
    return {
      alignment: 'below_range',
      percentageDiff: -percentBelow,
      details: `${percentBelow}% below minimum`
    }
  }

  return {
    alignment: 'unknown',
    percentageDiff: null,
    details: 'Unable to calculate alignment'
  }
}

/**
 * Get the display info for compensation alignment badge
 */
export function getCompensationBadgeInfo(alignment: CompensationAlignmentResult): {
  label: string
  color: string
  bgColor: string
  icon: '🟢' | '🟡' | '🔵' | '⚪'
} {
  switch (alignment.alignment) {
    case 'within_range':
      return {
        label: 'Within range',
        color: 'var(--success)',
        bgColor: 'var(--success-light)',
        icon: '🟢'
      }
    case 'above_range':
      return {
        label: alignment.percentageDiff
          ? `Above range (+${alignment.percentageDiff}%)`
          : 'Above range',
        color: 'var(--warning)',
        bgColor: 'var(--warning-light, #FEF3CD)',
        icon: '🟡'
      }
    case 'below_range':
      return {
        label: 'Below range',
        color: 'var(--info)',
        bgColor: 'var(--info-light, #D1ECF1)',
        icon: '🔵'
      }
    default:
      return {
        label: 'Unknown',
        color: 'var(--grey-500)',
        bgColor: 'var(--grey-100)',
        icon: '⚪'
      }
  }
}

// 8 Dimensions for matching (6D assessment + 2 structural)
export interface MatchDimensions {
  // From 6D Assessment
  product_knowledge: number
  clienteling_mastery: number
  cultural_alignment: number
  sales_performance: number
  leadership: number
  operations: number
  // Structural dimensions
  role_level_fit: number
  location_fit: number
}

export interface MatchWeights {
  product_knowledge: number
  clienteling_mastery: number
  cultural_alignment: number
  sales_performance: number
  leadership: number
  operations: number
  role_level_fit: number
  location_fit: number
}

// Default weights - can be customized per opportunity
export const DEFAULT_WEIGHTS: MatchWeights = {
  product_knowledge: 15,
  clienteling_mastery: 20,
  cultural_alignment: 15,
  sales_performance: 15,
  leadership: 10,
  operations: 5,
  role_level_fit: 10,
  location_fit: 10,
}

// Role level distance calculation
export function calculateRoleLevelFit(
  talentLevel: string, 
  requiredLevel: string,
  targetLevels?: string[]
): number {
  const levels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8']
  const talentIdx = levels.indexOf(talentLevel)
  const requiredIdx = levels.indexOf(requiredLevel)
  
  if (talentIdx === -1 || requiredIdx === -1) return 50
  
  // Check if required level is in talent's target levels
  if (targetLevels?.includes(requiredLevel)) {
    return 100
  }
  
  const distance = Math.abs(talentIdx - requiredIdx)
  
  // Exact match
  if (distance === 0) return 100
  // One level away (promotion/lateral)
  if (distance === 1) return 85
  // Two levels away
  if (distance === 2) return 60
  // More than two levels
  return Math.max(20, 100 - distance * 20)
}

// Location fit calculation
export function calculateLocationFit(
  talentLocation: string,
  talentMobility: string,
  talentTargetLocations: string[],
  opportunityCity: string,
  opportunityCountry: string
): number {
  const talentCity = talentLocation?.toLowerCase() || ''
  const oppCity = opportunityCity?.toLowerCase() || ''
  const oppCountry = opportunityCountry?.toLowerCase() || ''
  
  // Extract country from talent location (assumes "City, Country" format)
  const talentCountry = talentLocation?.split(',').pop()?.trim().toLowerCase() || ''
  
  // Check target locations
  const isTargetCity = talentTargetLocations.some(
    loc => loc.toLowerCase().includes(oppCity) || oppCity.includes(loc.toLowerCase())
  )
  
  if (isTargetCity) return 100
  
  // Same city
  if (talentCity.includes(oppCity) || oppCity.includes(talentCity)) return 100
  
  // Based on mobility preference
  switch (talentMobility) {
    case 'international':
      return 90 // Open to anywhere
    case 'national':
      return talentCountry === oppCountry ? 90 : 60
    case 'regional':
      return talentCountry === oppCountry ? 80 : 40
    case 'local':
      return 30 // Only wants local, opportunity is elsewhere
    default:
      return 50
  }
}

// Division overlap calculation
export function calculateDivisionFit(
  talentDivisions: string[],
  opportunityDivision: string | null
): number {
  if (!opportunityDivision) return 100 // No specific division required
  if (!talentDivisions?.length) return 40 // Talent hasn't specified
  
  if (talentDivisions.includes(opportunityDivision)) return 100
  
  // Check for related divisions
  const divisionGroups = [
    ['fashion', 'leather_goods', 'accessories', 'shoes'],
    ['watches', 'high_jewelry'],
    ['beauty', 'fragrance'],
  ]
  
  for (const group of divisionGroups) {
    const talentInGroup = talentDivisions.some(d => group.includes(d))
    const oppInGroup = group.includes(opportunityDivision)
    if (talentInGroup && oppInGroup) return 70 // Related category
  }
  
  return 40 // Different category
}

// Experience years calculation
export function calculateExperienceFit(
  talentYears: number,
  requiredYears: number | null
): number {
  if (!requiredYears) return 100 // No requirement
  
  if (talentYears >= requiredYears) return 100
  if (talentYears >= requiredYears - 1) return 85
  if (talentYears >= requiredYears - 2) return 70
  return Math.max(30, 100 - (requiredYears - talentYears) * 15)
}

// Language match calculation
export function calculateLanguageFit(
  talentLanguages: string[],
  requiredLanguages: string[]
): number {
  if (!requiredLanguages?.length) return 100
  if (!talentLanguages?.length) return 40
  
  const matches = requiredLanguages.filter(lang => 
    talentLanguages.some(tLang => 
      tLang.toLowerCase() === lang.toLowerCase()
    )
  )
  
  return Math.round((matches.length / requiredLanguages.length) * 100)
}

// Main matching function
export interface TalentProfile {
  id: string
  current_role_level: string
  current_location: string
  divisions_expertise: string[]
  years_in_luxury: number
  languages?: string[]
  career_preferences?: {
    target_role_levels?: string[]
    mobility?: string
    target_locations?: string[]
  }
  assessment_scores?: Record<Dimension, number>
}

export interface OpportunityProfile {
  id: string
  role_level: string
  division: string | null
  city: string
  country: string
  required_experience_years: number | null
  required_languages: string[]
  required_competencies?: Partial<Record<Dimension, number>>
  weights?: Partial<MatchWeights>
}

export interface MatchResult {
  overall_score: number
  dimension_scores: MatchDimensions
  breakdown: {
    dimension: string
    score: number
    weight: number
    weighted_score: number
  }[]
  recommendation: 'strong' | 'good' | 'moderate' | 'weak'
}

export function calculateMatch(
  talent: TalentProfile,
  opportunity: OpportunityProfile
): MatchResult {
  const weights = { ...DEFAULT_WEIGHTS, ...opportunity.weights }
  const assessmentScores: Partial<Record<Dimension, number>> = talent.assessment_scores || {}
  const requiredCompetencies = opportunity.required_competencies || {}
  
  // Calculate each dimension score
  const dimensionScores: MatchDimensions = {
    // 6D Assessment scores (compare to required or use as-is)
    product_knowledge: assessmentScores['product_knowledge'] ?? 50,
    clienteling_mastery: assessmentScores['clienteling_mastery'] ?? 50,
    cultural_alignment: assessmentScores['cultural_alignment'] ?? 50,
    sales_performance: assessmentScores['sales_performance'] ?? 50,
    leadership: assessmentScores['leadership'] ?? 50,
    operations: assessmentScores['operations'] ?? 50,
    
    // Structural matches
    role_level_fit: calculateRoleLevelFit(
      talent.current_role_level,
      opportunity.role_level,
      talent.career_preferences?.target_role_levels
    ),
    location_fit: calculateLocationFit(
      talent.current_location,
      talent.career_preferences?.mobility || 'regional',
      talent.career_preferences?.target_locations || [],
      opportunity.city,
      opportunity.country
    ),
  }
  
  // Apply required competency comparisons if specified
  for (const [dim, required] of Object.entries(requiredCompetencies)) {
    const talentScore = assessmentScores[dim as Dimension]
    if (required && talentScore !== undefined) {
      // Score based on how close talent is to requirement
      if (talentScore >= required) {
        dimensionScores[dim as keyof MatchDimensions] = 100
      } else {
        dimensionScores[dim as keyof MatchDimensions] = Math.round((talentScore / required) * 100)
      }
    }
  }
  
  // Factor in division and experience
  const divisionFit = calculateDivisionFit(talent.divisions_expertise, opportunity.division)
  const experienceFit = calculateExperienceFit(talent.years_in_luxury, opportunity.required_experience_years)
  const languageFit = calculateLanguageFit(talent.languages || [], opportunity.required_languages)
  
  // Adjust product knowledge by division fit
  dimensionScores.product_knowledge = Math.round(
    (dimensionScores.product_knowledge * 0.7 + divisionFit * 0.3)
  )
  
  // Adjust sales performance by experience
  dimensionScores.sales_performance = Math.round(
    (dimensionScores.sales_performance * 0.8 + experienceFit * 0.2)
  )
  
  // Adjust cultural alignment by language fit
  dimensionScores.cultural_alignment = Math.round(
    (dimensionScores.cultural_alignment * 0.7 + languageFit * 0.3)
  )
  
  // Calculate weighted overall score
  const breakdown = Object.entries(dimensionScores).map(([dimension, score]) => {
    const weight = weights[dimension as keyof MatchWeights]
    return {
      dimension,
      score,
      weight,
      weighted_score: (score * weight) / 100,
    }
  })
  
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const overall_score = Math.round(
    breakdown.reduce((sum, b) => sum + b.weighted_score, 0) / totalWeight * 100
  )
  
  // Determine recommendation
  let recommendation: MatchResult['recommendation']
  if (overall_score >= 80) recommendation = 'strong'
  else if (overall_score >= 65) recommendation = 'good'
  else if (overall_score >= 50) recommendation = 'moderate'
  else recommendation = 'weak'
  
  return {
    overall_score,
    dimension_scores: dimensionScores,
    breakdown,
    recommendation,
  }
}

// Batch matching - find top matches for a talent
export function findTopMatches(
  talent: TalentProfile,
  opportunities: OpportunityProfile[],
  limit = 10
): { opportunity: OpportunityProfile; match: MatchResult }[] {
  return opportunities
    .map(opportunity => ({
      opportunity,
      match: calculateMatch(talent, opportunity),
    }))
    .sort((a, b) => b.match.overall_score - a.match.overall_score)
    .slice(0, limit)
}

// Batch matching - find top candidates for an opportunity
export function findTopCandidates(
  opportunity: OpportunityProfile,
  talents: TalentProfile[],
  limit = 10
): { talent: TalentProfile; match: MatchResult }[] {
  return talents
    .map(talent => ({
      talent,
      match: calculateMatch(talent, opportunity),
    }))
    .sort((a, b) => b.match.overall_score - a.match.overall_score)
    .slice(0, limit)
}
