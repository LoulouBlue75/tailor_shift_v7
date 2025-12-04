import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { ArrowLeft, Plus, MapPin, Users, Calendar, ChevronRight, Eye, Pause, Play, Trash2, Edit, Briefcase, Building2 } from 'lucide-react'

export default async function BrandOpportunitiesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!brand) redirect('/brand/onboarding')

  // Get all opportunities for this brand with store info
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select(`
      *,
      store:stores(name, city, country, tier)
    `)
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })

  // Get match counts for each opportunity
  const opportunityIds = opportunities?.map(o => o.id) || []
  let matchCounts: Record<string, number> = {}
  
  if (opportunityIds.length > 0) {
    const { data: matches } = await supabase
      .from('matches')
      .select('opportunity_id')
      .in('opportunity_id', opportunityIds)
    
    if (matches) {
      matches.forEach(m => {
        matchCounts[m.opportunity_id] = (matchCounts[m.opportunity_id] || 0) + 1
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'draft':
        return <Badge variant="default">Draft</Badge>
      case 'paused':
        return <Badge variant="filled">Paused</Badge>
      case 'filled':
        return <Badge variant="success">Filled</Badge>
      case 'cancelled':
        return <Badge variant="default">Cancelled</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Group opportunities by status
  const activeOpps = opportunities?.filter(o => o.status === 'active') || []
  const draftOpps = opportunities?.filter(o => o.status === 'draft') || []
  const otherOpps = opportunities?.filter(o => !['active', 'draft'].includes(o.status)) || []

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[var(--grey-200)]">
                <Building2 className="w-4 h-4 text-[var(--gold)]" />
                <span className="font-medium text-sm">{brand.name}</span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/brand/dashboard" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Dashboard
              </Link>
              <Link href="/brand/opportunities" className="text-sm font-medium text-[var(--charcoal)]">
                Opportunities
              </Link>
              <Link href="/brand/pipeline" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Pipeline
              </Link>
              <Link href="/brand/stores" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Stores
              </Link>
            </nav>

            <Link href="/brand/opportunities/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Opportunity
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-h1 mb-1">Opportunities</h1>
            <p className="text-[var(--grey-600)]">
              Manage your job postings and track candidate interest
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--grey-600)]">
            <span>{activeOpps.length} active</span>
            <span className="text-[var(--grey-300)]">•</span>
            <span>{draftOpps.length} drafts</span>
            <span className="text-[var(--grey-300)]">•</span>
            <span>{opportunities?.length || 0} total</span>
          </div>
        </div>

        {/* No Opportunities State */}
        {(!opportunities || opportunities.length === 0) ? (
          <Card className="p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-[var(--grey-400)]" />
            <h3 className="text-h3 mb-2">No opportunities yet</h3>
            <p className="text-[var(--grey-600)] mb-6">
              Post your first opportunity to start finding exceptional talent
            </p>
            <Link href="/brand/opportunities/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Opportunity
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Opportunities */}
            {activeOpps.length > 0 && (
              <div>
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                  Active Opportunities
                </h2>
                <div className="space-y-3">
                  {activeOpps.map(opp => (
                    <OpportunityCard 
                      key={opp.id} 
                      opportunity={opp} 
                      matchCount={matchCounts[opp.id] || 0}
                      getStatusBadge={getStatusBadge}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Draft Opportunities */}
            {draftOpps.length > 0 && (
              <div>
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--grey-400)]"></span>
                  Drafts
                </h2>
                <div className="space-y-3">
                  {draftOpps.map(opp => (
                    <OpportunityCard 
                      key={opp.id} 
                      opportunity={opp} 
                      matchCount={matchCounts[opp.id] || 0}
                      getStatusBadge={getStatusBadge}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Opportunities */}
            {otherOpps.length > 0 && (
              <div>
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--grey-300)]"></span>
                  Closed / Paused
                </h2>
                <div className="space-y-3">
                  {otherOpps.map(opp => (
                    <OpportunityCard 
                      key={opp.id} 
                      opportunity={opp} 
                      matchCount={matchCounts[opp.id] || 0}
                      getStatusBadge={getStatusBadge}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// Opportunity Card Component
function OpportunityCard({
  opportunity,
  matchCount,
  getStatusBadge,
  formatDate
}: {
  opportunity: any
  matchCount: number
  getStatusBadge: (status: string) => React.ReactNode
  formatDate: (date: string) => string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-lg truncate">{opportunity.title}</h3>
              {getStatusBadge(opportunity.status)}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge variant="level">{opportunity.role_level}</Badge>
              {opportunity.division && (
                <Badge variant="filled">{opportunity.division.replace(/_/g, ' ')}</Badge>
              )}
              {opportunity.store && (
                <span className="flex items-center gap-1 text-sm text-[var(--grey-600)]">
                  <MapPin className="w-3.5 h-3.5" />
                  {opportunity.store.city}, {opportunity.store.country}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-[var(--grey-500)]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Posted {formatDate(opportunity.created_at)}
              </span>
              {opportunity.deadline_at && (
                <span className="flex items-center gap-1">
                  Deadline: {formatDate(opportunity.deadline_at)}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-display text-[var(--gold)]">{matchCount}</p>
              <p className="text-caption text-[var(--grey-500)]">matches</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/brand/opportunities/${opportunity.id}`}>
                <Button variant="secondary" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </Link>
              <Link href={`/brand/opportunities/${opportunity.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}