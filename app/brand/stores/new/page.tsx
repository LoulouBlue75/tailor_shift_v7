'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { ArrowLeft, Check } from 'lucide-react'

const STORE_TIERS = [
  { id: 'T1', name: 'Flagship', desc: 'Capital city flagship stores' },
  { id: 'T2', name: 'Premier', desc: 'Major city, high volume' },
  { id: 'T3', name: 'Standard', desc: 'Regional city locations' },
  { id: 'T4', name: 'Outlet', desc: 'Outlet & travel retail' },
  { id: 'T5', name: 'Pop-up / Seasonal', desc: 'Temporary locations' },
]

const REGIONS = [
  { id: 'EMEA', name: 'EMEA', desc: 'Europe, Middle East & Africa' },
  { id: 'Americas', name: 'Americas', desc: 'North & South America' },
  { id: 'APAC', name: 'APAC', desc: 'Asia Pacific' },
  { id: 'Middle_East', name: 'Middle East', desc: 'GCC & Middle East' },
]

const DIVISIONS = [
  'fashion', 'leather_goods', 'shoes', 'watches', 
  'high_jewelry', 'beauty', 'fragrance', 'eyewear', 'accessories'
]

export default function NewStorePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    tier: '',
    city: '',
    country: '',
    region: '',
    address: '',
    divisions: [] as string[],
    team_size: '',
  })

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleDivision = (div: string) => {
    const current = formData.divisions
    const updated = current.includes(div)
      ? current.filter(d => d !== div)
      : [...current, div]
    updateForm({ divisions: updated })
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
        .from('stores')
        .insert({
          brand_id: brand.id,
          name: formData.name,
          code: formData.code || null,
          tier: formData.tier || null,
          city: formData.city,
          country: formData.country,
          region: formData.region || null,
          address: formData.address || null,
          divisions: formData.divisions,
          team_size: formData.team_size ? parseInt(formData.team_size) : null,
          status: 'active',
        })

      if (insertError) throw insertError

      router.push('/brand/stores')
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
          <Link href="/brand/stores" className="flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Stores</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-h2 mb-2">Add Store Location</h1>
        <p className="text-[var(--grey-600)] mb-8">Add a new boutique or store location</p>

        {error && (
          <div className="mb-6 p-3 rounded-[var(--radius-md)] bg-[var(--error-light)] text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Store Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Store Name"
                  placeholder="e.g., Champs-Élysées Flagship"
                  value={formData.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  required
                />
                <Input
                  label="Store Code"
                  placeholder="e.g., PAR-001"
                  value={formData.code}
                  onChange={(e) => updateForm({ code: e.target.value })}
                  hint="Optional internal reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Store Tier</label>
                <div className="grid grid-cols-1 gap-2">
                  {STORE_TIERS.map(tier => (
                    <Card
                      key={tier.id}
                      variant={formData.tier === tier.id ? 'selected' : 'interactive'}
                      className="p-3 cursor-pointer"
                      onClick={() => updateForm({ tier: tier.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded bg-[var(--grey-100)] flex items-center justify-center text-sm font-medium">
                            {tier.id}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{tier.name}</p>
                            <p className="text-small text-[var(--grey-600)]">{tier.desc}</p>
                          </div>
                        </div>
                        {formData.tier === tier.id && <Check className="w-4 h-4 text-[var(--gold)]" />}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="Paris"
                  value={formData.city}
                  onChange={(e) => updateForm({ city: e.target.value })}
                  required
                />
                <Input
                  label="Country"
                  placeholder="France"
                  value={formData.country}
                  onChange={(e) => updateForm({ country: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Address"
                placeholder="101 Avenue des Champs-Élysées"
                value={formData.address}
                onChange={(e) => updateForm({ address: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Region</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(region => (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => updateForm({ region: region.id })}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        formData.region === region.id
                          ? 'bg-[var(--charcoal)] text-white'
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Divisions & Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Divisions in Store</label>
                <div className="flex flex-wrap gap-2">
                  {DIVISIONS.map(div => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => toggleDivision(div)}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                        formData.divisions.includes(div)
                          ? 'bg-[var(--gold-light)] text-[var(--gold-dark)] border border-[var(--gold)]'
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                      }`}
                    >
                      {div.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                type="number"
                label="Team Size"
                placeholder="e.g., 25"
                value={formData.team_size}
                onChange={(e) => updateForm({ team_size: e.target.value })}
                hint="Approximate number of employees"
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <Link href="/brand/stores">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" loading={loading}>
              Add Store
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
