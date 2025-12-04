'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { ArrowLeft, X, Plus, Loader2 } from 'lucide-react'

const ROLE_LEVELS = [
  { id: 'L1', name: 'Sales Associate' },
  { id: 'L2', name: 'Senior Sales' },
  { id: 'L3', name: 'Team Lead' },
  { id: 'L4', name: 'Assistant Manager' },
  { id: 'L5', name: 'Store Manager' },
  { id: 'L6', name: 'Area Manager' },
  { id: 'L7', name: 'Regional Director' },
  { id: 'L8', name: 'VP / Executive' },
]

const STORE_TIERS = [
  { id: 'T1', name: 'Flagship' },
  { id: 'T2', name: 'Premier' },
  { id: 'T3', name: 'Standard' },
  { id: 'T4', name: 'Outlet' },
  { id: 'T5', name: 'Pop-up' },
]

const DIVISIONS = [
  'fashion', 'leather_goods', 'shoes', 'watches', 
  'high_jewelry', 'beauty', 'fragrance', 'eyewear', 'accessories'
]

const LANGUAGES = [
  'French', 'English', 'Mandarin', 'Arabic', 'Russian', 
  'Japanese', 'Korean', 'German', 'Italian', 'Spanish', 'Portuguese'
]

const MOBILITY_OPTIONS = [
  { value: 'local', label: 'Local only', desc: 'Same city' },
  { value: 'national', label: 'National', desc: 'Same country' },
  { value: 'international', label: 'International', desc: 'Open to relocate' },
]

const TIMELINE_OPTIONS = [
  { value: 'active', label: 'Actively Looking', color: 'success' },
  { value: 'passive', label: 'Open to Opportunities', color: 'warning' },
  { value: 'not_looking', label: 'Not Looking', color: 'default' },
]

