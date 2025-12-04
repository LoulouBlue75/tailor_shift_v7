'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { ArrowLeft, Plus, X, Check, ChevronDown, ChevronUp, Info } from 'lucide-react'

// ============================================================================
// CONSTANTS
// ============================================================================

const BLOCK_TYPES = [
  { id: 'foh', name: 'Front of House', desc: 'Sales, client advisory, clienteling' },
  { id: 'boh', name: 'Back of House', desc: 'Stock, operations, VM' },
  { id: 'leadership', name: 'Leadership', desc: 'Team management, coaching' },
  { id: 'clienteling', name: 'Clienteling', desc: 'VIC management, events' },
  { id: 'operations', name: 'Operations', desc: 'Store operations, compliance' },
  { id: 'business', name: 'Business Dev', desc: 'Sales strategy, targets' },
]

const BRAND_SEGMENTS = [
  { id: 'ultra_luxury', name: 'Ultra Luxury', examples: 'Hermès, Chanel, Brunello Cucinelli' },
  { id: 'luxury', name: 'Luxury', examples: 'Louis Vuitton, Dior, Gucci, Prada' },
  { id: 'premium', name: 'Premium', examples: 'Coach, Ralph Lauren, Hugo Boss' },
  { id: 'accessible_luxury', name: 'Accessible Luxury', examples: 'ba&sh, Maje, Sandro' },
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

// ============================================================================
// STORE CONTEXT OPTIONS (10 Dimensions)
// ============================================================================

const STORE_CONTEXT_OPTIONS = {
  format: [
    { value: 'flagship', label: 'Flagship', desc: 'Boutique emblématique' },
    { value: 'boutique', label: 'Boutique', desc: 'Point de vente standard' },
    { value: 'corner', label: 'Corner / Shop-in-Shop', desc: 'Espace en grand magasin' },
    { value: 'department_store', label: 'Grand Magasin', desc: 'Galeries Lafayette, Printemps' },
    { value: 'outlet', label: 'Outlet', desc: 'Village outlet, déstockage' },
    { value: 'popup', label: 'Pop-up', desc: 'Éphémère, événementiel' },
  ],
  surface: [
    { value: 'xs', label: '< 50m²' },
    { value: 's', label: '50-150m²' },
    { value: 'm', label: '150-300m²' },
    { value: 'l', label: '300-500m²' },
    { value: 'xl', label: '> 500m²' },
  ],
  team_size: [
    { value: '1-3', label: '1-3 personnes' },
    { value: '4-8', label: '4-8 personnes' },
    { value: '9-15', label: '9-15 personnes' },
    { value: '16-30', label: '16-30 personnes' },
    { value: '30+', label: '30+ personnes' },
  ],
  daily_traffic: [
    { value: 'vip', label: 'Sur RDV uniquement', desc: '< 20 clients/jour' },
    { value: 'low', label: '20-100 clients/jour' },
    { value: 'medium', label: '100-300 clients/jour' },
    { value: 'high', label: '300-500 clients/jour' },
    { value: 'very_high', label: '> 500 clients/jour' },
  ],
  revenue_scale: [
    { value: '<1M', label: '< 1M€/an' },
    { value: '1-5M', label: '1-5M€/an' },
    { value: '5-15M', label: '5-15M€/an' },
    { value: '15-50M', label: '15-50M€/an' },
    { value: '>50M', label: '> 50M€/an' },
  ],
  product_complexity: [
    { value: 'mono', label: 'Mono-produit', desc: 'Une seule catégorie' },
    { value: 'focused', label: 'Focalisé', desc: '2-3 catégories' },
    { value: 'multi', label: 'Multi-catégories', desc: 'Large gamme' },
    { value: 'lifestyle', label: 'Lifestyle complet', desc: 'Univers de marque' },
  ],
  sku_depth: [
    { value: 'curated', label: '< 100 SKUs' },
    { value: 'standard', label: '100-500 SKUs' },
    { value: 'wide', label: '500-2000 SKUs' },
    { value: 'extensive', label: '> 2000 SKUs' },
  ],
  client_profile: [
    { value: 'local_vip', label: 'VIP locaux' },
    { value: 'local_mixed', label: 'Locale mixte' },
    { value: 'tourist_heavy', label: '50%+ touristes' },
    { value: 'balanced', label: 'Équilibré local/touriste' },
  ],
  operating_hours: [
    { value: 'standard', label: 'Standard', desc: '10h-19h, lun-sam' },
    { value: 'extended', label: 'Étendus', desc: 'Dimanche, nocturnes' },
    { value: 'mall', label: 'Centre commercial' },
    { value: 'seasonal', label: 'Saisonnier' },
  ],
  org_model: [
    { value: 'autonomous', label: 'Autonome' },
    { value: 'cluster', label: 'En cluster', desc: 'Plusieurs boutiques, même ville' },
    { value: 'regional', label: 'Régional' },
    { value: 'matrix', label: 'Matriciel', desc: 'Double reporting' },
  ],
}

// ============================================================================
// POSITION SCOPE OPTIONS
// ============================================================================

const POSITION_SCOPE_OPTIONS = {
  management_span: [
    { value: 'ic', label: 'Contributeur individuel', desc: 'Pas de management' },
    { value: '1-3', label: '1-3 personnes' },
    { value: '4-10', label: '4-10 personnes' },
    { value: '10-20', label: '10-20 personnes' },
    { value: '20+', label: '20+ personnes' },
  ],
  foh_boh_split: [
    { value: '100_foh', label: '100% Vente' },
    { value: '80_20', label: '80% Vente / 20% Back' },
    { value: '50_50', label: '50/50' },
    { value: '20_80', label: '20% Vente / 80% Back' },
    { value: '100_boh', label: '100% Opérations' },
  ],
  reports_to: [
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'assistant_manager', label: 'Assistant Manager' },
    { value: 'store_manager', label: 'Store Manager' },
    { value: 'area_manager', label: 'Area Manager' },
    { value: 'regional_director', label: 'Regional Director' },
    { value: 'hq', label: 'Siège / HQ' },
  ],
}

