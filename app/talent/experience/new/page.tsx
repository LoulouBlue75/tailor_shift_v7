'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { ArrowLeft, Plus, X, Check } from 'lucide-react'

const BLOCK_TYPES = [
  { id: 'foh', name: 'Front of House', desc: 'Sales, client advisory, clienteling' },
  { id: 'boh', name: 'Back of House', desc: 'Stock, operations, VM' },
  { id: 'leadership', name: 'Leadership', desc: 'Team management, coaching' },
  { id: 'clienteling', name: 'Clienteling', desc: 'VIC management, events' },
  { id: 'operations', name: 'Operations', desc: 'Store operations, compliance' },
  { id: 'business', name: 'Business Dev', desc: 'Sales strategy, targets' },
]

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

export default function NewExperiencePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    block_type: 'foh',
    title: '',
    maison: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    role_level: '',
    store_tier: '',
    divisions_handled: [] as string[],
    description: '',
    achievements: [] as string[],
  })

  const [newAchievement, setNewAchievement] = useState('')

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleDivision = (div: string) => {
    const current = formData.divisions_handled
    const updated = current.includes(div)
      ? current.filter(d => d !== div)
      : [...current, div]
    updateForm({ divisions_handled: updated })
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      updateForm({ achievements: [...formData.achievements, newAchievement.trim()] })
      setNewAchievement('')
    }
  }

  const removeAchievement = (index: number) => {
    updateForm({ achievements: formData.achievements.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: talent } = await supabase
        .from('talents')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!talent) throw new Error('Talent profile not found')

      const { error: insertError } = await supabase
        .from('experience_blocks')
        .insert({
          talent_id: talent.id,
          block_type: formData.block_type,
          title: formData.title,
          maison: formData.maison || null,
          location: formData.location || null,
          start_date: formData.start_date || null,
          end_date: formData.is_current ? null : (formData.end_date || null),
          is_current: formData.is_current,
          role_level: formData.role_level || null,
          store_tier: formData.store_tier || null,
          divisions_handled: formData.divisions_handled,
          description: formData.description || null,
          achievements: formData.achievements,
        })

      if (insertError) throw insertError

      router.push('/talent/profile')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/talent/profile" className="flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Profile</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-h2 mb-2">Add Experience</h1>
        <p className="text-[var(--grey-600)] mb-8">Add your professional experience in luxury retail</p>

        {error && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Experience Type */}
          <Card>
            <CardHeader>
              <CardTitle>Type of Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BLOCK_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => updateForm({ block_type: type.id })}
                    className={`
                      p-3 rounded-[var(--radius-md)] border text-left transition-colors
                      ${formData.block_type === type.id 
                        ? 'border-[var(--gold)] bg-[var(--gold-light)]' 
                        : 'border-[var(--grey-200)] hover:border-[var(--grey-300)]'
                      }
                    `}
                  >
                    <p className="font-medium text-sm">{type.name}</p>
                    <p className="text-small text-[var(--grey-600)]">{type.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

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

              <Input
                label="Maison / Brand"
                placeholder="e.g., Louis Vuitton"
                value={formData.maison}
                onChange={(e) => updateForm({ maison: e.target.value })}
              />

              <Input
                label="Location"
                placeholder="e.g., Paris, France"
                value={formData.location}
                onChange={(e) => updateForm({ location: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(e) => updateForm({ start_date: e.target.value })}
                />
                <Input
                  type="date"
                  label="End Date"
                  value={formData.end_date}
                  onChange={(e) => updateForm({ end_date: e.target.value })}
                  disabled={formData.is_current}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_current}
                  onChange={(e) => updateForm({ is_current: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--grey-300)]"
                />
                <span className="text-sm">I currently work here</span>
              </label>
            </CardContent>
          </Card>

          {/* Role Level & Store Tier */}
          <Card>
            <CardHeader>
              <CardTitle>Level & Environment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Role Level</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_LEVELS.map(level => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => updateForm({ role_level: level.id })}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.role_level === level.id 
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
                <label className="block text-sm font-medium mb-2">Store Tier</label>
                <div className="flex flex-wrap gap-2">
                  {STORE_TIERS.map(tier => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => updateForm({ store_tier: tier.id })}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.store_tier === tier.id 
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

          {/* Divisions */}
          <Card>
            <CardHeader>
              <CardTitle>Product Divisions Handled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {DIVISIONS.map(div => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => toggleDivision(div)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm transition-colors capitalize
                      ${formData.divisions_handled.includes(div) 
                        ? 'bg-[var(--gold-light)] text-[var(--gold-dark)] border border-[var(--gold)]' 
                        : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                      }
                    `}
                  >
                    {div.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description & Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Description & Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Describe your responsibilities and scope..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--grey-300)] focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-light)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key Achievements</label>
                <div className="space-y-2 mb-3">
                  {formData.achievements.map((ach, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-[var(--grey-100)] rounded-[var(--radius-sm)]">
                      <Check className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <span className="flex-1 text-sm">{ach}</span>
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="p-1 text-[var(--grey-500)] hover:text-[var(--error)]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="e.g., Increased sales by 30% YoY"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                  />
                  <Button type="button" variant="secondary" onClick={addAchievement}>
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
            <Button type="submit" loading={loading}>
              Save Experience
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