interface TalentData {
  id: string
  first_name: string
  last_name: string
  phone: string
  linkedin_url: string
  current_location: string
  current_role_level: string
  current_store_tier: string
  store_tier_experience: string[]
  years_in_luxury: number | null
  current_employer: string
  divisions_expertise: string[]
  languages: string[]
  career_preferences: {
    target_role_levels: string[]
    target_store_tiers: string[]
    target_divisions: string[]
    target_locations: string[]
    target_brands: string[]
    mobility: string
    timeline: string
  }
}

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<TalentData | null>(null)
  const [newLocation, setNewLocation] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

  useEffect(() => {
    loadTalentData()
  }, [])

  const loadTalentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: talent, error } = await supabase
        .from('talents')
        .select('*')
        .eq('profile_id', user.id)
        .single()

      if (error) throw error
      if (!talent) {
        router.push('/talent/onboarding')
        return
      }

      setFormData({
        id: talent.id,
        first_name: talent.first_name || '',
        last_name: talent.last_name || '',
        phone: talent.phone || '',
        linkedin_url: talent.linkedin_url || '',
        current_location: talent.current_location || '',
        current_role_level: talent.current_role_level || '',
        current_store_tier: talent.current_store_tier || '',
        store_tier_experience: talent.store_tier_experience || [],
        years_in_luxury: talent.years_in_luxury,
        current_employer: talent.current_employer || '',
        divisions_expertise: talent.divisions_expertise || [],
        languages: talent.languages || [],
        career_preferences: {
          target_role_levels: talent.career_preferences?.target_role_levels || [],
          target_store_tiers: talent.career_preferences?.target_store_tiers || [],
          target_divisions: talent.career_preferences?.target_divisions || [],
          target_locations: talent.career_preferences?.target_locations || [],
          target_brands: talent.career_preferences?.target_brands || [],
          mobility: talent.career_preferences?.mobility || 'national',
          timeline: talent.career_preferences?.timeline || 'passive',
        }
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (updates: Partial<TalentData>) => {
    if (!formData) return
    setFormData(prev => prev ? { ...prev, ...updates } : null)
  }

  const updatePreferences = (updates: Partial<TalentData['career_preferences']>) => {
    if (!formData) return
    setFormData(prev => prev ? {
      ...prev,
      career_preferences: { ...prev.career_preferences, ...updates }
    } : null)
  }

  const toggleArrayItem = <K extends keyof TalentData>(key: K, item: string) => {
    if (!formData) return
    const current = formData[key] as string[]
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item]
    updateForm({ [key]: updated } as Partial<TalentData>)
  }

  const togglePreferenceArrayItem = (key: keyof TalentData['career_preferences'], item: string) => {
    if (!formData) return
    const current = formData.career_preferences[key] as string[]
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item]
    updatePreferences({ [key]: updated })
  }

  const addTargetLocation = () => {
    if (newLocation.trim() && formData) {
      if (!formData.career_preferences.target_locations.includes(newLocation.trim())) {
        updatePreferences({
          target_locations: [...formData.career_preferences.target_locations, newLocation.trim()]
        })
      }
      setNewLocation('')
    }
  }

  const removeTargetLocation = (loc: string) => {
    if (!formData) return
    updatePreferences({
      target_locations: formData.career_preferences.target_locations.filter(l => l !== loc)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setSaving(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('talents')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          linkedin_url: formData.linkedin_url || null,
          current_location: formData.current_location || null,
          current_role_level: formData.current_role_level || null,
          current_store_tier: formData.current_store_tier || null,
          store_tier_experience: formData.store_tier_experience,
          years_in_luxury: formData.years_in_luxury,
          current_employer: formData.current_employer || null,
          divisions_expertise: formData.divisions_expertise,
          languages: formData.languages,
          career_preferences: formData.career_preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', formData.id)

      if (updateError) throw updateError

      router.push('/talent/profile')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ivory)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)]" />
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-[var(--ivory)] flex items-center justify-center">
        <p className="text-[var(--grey-600)]">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/talent/profile" className="flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Profile</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-h2 mb-2">Edit Profile</h1>
        <p className="text-[var(--grey-600)] mb-8">Update your professional information</p>

        {error && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => updateForm({ first_name: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => updateForm({ last_name: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateForm({ phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
              />

              <Input
                label="LinkedIn URL"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => updateForm({ linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />

              <Input
                label="Current Location"
                value={formData.current_location}
                onChange={(e) => updateForm({ current_location: e.target.value })}
                placeholder="Paris, France"
              />
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Current Employer"
                value={formData.current_employer}
                onChange={(e) => updateForm({ current_employer: e.target.value })}
                placeholder="e.g., Louis Vuitton"
              />

              <Input
                label="Years in Luxury Retail"
                type="number"
                min="0"
                max="50"
                value={formData.years_in_luxury?.toString() || ''}
                onChange={(e) => updateForm({ years_in_luxury: e.target.value ? parseInt(e.target.value) : null })}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Current Role Level</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_LEVELS.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => updateForm({ current_role_level: level.id })}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.current_role_level === level.id 
                          ? 'bg-[var(--charcoal)] text-white' 
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                        }
                      `}
                    >
                      {level.id} • {level.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Store Tier Experience (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {STORE_TIERS.map(tier => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => toggleArrayItem('store_tier_experience', tier.id)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.store_tier_experience.includes(tier.id) 
                          ? 'bg-[var(--gold)] text-white' 
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                        }
                      `}
                    >
                      {tier.id} • {tier.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Divisions & Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Product Divisions</label>
                <div className="flex flex-wrap gap-2">
                  {DIVISIONS.map(div => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => toggleArrayItem('divisions_expertise', div)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors capitalize
                        ${formData.divisions_expertise.includes(div) 
                          ? 'bg-[var(--gold-light)] text-[var(--gold-dark)] border border-[var(--gold)]' 
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                        }
                      `}
                    >
                      {div.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleArrayItem('languages', lang)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.languages.includes(lang) 
                          ? 'bg-[var(--info)] text-white' 
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                        }
                      `}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Career Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Job Search Status</label>
                <div className="flex flex-wrap gap-3">
                  {TIMELINE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updatePreferences({ timeline: opt.value })}
                      className={`
                        px-4 py-2 rounded-[var(--radius-md)] text-sm transition-colors border
                        ${formData.career_preferences.timeline === opt.value 
                          ? opt.color === 'success' 
                            ? 'bg-[var(--success-light)] border-[var(--success)] text-[var(--success)]'
                            : opt.color === 'warning'
                              ? 'bg-[var(--warning-light)] border-[var(--warning)] text-[var(--warning)]'
                              : 'bg-[var(--grey-200)] border-[var(--grey-400)] text-[var(--grey-700)]'
                          : 'border-[var(--grey-200)] hover:border-[var(--grey-300)]'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Role Levels</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_LEVELS.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => togglePreferenceArrayItem('target_role_levels', level.id)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.career_preferences.target_role_levels.includes(level.id) 
                          ? 'bg-[var(--charcoal)] text-white' 
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                        }
                      `}
                    >
                      {level.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mobility</label>
                <div className="flex flex-wrap gap-3">
                  {MOBILITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updatePreferences({ mobility: opt.value })}
                      className={`
                        px-4 py-2 rounded-[var(--radius-md)] text-sm transition-colors border
                        ${formData.career_preferences.mobility === opt.value 
                          ? 'bg-[var(--gold-light)] border-[var(--gold)] text-[var(--gold-dark)]'
                          : 'border-[var(--grey-200)] hover:border-[var(--grey-300)]'
                        }
                      `}
                    >
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-[var(--grey-500)] ml-1">({opt.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Locations</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.career_preferences.target_locations.map(loc => (
                    <span key={loc} className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--grey-100)] rounded-full text-sm">
                      {loc}
                      <button type="button" onClick={() => removeTargetLocation(loc)} className="text-[var(--grey-500)] hover:text-[var(--error)]">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Add a location (e.g., Dubai, UAE)"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetLocation())}
                  />
                  <Button type="button" variant="secondary" onClick={addTargetLocation}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Link href="/talent/profile">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}