import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import Link from 'next/link'
import { 
  ArrowLeft, Store, Plus, MapPin, Users, ChevronRight, Filter
} from 'lucide-react'

const TIER_LABELS: Record<string, string> = {
  T1: 'Flagship',
  T2: 'Premier',
  T3: 'Standard',
  T4: 'Outlet',
  T5: 'Pop-up',
}

export default async function StoresPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!brand) redirect('/brand/onboarding')

  // Get all stores for this brand
  const { data: stores } = await supabase
    .from('stores')
    .select('*')
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })

  // Group stores by region
  const storesByRegion = stores?.reduce((acc, store) => {
    const region = store.region || 'Other'
    if (!acc[region]) acc[region] = []
    acc[region].push(store)
    return acc
  }, {} as Record<string, typeof stores>)

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/brand/dashboard">
                <ArrowLeft className="w-5 h-5 text-[var(--grey-600)] hover:text-[var(--charcoal)]" />
              </Link>
              <Logo size="md" />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/brand/dashboard" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Dashboard
              </Link>
              <Link href="/brand/opportunities" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Opportunities
              </Link>
              <Link href="/brand/pipeline" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Pipeline
              </Link>
              <Link href="/brand/stores" className="text-sm font-medium text-[var(--charcoal)]">
                Stores
              </Link>
            </nav>

            <Link href="/brand/stores/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-h1 mb-1">Store Locations</h1>
            <p className="text-[var(--grey-600)]">
              Manage your boutiques and store network
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--grey-200)] bg-white text-sm hover:border-[var(--grey-300)]">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
                <Store className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <div>
                <p className="text-xl font-display">{stores?.length || 0}</p>
                <p className="text-small text-[var(--grey-600)]">Total Stores</p>
              </div>
            </div>
          </Card>
          {['EMEA', 'Americas', 'APAC'].map(region => (
            <Card key={region} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--grey-100)] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[var(--grey-600)]" />
                </div>
                <div>
                  <p className="text-xl font-display">{storesByRegion?.[region]?.length || 0}</p>
                  <p className="text-small text-[var(--grey-600)]">{region}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Store List */}
        {(!stores || stores.length === 0) ? (
          <Card className="p-12 text-center">
            <Store className="w-12 h-12 mx-auto mb-4 text-[var(--grey-400)]" />
            <h3 className="text-lg font-medium mb-2">No stores yet</h3>
            <p className="text-[var(--grey-600)] mb-6">Add your first store location to start recruiting for it</p>
            <Link href="/brand/stores/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Store
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(storesByRegion || {}).map(([region, regionStores]) => (
              <div key={region}>
                <h2 className="text-lg font-medium mb-4">{region}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(regionStores as any[])?.map((store) => (
                    <Card key={store.id} className="p-5 hover:border-[var(--grey-300)] transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{store.name}</h3>
                          <p className="text-small text-[var(--grey-600)]">{store.city}, {store.country}</p>
                        </div>
                        {store.tier && (
                          <Badge variant="filled" size="sm">
                            {TIER_LABELS[store.tier] || store.tier}
                          </Badge>
                        )}
                      </div>
                      
                      {store.address && (
                        <div className="flex items-center gap-2 text-small text-[var(--grey-600)] mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{store.address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--grey-100)]">
                        <div className="flex items-center gap-4 text-small">
                          {store.team_size && (
                            <span className="flex items-center gap-1 text-[var(--grey-600)]">
                              <Users className="w-3.5 h-3.5" />
                              {store.team_size}
                            </span>
                          )}
                          {store.divisions?.length > 0 && (
                            <span className="text-[var(--grey-500)]">
                              {store.divisions.length} division{store.divisions.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}