/**
 * International Phone Country Codes
 * 
 * Ordered by popularity in luxury retail markets
 */

export interface PhoneCode {
  countryId: string
  code: string
  name: string
  emoji: string
}

// Popular countries first (aligned with locations.ts)
export const PHONE_CODES: PhoneCode[] = [
  // 📍 Popular in Luxury Retail
  { countryId: 'france', code: '+33', name: 'France', emoji: '🇫🇷' },
  { countryId: 'uae', code: '+971', name: 'UAE', emoji: '🇦🇪' },
  { countryId: 'uk', code: '+44', name: 'United Kingdom', emoji: '🇬🇧' },
  { countryId: 'switzerland', code: '+41', name: 'Switzerland', emoji: '🇨🇭' },
  { countryId: 'hongkong', code: '+852', name: 'Hong Kong', emoji: '🇭🇰' },

  // 🇪🇺 Europe
  { countryId: 'italy', code: '+39', name: 'Italy', emoji: '🇮🇹' },
  { countryId: 'germany', code: '+49', name: 'Germany', emoji: '🇩🇪' },
  { countryId: 'spain', code: '+34', name: 'Spain', emoji: '🇪🇸' },
  { countryId: 'netherlands', code: '+31', name: 'Netherlands', emoji: '🇳🇱' },
  { countryId: 'belgium', code: '+32', name: 'Belgium', emoji: '🇧🇪' },
  { countryId: 'austria', code: '+43', name: 'Austria', emoji: '🇦🇹' },
  { countryId: 'monaco', code: '+377', name: 'Monaco', emoji: '🇲🇨' },
  { countryId: 'portugal', code: '+351', name: 'Portugal', emoji: '🇵🇹' },
  { countryId: 'greece', code: '+30', name: 'Greece', emoji: '🇬🇷' },
  { countryId: 'sweden', code: '+46', name: 'Sweden', emoji: '🇸🇪' },
  { countryId: 'denmark', code: '+45', name: 'Denmark', emoji: '🇩🇰' },
  { countryId: 'norway', code: '+47', name: 'Norway', emoji: '🇳🇴' },
  { countryId: 'ireland', code: '+353', name: 'Ireland', emoji: '🇮🇪' },
  { countryId: 'russia', code: '+7', name: 'Russia', emoji: '🇷🇺' },
  { countryId: 'turkey', code: '+90', name: 'Turkey', emoji: '🇹🇷' },

  // 🌴 Middle East
  { countryId: 'saudi', code: '+966', name: 'Saudi Arabia', emoji: '🇸🇦' },
  { countryId: 'qatar', code: '+974', name: 'Qatar', emoji: '🇶🇦' },
  { countryId: 'kuwait', code: '+965', name: 'Kuwait', emoji: '🇰🇼' },
  { countryId: 'bahrain', code: '+973', name: 'Bahrain', emoji: '🇧🇭' },
  { countryId: 'israel', code: '+972', name: 'Israel', emoji: '🇮🇱' },

  // 🌏 Asia Pacific
  { countryId: 'singapore', code: '+65', name: 'Singapore', emoji: '🇸🇬' },
  { countryId: 'japan', code: '+81', name: 'Japan', emoji: '🇯🇵' },
  { countryId: 'china', code: '+86', name: 'China', emoji: '🇨🇳' },
  { countryId: 'korea', code: '+82', name: 'South Korea', emoji: '🇰🇷' },
  { countryId: 'taiwan', code: '+886', name: 'Taiwan', emoji: '🇹🇼' },
  { countryId: 'macau', code: '+853', name: 'Macau', emoji: '🇲🇴' },
  { countryId: 'australia', code: '+61', name: 'Australia', emoji: '🇦🇺' },
  { countryId: 'newzealand', code: '+64', name: 'New Zealand', emoji: '🇳🇿' },
  { countryId: 'thailand', code: '+66', name: 'Thailand', emoji: '🇹🇭' },
  { countryId: 'malaysia', code: '+60', name: 'Malaysia', emoji: '🇲🇾' },
  { countryId: 'indonesia', code: '+62', name: 'Indonesia', emoji: '🇮🇩' },
  { countryId: 'vietnam', code: '+84', name: 'Vietnam', emoji: '🇻🇳' },
  { countryId: 'philippines', code: '+63', name: 'Philippines', emoji: '🇵🇭' },
  { countryId: 'india', code: '+91', name: 'India', emoji: '🇮🇳' },

  // 🌎 Americas
  { countryId: 'usa', code: '+1', name: 'United States', emoji: '🇺🇸' },
  { countryId: 'canada', code: '+1', name: 'Canada', emoji: '🇨🇦' },
  { countryId: 'mexico', code: '+52', name: 'Mexico', emoji: '🇲🇽' },
  { countryId: 'brazil', code: '+55', name: 'Brazil', emoji: '🇧🇷' },
  { countryId: 'argentina', code: '+54', name: 'Argentina', emoji: '🇦🇷' },
  { countryId: 'chile', code: '+56', name: 'Chile', emoji: '🇨🇱' },
  { countryId: 'colombia', code: '+57', name: 'Colombia', emoji: '🇨🇴' },
]

// Popular codes for quick access
export const POPULAR_PHONE_CODES = PHONE_CODES.slice(0, 5)

/**
 * Search phone codes by country name or code
 */
export function searchPhoneCodes(query: string): PhoneCode[] {
  const lowerQuery = query.toLowerCase().replace('+', '')
  return PHONE_CODES.filter(
    p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.code.replace('+', '').includes(lowerQuery) ||
      p.countryId.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get phone code by country ID
 */
export function getPhoneCodeByCountry(countryId: string): PhoneCode | undefined {
  return PHONE_CODES.find(p => p.countryId === countryId)
}

/**
 * Get phone code by dial code string
 */
export function getPhoneCodeByCode(code: string): PhoneCode | undefined {
  const normalized = code.startsWith('+') ? code : `+${code}`
  return PHONE_CODES.find(p => p.code === normalized)
}