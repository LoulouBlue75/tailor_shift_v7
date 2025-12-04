/**
 * International Location Data for Luxury Retail
 * 
 * Structured for optimal UX: Country → City (2-step selection)
 * Countries grouped by region for visual organization
 */

// ============================================================================
// TYPES
// ============================================================================

export interface City {
  id: string
  name: string
  premium: string // e.g., '+15-25%', 'Baseline', '+40-60% (tax-free)'
}

export interface Country {
  id: string
  name: string
  emoji: string
  region: RegionId
  cities: City[]
}

export interface Region {
  id: RegionId
  name: string
  emoji: string
}

export type RegionId = 'europe' | 'middle_east' | 'asia_pacific' | 'americas'

// ============================================================================
// REGIONS
// ============================================================================

export const REGIONS: Region[] = [
  { id: 'europe', name: 'Europe', emoji: '🇪🇺' },
  { id: 'middle_east', name: 'Middle East', emoji: '🌴' },
  { id: 'asia_pacific', name: 'Asia Pacific', emoji: '🌏' },
  { id: 'americas', name: 'Americas', emoji: '🌎' },
]

// ============================================================================
// POPULAR COUNTRIES (shown first in dropdown)
// ============================================================================

export const POPULAR_COUNTRY_IDS = [
  'france',
  'uae',
  'uk',
  'switzerland',
  'hongkong',
]

// ============================================================================
// COUNTRIES WITH CITIES
// ============================================================================

