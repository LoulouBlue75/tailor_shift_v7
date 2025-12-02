'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { ArrowLeft, Check, Plus, X, MapPin } from 'lucide-react'

const ROLE_LEVELS = [
  { id: 'L1', name: 'Sales Associate', desc: 'Entry-level, 0-2 years' },
  { id: 'L2', name: 'Senior Sales', desc: '2-4 years experience' },
  { id: 'L3', name: 'Team Lead', desc: '4-6 years, specialist' },
  { id: 'L4', name: 'Assistant Manager', desc: '5-8 years, supervisory' },
  { id: 'L5', name: 'Store Manager', desc: '8+ years, full P&L' },
  { id: 'L6', name: 'Area Manager', desc: 'Multi-store' },
  { id: 'L7', name: 'Regional Director', desc: 'Regional leadership' },
  { id: 'L8', name: 'VP / Executive', desc: 'Executive level' },
]

const DIVISIONS = [
  'fashion', 'leather_goods', 'shoes', 'watches', 
  'high_jewelry', 'beauty', 'fragrance', 'eyewear', 'accessories'
]

const LANGUAGES = ['English', 'French', 'Mandarin', 'Arabic', 'Spanish', 'Italian', 'German', 'Japanese', 'Portuguese', 'Russian']

export default function NewOpportunityPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stores, setStores] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    title: '',
    role_level: '',
    division: '',
    store_id: '',
    required_experience_years: '',
    required_languages: [] as string[],
    description: '',
    responsibilities: [] as string[],
    salary_min: '',
    salary_max: '',
    salary_currency: 'EUR',
  })

  const [newResponsibility, setNewResponsibility] = useState('')

  useEffect(() => {
    const loadStores = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (brand) {
        const { data } = await supabase
          .from('stores')
          .select('*')
          .eq('brand_id', brand.id)
          .eq('status', 'active')
        setStores(data || [])
      }
    }
    loadStores()
  }, [supabase])

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleLanguage = (lang: string) => {
    const current = formData.required_languages
    const updated = current.includes(lang)
      ? current.filter(l => l !== lang)
      : [...current, lang]
    updateForm({ required_languages: updated })
  }

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      updateForm({ responsibilities: [...formData.responsibilities, newResponsibility.trim()] })
      setNewResponsibility('')
    }
  }

  const removeResponsibility = (index: number) => {
    updateForm({ responsibilities: formData.responsibilities.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!brand) throw new Error('Brand not found')

      const { error: insertError } = await supabase
        .from('opportunities')
        .insert({
          brand_id: brand.id,
          store_id: formData.store_id || null,
          title: formData.title,
          role_level: formData.role_level,
          division: formData.division || null,
          required_experience_years: formData.required_experience_years 
            ? parseInt(formData.required_experience_years) 
            : null,
          required_languages: formData.required_languages,
          description: formData.description || null,
          responsibilities: formData.responsibilities,
          compensation_range: formData.salary_min || formData.salary_max ? {
            min: formData.salary_min ? parseInt(formData.salary_min) : null,
            max: formData.salary_max ? parseInt(formData.salary_max) : null,
            currency: formData.salary_currency,
          } : {},
          status: 'draft',
        })

      if (insertError) throw insertError

      router.push('/brand/opportunities')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <header className="bg-white border-b border-[var(--grey-200)]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/brand/opportunities" className="flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Opportunities</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-h2 mb-2">Post New Opportunity</h1>
        <p className="text-[var(--grey-600)] mb-8">Create a new position to find matching candidates</p>

        {error && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Job Title"
                placeholder="e.g., Senior Sales Advisor"
                value={formData.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-3">
                  Role Level <span className="text-[var(--error)]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_LEVELS.map(level => (
                    <Card
                      key={level.id}
                      variant={formData.role_level === level.id ? 'selected' : 'interactive'}
                      className="p-3 cursor-pointer"
                      onClick={() => updateForm({ role_level: level.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="level" size="sm">{level.id}</Badge>
                            <span className="font-medium text-sm">{level.name}</span>
                          </div>
                          <p className="text-small text-[var(--grey-600)] mt-1">{level.desc}</p>
                        </div>
                        {formData.role_level === level.id && (
                          <Check className="w-4 h-4 text-[var(--gold)] shrink-0" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Division</label>
                <div className="flex flex-wrap gap-2">
                  {DIVISIONS.map(div => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => updateForm({ division: formData.division === div ? '' : div })}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                        formData.division === div
                          ? 'bg-[var(--gold-light)] text-[var(--gold-dark)] border border-[var(--gold)]'
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                      }`}
                    >
                      {div.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              {stores.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {stores.map(store => (
                    <Card
                      key={store.id}
                      variant={formData.store_id === store.id ? 'selected' : 'interactive'}
                      className="p-3 cursor-pointer"
                      onClick={() => updateForm({ store_id: store.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-[var(--grey-500)]" />
                          <div>
                            <p className="font-medium text-sm">{store.name}</p>
                            <p className="text-small text-[var(--grey-600)]">{store.city}, {store.country}</p>
                          </div>
                          {store.tier && <Badge variant="tier" size="sm">{store.tier}</Badge>}
                        </div>
                        {formData.store_id === store.id && (
                          <Check className="w-4 h-4 text-[var(--gold)]" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[var(--grey-500)]">
                  <p>No stores added yet</p>
                  <Link href="/brand/stores/new">
                    <Button variant="ghost" size="sm" className="mt-2">Add Store First</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                type="number"
                label="Minimum Experience (years)"
                placeholder="e.g., 3"
                value={formData.required_experience_years}
                onChange={(e) => updateForm({ required_experience_years: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Required Languages</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        formData.required_languages.includes(lang)
                          ? 'bg-[var(--charcoal)] text-white'
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description & Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Describe the role, ideal candidate, and what makes this opportunity unique..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--grey-300)] focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-light)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key Responsibilities</label>
                <div className="space-y-2 mb-3">
                  {formData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-[var(--grey-100)] rounded-[var(--radius-sm)]">
                      <Check className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <span className="flex-1 text-sm">{resp}</span>
                      <button type="button" onClick={() => removeResponsibility(index)} className="text-[var(--grey-500)] hover:text-[var(--error)]">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    placeholder="e.g., Achieve monthly sales targets"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                  />
                  <Button type="button" variant="secondary" onClick={addResponsibility}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle>Compensation (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Min Salary"
                  placeholder="40000"
                  value={formData.salary_min}
                  onChange={(e) => updateForm({ salary_min: e.target.value })}
                />
                <Input
                  type="number"
                  label="Max Salary"
                  placeholder="60000"
                  value={formData.salary_max}
                  onChange={(e) => updateForm({ salary_max: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={formData.salary_currency}
                    onChange={(e) => updateForm({ salary_currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--grey-300)] focus:border-[var(--gold)] focus:outline-none"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>
              <p className="text-small text-[var(--grey-500)] mt-2">
                Salary information is confidential and used for matching only
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <Link href="/brand/opportunities">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <div className="flex gap-3">
              <Button type="submit" variant="secondary" loading={loading}>
                Save as Draft
              </Button>
              <Button type="submit" loading={loading} disabled={!formData.title || !formData.role_level}>
                Publish Opportunity
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