// ============================================================================
// COMPONENT
// ============================================================================

interface StoreContext {
  format: string
  surface: string
  team_size: string
  daily_traffic: string
  revenue_scale: string
  product_complexity: string
  sku_depth: string
  client_profile: string
  operating_hours: string
  org_model: string
}

interface PositionScope {
  management_span: string
  foh_boh_split: string
  reports_to: string
  responsibilities: string[]
}

export default function NewExperiencePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [formData, setFormData] = useState({
    block_type: 'foh',
    title: '',
    company: '',
    brand_segment: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    role_level: '',
    store_tier: '',
    division: '',
    team_size: null as number | null,
    description: '',
    achievements: [] as string[],
    responsibilities: [] as string[],
    // Store Context (extended)
    store_context: {
      format: '',
      surface: '',
      team_size: '',
      daily_traffic: '',
      revenue_scale: '',
      product_complexity: '',
      sku_depth: '',
      client_profile: '',
      operating_hours: '',
      org_model: '',
    } as StoreContext,
    // Position Scope
    position_scope: {
      management_span: '',
      foh_boh_split: '',
      reports_to: '',
      responsibilities: [],
    } as PositionScope,
  })

  const [newAchievement, setNewAchievement] = useState('')
  const [newResponsibility, setNewResponsibility] = useState('')

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateStoreContext = (key: keyof StoreContext, value: string) => {
    setFormData(prev => ({
      ...prev,
      store_context: { ...prev.store_context, [key]: value }
    }))
  }

  const updatePositionScope = (key: keyof PositionScope, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      position_scope: { ...prev.position_scope, [key]: value }
    }))
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

      const { data: talent } = await supabase
        .from('talents')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!talent) throw new Error('Talent profile not found')

      // Only include store_context if at least one field is filled
      const hasStoreContext = Object.values(formData.store_context).some(v => v)
      const hasPositionScope = formData.position_scope.management_span || formData.position_scope.foh_boh_split

      const { error: insertError } = await supabase
        .from('experience_blocks')
        .insert({
          talent_id: talent.id,
          block_type: formData.block_type,
          title: formData.title,
          company: formData.company || null,
          brand_segment: formData.brand_segment || null,
          location: formData.location || null,
          start_date: formData.start_date || null,
          end_date: formData.is_current ? null : (formData.end_date || null),
          is_current: formData.is_current,
          role_level: formData.role_level || null,
          store_tier: formData.store_tier || null,
          division: formData.division || null,
          team_size: formData.team_size,
          responsibilities: formData.responsibilities,
          achievements: formData.achievements,
          store_context: hasStoreContext ? formData.store_context : null,
          position_scope: hasPositionScope ? formData.position_scope : null,
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
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/talent/profile" className="flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Profile</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
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
                value={formData.company}
                onChange={(e) => updateForm({ company: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Brand Segment</label>
                <div className="grid grid-cols-2 gap-3">
                  {BRAND_SEGMENTS.map(seg => (
                    <button
                      key={seg.id}
                      type="button"
                      onClick={() => updateForm({ brand_segment: seg.id })}
                      className={`
                        p-3 rounded-[var(--radius-md)] border text-left transition-colors
                        ${formData.brand_segment === seg.id 
                          ? 'border-[var(--gold)] bg-[var(--gold-light)]' 
                          : 'border-[var(--grey-200)] hover:border-[var(--grey-300)]'
                        }
                      `}
                    >
                      <p className="font-medium text-sm">{seg.name}</p>
                      <p className="text-xs text-[var(--grey-500)]">{seg.examples}</p>
                    </button>
                  ))}
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium mb-2">Primary Division</label>
                <div className="flex flex-wrap gap-2">
                  {DIVISIONS.map(div => (
                    <button
                      key={div}
                      type="button"
                      onClick={() => updateForm({ division: div })}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors capitalize
                        ${formData.division === div 
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

              <Input
                label="Team Size (direct reports)"
                type="number"
                min="0"
                placeholder="e.g., 5"
                value={formData.team_size?.toString() || ''}
                onChange={(e) => updateForm({ team_size: e.target.value ? parseInt(e.target.value) : null })}
              />
            </CardContent>
          </Card>

          {/* Position Scope */}
          <Card>
            <CardHeader>
              <CardTitle>Position Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Management Span</label>
                <div className="flex flex-wrap gap-2">
                  {POSITION_SCOPE_OPTIONS.management_span.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updatePositionScope('management_span', opt.value)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.position_scope.management_span === opt.value 
                          ? 'bg-[var(--charcoal)] text-white' 
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">FOH / BOH Split</label>
                <div className="flex flex-wrap gap-2">
                  {POSITION_SCOPE_OPTIONS.foh_boh_split.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updatePositionScope('foh_boh_split', opt.value)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.position_scope.foh_boh_split === opt.value 
                          ? 'bg-[var(--info)] text-white' 
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reports To</label>
                <div className="flex flex-wrap gap-2">
                  {POSITION_SCOPE_OPTIONS.reports_to.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updatePositionScope('reports_to', opt.value)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm transition-colors
                        ${formData.position_scope.reports_to === opt.value 
                          ? 'bg-[var(--grey-700)] text-white' 
                          : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Context - Advanced (Collapsible) */}
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <CardTitle>Store Context Details</CardTitle>
                  <Badge variant="filled" size="sm">Optional</Badge>
                </div>
                {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-6">
                <div className="p-3 bg-[var(--info-light)] rounded-[var(--radius-md)] text-sm text-[var(--info)] flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>These details help us find better matches for you. Fill what you know.</span>
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-medium mb-2">Store Format</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STORE_CONTEXT_OPTIONS.format.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('format', opt.value)}
                        className={`
                          p-2 rounded-[var(--radius-md)] border text-left transition-colors text-sm
                          ${formData.store_context.format === opt.value 
                            ? 'border-[var(--gold)] bg-[var(--gold-light)]' 
                            : 'border-[var(--grey-200)] hover:border-[var(--grey-300)]'
                          }
                        `}
                      >
                        <p className="font-medium">{opt.label}</p>
                        {opt.desc && <p className="text-xs text-[var(--grey-500)]">{opt.desc}</p>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Surface */}
                <div>
                  <label className="block text-sm font-medium mb-2">Surface Area</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.surface.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('surface', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.surface === opt.value 
                            ? 'bg-[var(--gold)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium mb-2">Store Team Size</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.team_size.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('team_size', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.team_size === opt.value 
                            ? 'bg-[var(--gold)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Traffic */}
                <div>
                  <label className="block text-sm font-medium mb-2">Daily Traffic</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.daily_traffic.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('daily_traffic', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.daily_traffic === opt.value 
                            ? 'bg-[var(--gold)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revenue Scale */}
                <div>
                  <label className="block text-sm font-medium mb-2">Store Revenue (Annual)</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.revenue_scale.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('revenue_scale', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.revenue_scale === opt.value 
                            ? 'bg-[var(--success)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Complexity */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Complexity</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.product_complexity.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('product_complexity', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.product_complexity === opt.value 
                            ? 'bg-[var(--gold)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SKU Depth */}
                <div>
                  <label className="block text-sm font-medium mb-2">SKU Depth</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.sku_depth.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('sku_depth', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.sku_depth === opt.value 
                            ? 'bg-[var(--gold)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Client Profile */}
                <div>
                  <label className="block text-sm font-medium mb-2">Client Profile</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.client_profile.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('client_profile', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.client_profile === opt.value 
                            ? 'bg-[var(--gold)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium mb-2">Operating Hours</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.operating_hours.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('operating_hours', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.operating_hours === opt.value 
                            ? 'bg-[var(--gold)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Org Model */}
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Model</label>
                  <div className="flex flex-wrap gap-2">
                    {STORE_CONTEXT_OPTIONS.org_model.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateStoreContext('org_model', opt.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-sm transition-colors
                          ${formData.store_context.org_model === opt.value 
                            ? 'bg-[var(--gold)] text-white' 
                            : 'bg-[var(--grey-100)] hover:bg-[var(--grey-200)]'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>Key Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-[var(--grey-100)] rounded-[var(--radius-sm)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--grey-300)] text-white flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm">{resp}</span>
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="p-1 text-[var(--grey-500)] hover:text-[var(--error)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  placeholder="e.g., Manage daily sales operations"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
                />
                <Button type="button" variant="secondary" onClick={addResponsibility}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Key Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
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