export const COUNTRIES: Country[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // EUROPE
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'france',
    name: 'France',
    emoji: '🇫🇷',
    region: 'europe',
    cities: [
      { id: 'paris', name: 'Paris', premium: '+15-25%' },
      { id: 'lyon', name: 'Lyon', premium: 'Baseline' },
      { id: 'nice', name: 'Nice / Côte d\'Azur', premium: '+5-10%' },
      { id: 'cannes', name: 'Cannes', premium: '+10-15%' },
      { id: 'bordeaux', name: 'Bordeaux', premium: 'Baseline' },
      { id: 'marseille', name: 'Marseille', premium: 'Baseline' },
      { id: 'other_fr', name: 'Other France', premium: 'Baseline' },
    ],
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    emoji: '🇬🇧',
    region: 'europe',
    cities: [
      { id: 'london', name: 'London', premium: '+20-30%' },
      { id: 'manchester', name: 'Manchester', premium: '+5-10%' },
      { id: 'birmingham', name: 'Birmingham', premium: 'Baseline' },
      { id: 'edinburgh', name: 'Edinburgh', premium: '+5-10%' },
      { id: 'other_uk', name: 'Other UK', premium: 'Baseline' },
    ],
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    emoji: '🇨🇭',
    region: 'europe',
    cities: [
      { id: 'geneva', name: 'Geneva', premium: '+25-35%' },
      { id: 'zurich', name: 'Zurich', premium: '+25-35%' },
      { id: 'basel', name: 'Basel', premium: '+20-30%' },
      { id: 'lugano', name: 'Lugano', premium: '+15-25%' },
      { id: 'other_ch', name: 'Other Switzerland', premium: '+20-30%' },
    ],
  },
  {
    id: 'italy',
    name: 'Italy',
    emoji: '🇮🇹',
    region: 'europe',
    cities: [
      { id: 'milan', name: 'Milan', premium: '+10-20%' },
      { id: 'rome', name: 'Rome', premium: '+5-15%' },
      { id: 'florence', name: 'Florence', premium: '+5-10%' },
      { id: 'venice', name: 'Venice', premium: '+5-10%' },
      { id: 'other_it', name: 'Other Italy', premium: 'Baseline' },
    ],
  },
  {
    id: 'germany',
    name: 'Germany',
    emoji: '🇩🇪',
    region: 'europe',
    cities: [
      { id: 'munich', name: 'Munich', premium: '+10-20%' },
      { id: 'frankfurt', name: 'Frankfurt', premium: '+5-15%' },
      { id: 'dusseldorf', name: 'Düsseldorf', premium: '+5-10%' },
      { id: 'berlin', name: 'Berlin', premium: '+5-10%' },
      { id: 'hamburg', name: 'Hamburg', premium: '+5-10%' },
      { id: 'other_de', name: 'Other Germany', premium: 'Baseline' },
    ],
  },
  {
    id: 'spain',
    name: 'Spain',
    emoji: '🇪🇸',
    region: 'europe',
    cities: [
      { id: 'madrid', name: 'Madrid', premium: '+5-10%' },
      { id: 'barcelona', name: 'Barcelona', premium: '+5-10%' },
      { id: 'marbella', name: 'Marbella', premium: '+10-15%' },
      { id: 'ibiza', name: 'Ibiza', premium: '+10-15%' },
      { id: 'other_es', name: 'Other Spain', premium: 'Baseline' },
    ],
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    emoji: '🇳🇱',
    region: 'europe',
    cities: [
      { id: 'amsterdam', name: 'Amsterdam', premium: '+10-15%' },
      { id: 'other_nl', name: 'Other Netherlands', premium: 'Baseline' },
    ],
  },
  {
    id: 'belgium',
    name: 'Belgium',
    emoji: '🇧🇪',
    region: 'europe',
    cities: [
      { id: 'brussels', name: 'Brussels', premium: '+5-10%' },
      { id: 'antwerp', name: 'Antwerp', premium: '+5-10%' },
      { id: 'other_be', name: 'Other Belgium', premium: 'Baseline' },
    ],
  },
  {
    id: 'austria',
    name: 'Austria',
    emoji: '🇦🇹',
    region: 'europe',
    cities: [
      { id: 'vienna', name: 'Vienna', premium: '+10-15%' },
      { id: 'other_at', name: 'Other Austria', premium: 'Baseline' },
    ],
  },
  {
    id: 'monaco',
    name: 'Monaco',
    emoji: '🇲🇨',
    region: 'europe',
    cities: [
      { id: 'monaco_city', name: 'Monaco', premium: '+30-50%' },
    ],
  },
  {
    id: 'portugal',
    name: 'Portugal',
    emoji: '🇵🇹',
    region: 'europe',
    cities: [
      { id: 'lisbon', name: 'Lisbon', premium: '+5-10%' },
      { id: 'porto', name: 'Porto', premium: 'Baseline' },
      { id: 'other_pt', name: 'Other Portugal', premium: 'Baseline' },
    ],
  },
  {
    id: 'greece',
    name: 'Greece',
    emoji: '🇬🇷',
    region: 'europe',
    cities: [
      { id: 'athens', name: 'Athens', premium: 'Baseline' },
      { id: 'mykonos', name: 'Mykonos', premium: '+15-25%' },
      { id: 'other_gr', name: 'Other Greece', premium: 'Baseline' },
    ],
  },
  {
    id: 'sweden',
    name: 'Sweden',
    emoji: '🇸🇪',
    region: 'europe',
    cities: [
      { id: 'stockholm', name: 'Stockholm', premium: '+10-15%' },
      { id: 'other_se', name: 'Other Sweden', premium: 'Baseline' },
    ],
  },
  {
    id: 'denmark',
    name: 'Denmark',
    emoji: '🇩🇰',
    region: 'europe',
    cities: [
      { id: 'copenhagen', name: 'Copenhagen', premium: '+10-15%' },
      { id: 'other_dk', name: 'Other Denmark', premium: 'Baseline' },
    ],
  },
  {
    id: 'norway',
    name: 'Norway',
    emoji: '🇳🇴',
    region: 'europe',
    cities: [
      { id: 'oslo', name: 'Oslo', premium: '+15-25%' },
      { id: 'other_no', name: 'Other Norway', premium: 'Baseline' },
    ],
  },
  {
    id: 'ireland',
    name: 'Ireland',
    emoji: '🇮🇪',
    region: 'europe',
    cities: [
      { id: 'dublin', name: 'Dublin', premium: '+10-15%' },
      { id: 'other_ie', name: 'Other Ireland', premium: 'Baseline' },
    ],
  },
  {
    id: 'russia',
    name: 'Russia',
    emoji: '🇷🇺',
    region: 'europe',
    cities: [
      { id: 'moscow', name: 'Moscow', premium: '+20-35%' },
      { id: 'stpetersburg', name: 'St. Petersburg', premium: '+10-20%' },
      { id: 'other_ru', name: 'Other Russia', premium: 'Variable' },
    ],
  },
  {
    id: 'turkey',
    name: 'Turkey',
    emoji: '🇹🇷',
    region: 'europe',
    cities: [
      { id: 'istanbul', name: 'Istanbul', premium: '+5-15%' },
      { id: 'other_tr', name: 'Other Turkey', premium: 'Baseline' },
    ],
  },
  {
    id: 'other_europe',
    name: 'Other Europe',
    emoji: '🇪🇺',
    region: 'europe',
    cities: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MIDDLE EAST
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'uae',
    name: 'UAE',
    emoji: '🇦🇪',
    region: 'middle_east',
    cities: [
      { id: 'dubai', name: 'Dubai', premium: '+40-60% (tax-free)' },
      { id: 'abu_dhabi', name: 'Abu Dhabi', premium: '+35-55% (tax-free)' },
      { id: 'other_ae', name: 'Other UAE', premium: '+30-50% (tax-free)' },
    ],
  },
  {
    id: 'saudi',
    name: 'Saudi Arabia',
    emoji: '🇸🇦',
    region: 'middle_east',
    cities: [
      { id: 'riyadh', name: 'Riyadh', premium: '+30-50% (tax-free)' },
      { id: 'jeddah', name: 'Jeddah', premium: '+25-45% (tax-free)' },
      { id: 'other_sa', name: 'Other Saudi Arabia', premium: '+20-40% (tax-free)' },
    ],
  },
  {
    id: 'qatar',
    name: 'Qatar',
    emoji: '🇶🇦',
    region: 'middle_east',
    cities: [
      { id: 'doha', name: 'Doha', premium: '+35-55% (tax-free)' },
    ],
  },
  {
    id: 'kuwait',
    name: 'Kuwait',
    emoji: '🇰🇼',
    region: 'middle_east',
    cities: [
      { id: 'kuwait_city', name: 'Kuwait City', premium: '+30-50% (tax-free)' },
    ],
  },
  {
    id: 'bahrain',
    name: 'Bahrain',
    emoji: '🇧🇭',
    region: 'middle_east',
    cities: [
      { id: 'manama', name: 'Manama', premium: '+25-45% (tax-free)' },
    ],
  },
  {
    id: 'israel',
    name: 'Israel',
    emoji: '🇮🇱',
    region: 'middle_east',
    cities: [
      { id: 'tel_aviv', name: 'Tel Aviv', premium: '+15-25%' },
      { id: 'other_il', name: 'Other Israel', premium: 'Baseline' },
    ],
  },
  {
    id: 'other_middle_east',
    name: 'Other Middle East',
    emoji: '🌴',
    region: 'middle_east',
    cities: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ASIA PACIFIC
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'hongkong',
    name: 'Hong Kong',
    emoji: '🇭🇰',
    region: 'asia_pacific',
    cities: [
      { id: 'hk_central', name: 'Central / Causeway Bay', premium: '+35-50%' },
      { id: 'hk_tst', name: 'Tsim Sha Tsui', premium: '+30-45%' },
      { id: 'hk_other', name: 'Other Hong Kong', premium: '+25-40%' },
    ],
  },
  {
    id: 'singapore',
    name: 'Singapore',
    emoji: '🇸🇬',
    region: 'asia_pacific',
    cities: [
      { id: 'sg_orchard', name: 'Orchard Road', premium: '+30-45%' },
      { id: 'sg_marina', name: 'Marina Bay', premium: '+30-45%' },
      { id: 'sg_other', name: 'Other Singapore', premium: '+25-40%' },
    ],
  },
  {
    id: 'japan',
    name: 'Japan',
    emoji: '🇯🇵',
    region: 'asia_pacific',
    cities: [
      { id: 'tokyo', name: 'Tokyo', premium: '+25-40%' },
      { id: 'osaka', name: 'Osaka', premium: '+15-30%' },
      { id: 'kyoto', name: 'Kyoto', premium: '+10-20%' },
      { id: 'other_jp', name: 'Other Japan', premium: '+10-20%' },
    ],
  },
  {
    id: 'china',
    name: 'China',
    emoji: '🇨🇳',
    region: 'asia_pacific',
    cities: [
      { id: 'shanghai', name: 'Shanghai', premium: '+20-35%' },
      { id: 'beijing', name: 'Beijing', premium: '+15-30%' },
      { id: 'shenzhen', name: 'Shenzhen', premium: '+15-25%' },
      { id: 'guangzhou', name: 'Guangzhou', premium: '+10-20%' },
      { id: 'chengdu', name: 'Chengdu', premium: '+5-15%' },
      { id: 'hangzhou', name: 'Hangzhou', premium: '+10-20%' },
      { id: 'other_cn', name: 'Other China', premium: 'Variable' },
    ],
  },
  {
    id: 'korea',
    name: 'South Korea',
    emoji: '🇰🇷',
    region: 'asia_pacific',
    cities: [
      { id: 'seoul', name: 'Seoul', premium: '+20-35%' },
      { id: 'busan', name: 'Busan', premium: '+10-20%' },
      { id: 'other_kr', name: 'Other South Korea', premium: 'Baseline' },
    ],
  },
  {
    id: 'taiwan',
    name: 'Taiwan',
    emoji: '🇹🇼',
    region: 'asia_pacific',
    cities: [
      { id: 'taipei', name: 'Taipei', premium: '+15-25%' },
      { id: 'other_tw', name: 'Other Taiwan', premium: 'Baseline' },
    ],
  },
  {
    id: 'macau',
    name: 'Macau',
    emoji: '🇲🇴',
    region: 'asia_pacific',
    cities: [
      { id: 'macau_city', name: 'Macau', premium: '+30-45%' },
    ],
  },
  {
    id: 'australia',
    name: 'Australia',
    emoji: '🇦🇺',
    region: 'asia_pacific',
    cities: [
      { id: 'sydney', name: 'Sydney', premium: '+15-25%' },
      { id: 'melbourne', name: 'Melbourne', premium: '+10-20%' },
      { id: 'brisbane', name: 'Brisbane', premium: '+5-10%' },
      { id: 'perth', name: 'Perth', premium: '+5-10%' },
      { id: 'other_au', name: 'Other Australia', premium: 'Baseline' },
    ],
  },
  {
    id: 'newzealand',
    name: 'New Zealand',
    emoji: '🇳🇿',
    region: 'asia_pacific',
    cities: [
      { id: 'auckland', name: 'Auckland', premium: '+5-15%' },
      { id: 'other_nz', name: 'Other New Zealand', premium: 'Baseline' },
    ],
  },
  {
    id: 'thailand',
    name: 'Thailand',
    emoji: '🇹🇭',
    region: 'asia_pacific',
    cities: [
      { id: 'bangkok', name: 'Bangkok', premium: '+10-20%' },
      { id: 'other_th', name: 'Other Thailand', premium: 'Baseline' },
    ],
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    emoji: '🇲🇾',
    region: 'asia_pacific',
    cities: [
      { id: 'kuala_lumpur', name: 'Kuala Lumpur', premium: '+10-20%' },
      { id: 'other_my', name: 'Other Malaysia', premium: 'Baseline' },
    ],
  },
  {
    id: 'indonesia',
    name: 'Indonesia',
    emoji: '🇮🇩',
    region: 'asia_pacific',
    cities: [
      { id: 'jakarta', name: 'Jakarta', premium: '+10-20%' },
      { id: 'bali', name: 'Bali', premium: '+5-15%' },
      { id: 'other_id', name: 'Other Indonesia', premium: 'Baseline' },
    ],
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    emoji: '🇻🇳',
    region: 'asia_pacific',
    cities: [
      { id: 'ho_chi_minh', name: 'Ho Chi Minh City', premium: '+5-15%' },
      { id: 'hanoi', name: 'Hanoi', premium: '+5-10%' },
      { id: 'other_vn', name: 'Other Vietnam', premium: 'Baseline' },
    ],
  },
  {
    id: 'philippines',
    name: 'Philippines',
    emoji: '🇵🇭',
    region: 'asia_pacific',
    cities: [
      { id: 'manila', name: 'Manila', premium: '+5-10%' },
      { id: 'other_ph', name: 'Other Philippines', premium: 'Baseline' },
    ],
  },
  {
    id: 'india',
    name: 'India',
    emoji: '🇮🇳',
    region: 'asia_pacific',
    cities: [
      { id: 'mumbai', name: 'Mumbai', premium: '+10-20%' },
      { id: 'delhi', name: 'Delhi / NCR', premium: '+5-15%' },
      { id: 'bangalore', name: 'Bangalore', premium: '+5-10%' },
      { id: 'other_in', name: 'Other India', premium: 'Baseline' },
    ],
  },
  {
    id: 'other_asia_pacific',
    name: 'Other Asia Pacific',
    emoji: '🌏',
    region: 'asia_pacific',
    cities: [],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // AMERICAS
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'usa',
    name: 'United States',
    emoji: '🇺🇸',
    region: 'americas',
    cities: [
      { id: 'nyc', name: 'New York', premium: '+25-40%' },
      { id: 'los_angeles', name: 'Los Angeles', premium: '+15-30%' },
      { id: 'miami', name: 'Miami', premium: '+10-25%' },
      { id: 'las_vegas', name: 'Las Vegas', premium: '+10-20%' },
      { id: 'san_francisco', name: 'San Francisco', premium: '+15-25%' },
      { id: 'chicago', name: 'Chicago', premium: '+10-20%' },
      { id: 'dallas', name: 'Dallas', premium: '+5-15%' },
      { id: 'houston', name: 'Houston', premium: '+5-15%' },
      { id: 'boston', name: 'Boston', premium: '+10-20%' },
      { id: 'atlanta', name: 'Atlanta', premium: '+5-15%' },
      { id: 'other_us', name: 'Other US', premium: 'Variable' },
    ],
  },
  {
    id: 'canada',
    name: 'Canada',
    emoji: '🇨🇦',
    region: 'americas',
    cities: [
      { id: 'toronto', name: 'Toronto', premium: '+10-20%' },
      { id: 'vancouver', name: 'Vancouver', premium: '+10-20%' },
      { id: 'montreal', name: 'Montreal', premium: '+5-15%' },
      { id: 'other_ca', name: 'Other Canada', premium: 'Baseline' },
    ],
  },
  {
    id: 'mexico',
    name: 'Mexico',
    emoji: '🇲🇽',
    region: 'americas',
    cities: [
      { id: 'mexico_city', name: 'Mexico City', premium: 'Variable' },
      { id: 'cancun', name: 'Cancún', premium: 'Variable' },
      { id: 'other_mx', name: 'Other Mexico', premium: 'Variable' },
    ],
  },
  {
    id: 'brazil',
    name: 'Brazil',
    emoji: '🇧🇷',
    region: 'americas',
    cities: [
      { id: 'sao_paulo', name: 'São Paulo', premium: 'Variable' },
      { id: 'rio', name: 'Rio de Janeiro', premium: 'Variable' },
      { id: 'other_br', name: 'Other Brazil', premium: 'Variable' },
    ],
  },
  {
    id: 'argentina',
    name: 'Argentina',
    emoji: '🇦🇷',
    region: 'americas',
    cities: [
      { id: 'buenos_aires', name: 'Buenos Aires', premium: 'Variable' },
      { id: 'other_ar', name: 'Other Argentina', premium: 'Variable' },
    ],
  },
  {
    id: 'chile',
    name: 'Chile',
    emoji: '🇨🇱',
    region: 'americas',
    cities: [
      { id: 'santiago', name: 'Santiago', premium: 'Variable' },
      { id: 'other_cl', name: 'Other Chile', premium: 'Variable' },
    ],
  },
  {
    id: 'colombia',
    name: 'Colombia',
    emoji: '🇨🇴',
    region: 'americas',
    cities: [
      { id: 'bogota', name: 'Bogotá', premium: 'Variable' },
      { id: 'other_co', name: 'Other Colombia', premium: 'Variable' },
    ],
  },
  {
    id: 'caribbean',
    name: 'Caribbean',
    emoji: '🏝️',
    region: 'americas',
    cities: [
      { id: 'st_barts', name: 'St. Barths', premium: '+20-35%' },
      { id: 'bahamas', name: 'Bahamas', premium: '+10-20%' },
      { id: 'other_caribbean', name: 'Other Caribbean', premium: 'Variable' },
    ],
  },
  {
    id: 'other_americas',
    name: 'Other Americas',
    emoji: '🌎',
    region: 'americas',
    cities: [],
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get popular countries (shown at top of dropdown)
 */
export function getPopularCountries(): Country[] {
  return POPULAR_COUNTRY_IDS
    .map(id => COUNTRIES.find(c => c.id === id))
    .filter((c): c is Country => c !== undefined)
}

/**
 * Get countries grouped by region (for dropdown sections)
 */
export function getCountriesByRegion(): Record<RegionId, Country[]> {
  return {
    europe: COUNTRIES.filter(c => c.region === 'europe'),
    middle_east: COUNTRIES.filter(c => c.region === 'middle_east'),
    asia_pacific: COUNTRIES.filter(c => c.region === 'asia_pacific'),
    americas: COUNTRIES.filter(c => c.region === 'americas'),
  }
}

/**
 * Get country by ID
 */
export function getCountryById(id: string): Country | undefined {
  return COUNTRIES.find(c => c.id === id)
}

/**
 * Get cities for a country
 */
export function getCitiesForCountry(countryId: string): City[] {
  const country = getCountryById(countryId)
  return country?.cities || []
}

/**
 * Get city by ID within a country
 */
export function getCityById(countryId: string, cityId: string): City | undefined {
  return getCitiesForCountry(countryId).find(c => c.id === cityId)
}

/**
 * Search countries by name (for searchable dropdown)
 */
export function searchCountries(query: string): Country[] {
  const lowerQuery = query.toLowerCase()
  return COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.id.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get region name for a country
 */
export function getRegionForCountry(countryId: string): Region | undefined {
  const country = getCountryById(countryId)
  if (!country) return undefined
  return REGIONS.find(r => r.id === country.region)
}

// ============================================================================
// LEGACY MIGRATION MAP
// Maps old region IDs to new country/city format
// ============================================================================

export const LEGACY_REGION_MAP: Record<string, { country: string; city: string | null }> = {
  'france_paris': { country: 'france', city: 'paris' },
  'france_province': { country: 'france', city: null },
  'suisse': { country: 'switzerland', city: null },
  'uae_dubai': { country: 'uae', city: 'dubai' },
  'emea_other': { country: 'other_europe', city: null },
  'asia': { country: 'other_asia_pacific', city: null },
  'americas': { country: 'other_americas', city: null },
}