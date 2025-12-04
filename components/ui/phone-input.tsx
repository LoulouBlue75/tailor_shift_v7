'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { PHONE_CODES, POPULAR_PHONE_CODES, searchPhoneCodes, type PhoneCode } from '@/lib/data/phone-codes'

interface PhoneInputProps {
  label?: string
  countryCode: string
  phone: string
  onCountryCodeChange: (code: string) => void
  onPhoneChange: (phone: string) => void
  hint?: string
  required?: boolean
  className?: string
}

export function PhoneInput({
  label = 'Phone Number',
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  hint,
  required = false,
  className = '',
}: PhoneInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get selected phone code
  const selectedCode = useMemo(() => {
    return PHONE_CODES.find(p => p.code === countryCode) || POPULAR_PHONE_CODES[0]
  }, [countryCode])

  // Filter codes based on search
  const filteredCodes = useMemo(() => {
    if (!searchQuery) return null
    return searchPhoneCodes(searchQuery)
  }, [searchQuery])

  // Handle country selection
  const handleSelectCountry = (code: PhoneCode) => {
    onCountryCodeChange(code.code)
    setDropdownOpen(false)
    setSearchQuery('')
  }

  // Format phone number as user types (basic formatting)
  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters except spaces
    const cleaned = value.replace(/[^\d\s]/g, '').trim()
    onPhoneChange(cleaned)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
          {label}
          {required && <span className="text-[var(--error)] ml-1">*</span>}
        </label>
      )}

      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="
              flex items-center gap-1 px-3 py-2.5 h-[44px]
              bg-[var(--grey-100)] border border-[var(--grey-200)] border-r-0
              rounded-l-[var(--radius-md)] text-sm
              hover:bg-[var(--grey-200)] transition-colors
              min-w-[100px]
            "
          >
            <span className="text-lg">{selectedCode.emoji}</span>
            <span className="font-medium">{selectedCode.code}</span>
            <ChevronDown className={`w-4 h-4 text-[var(--grey-500)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute z-50 left-0 top-full mt-1 w-64 bg-white border border-[var(--grey-200)] rounded-[var(--radius-md)] shadow-lg max-h-72 overflow-y-auto">
              {/* Search */}
              <div className="sticky top-0 bg-white p-2 border-b border-[var(--grey-100)]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--grey-400)]" />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--grey-200)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="py-1">
                {filteredCodes ? (
                  // Search results
                  filteredCodes.length > 0 ? (
                    filteredCodes.map(code => (
                      <button
                        key={code.countryId}
                        type="button"
                        onClick={() => handleSelectCountry(code)}
                        className={`
                          w-full px-3 py-2 text-left text-sm flex items-center gap-2
                          ${countryCode === code.code
                            ? 'bg-[var(--gold-light)] text-[var(--gold-dark)]'
                            : 'hover:bg-[var(--grey-50)]'
                          }
                        `}
                      >
                        <span>{code.emoji}</span>
                        <span className="flex-1">{code.name}</span>
                        <span className="text-[var(--grey-500)]">{code.code}</span>
                        {countryCode === code.code && <Check className="w-3 h-3" />}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-[var(--grey-500)] text-center">
                      No countries found
                    </div>
                  )
                ) : (
                  // Default list with popular first
                  <>
                    {/* Popular */}
                    <div className="px-3 py-1.5 text-xs font-semibold text-[var(--grey-500)] bg-[var(--grey-50)]">
                      📍 Popular
                    </div>
                    {POPULAR_PHONE_CODES.map(code => (
                      <button
                        key={`popular-${code.countryId}`}
                        type="button"
                        onClick={() => handleSelectCountry(code)}
                        className={`
                          w-full px-3 py-2 text-left text-sm flex items-center gap-2
                          ${countryCode === code.code
                            ? 'bg-[var(--gold-light)] text-[var(--gold-dark)]'
                            : 'hover:bg-[var(--grey-50)]'
                          }
                        `}
                      >
                        <span>{code.emoji}</span>
                        <span className="flex-1">{code.name}</span>
                        <span className="text-[var(--grey-500)]">{code.code}</span>
                        {countryCode === code.code && <Check className="w-3 h-3" />}
                      </button>
                    ))}

                    {/* All countries */}
                    <div className="px-3 py-1.5 text-xs font-semibold text-[var(--grey-500)] bg-[var(--grey-50)]">
                      🌍 All Countries
                    </div>
                    {PHONE_CODES.filter(c => !POPULAR_PHONE_CODES.includes(c)).map(code => (
                      <button
                        key={code.countryId}
                        type="button"
                        onClick={() => handleSelectCountry(code)}
                        className={`
                          w-full px-3 py-2 text-left text-sm flex items-center gap-2
                          ${countryCode === code.code
                            ? 'bg-[var(--gold-light)] text-[var(--gold-dark)]'
                            : 'hover:bg-[var(--grey-50)]'
                          }
                        `}
                      >
                        <span>{code.emoji}</span>
                        <span className="flex-1">{code.name}</span>
                        <span className="text-[var(--grey-500)]">{code.code}</span>
                        {countryCode === code.code && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="6 12 34 56 78"
          className="
            flex-1 px-4 py-2.5 h-[44px]
            border border-[var(--grey-200)]
            rounded-r-[var(--radius-md)] text-sm
            focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent
          "
        />
      </div>

      {hint && (
        <p className="mt-1.5 text-xs text-[var(--grey-500)]">{hint}</p>
      )}
    </div>
  )
}