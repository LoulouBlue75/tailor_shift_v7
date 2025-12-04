import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button, UserMenu } from '@/components/ui'
import { ArrowLeft, Building2, MapPin, Calendar, Clock, Users, DollarSign, Edit, Pause, Trash2, Eye, UserPlus, ChevronRight, CheckCircle } from 'lucide-react'

export default async function BrandOpportunityDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get the brand for this user
  const { data: brandMember } = await supabase
    .from('brand_members')
    .select('brand_id, role')
    .eq('profile_id', user.id)
    .single()

  if (!brandMember) redirect('/brand/onboarding')

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandMember.brand_id)
    .single()

  // Get the opportunity with store and matches info
  const { data: opportunity, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      store:stores(id, name, city, country, tier, address),
      matches:matches(count)
    `)
    .eq('id', id)
    .eq('brand_id', brandMember.brand_id)
    .single()

  if (error || !opportunity) {
    notFound()
  }

  // Get all matches for this opportunity with talent info
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      talent:talents(
        id, first_name, last_name, current_role, years_experience,
        compensation_profile
      )
    `)
    .eq('opportunity_id', id)
    .order('match_score', { ascending: false })

  // Group matches by status
  const newMatches = matches?.filter(m => m.status === 'matched') || []
  const interested = matches?.filter(m => m.status === 'interested' || m.status === 'mutual') || []
  const interviewing = matches?.filter(m => m.status === 'interviewing' || m.status === 'offer') || []
  const closed = matches?.filter(m => m.status === 'hired' || m.status === 'declined') || []

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getStatusBadge = (status: string): React.ReactNode => {
    switch (status) {
      case 'draft':
        return <Badge variant="level">Draft</Badge>
      case 'active':
        return <Badge variant="tier" className="bg-[var(--success-light)] text-[var(--success)]">Active</Badge>
      case 'paused':
        return <Badge variant="level" className="bg-[var(--grey-100)] text-[var(--grey-600)]">Paused</Badge>
      case 'closed':
        return <Badge variant="level" className="bg-[var(--error-light)] text-[var(--error)]">Closed</Badge>
      default:
        return <Badge variant="level">{status}</Badge>
    }
  }

  // User menu info
  const userInitials = profile?.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="md" />
            </div>
            
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
              <Link href="/brand/team" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Team
              </Link>
            </nav>

            <UserMenu
              initials={userInitials}
              fullName={brand?.name || 'Brand'}
              email={profile?.email}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Navigation */}
        <Link href="/brand/opportunities" className="inline-flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </Link>

        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-h1">{opportunity.title}</h1>
              {getStatusBadge(opportunity.status)}
            </div>
            <p className="text-[var(--grey-600)]">
              {opportunity.store?.name} • {opportunity.store?.city}, {opportunity.store?.country}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            {opportunity.status === 'active' ? (
              <Button variant="secondary" size="sm">
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            ) : opportunity.status === 'paused' ? (
              <Button size="sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Activate
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-h3 mb-4">Position Details</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Role Level</p>
                    <p className="font-medium">{opportunity.role_level || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Division</p>
                    <p className="font-medium capitalize">{opportunity.division?.replace(/_/g, ' ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Contract Type</p>
                    <p className="font-medium">{opportunity.contract_type || 'CDI'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Start Date</p>
                    <p className="font-medium">{formatDate(opportunity.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Application Deadline</p>
                    <p className="font-medium">{formatDate(opportunity.closes_at)}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Created</p>
                    <p className="font-medium">{formatDate(opportunity.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[var(--gold)]" />
                  Compensation Range
                </h2>
                
                {opportunity.compensation_range ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-small text-[var(--grey-500)] mb-1">Base Salary Range</p>
                      <p className="font-medium">
                        €{opportunity.compensation_range.min_base?.toLocaleString()} - €{opportunity.compensation_range.max_base?.toLocaleString()}
                      </p>
                    </div>
                    {opportunity.compensation_range.variable_percentage && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-1">Variable Component</p>
                        <p className="font-medium">{opportunity.compensation_range.variable_percentage}% of base</p>
                      </div>
                    )}
                    {opportunity.compensation_range.currency && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-1">Currency</p>
                        <p className="font-medium">{opportunity.compensation_range.currency}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--grey-500)]">No compensation range specified</p>
                )}
              </CardContent>
            </Card>

            {/* Requirements Card */}
            {opportunity.requirements && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-h3 mb-4">Requirements</h2>
                  
                  <div className="space-y-4">
                    {opportunity.requirements.min_experience && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-1">Minimum Experience</p>
                        <p className="font-medium">{opportunity.requirements.min_experience} years</p>
                      </div>
                    )}
                    {opportunity.requirements.required_languages?.length > 0 && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-1">Required Languages</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {opportunity.requirements.required_languages.map((lang: string) => (
                            <Badge key={lang} variant="filled">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {opportunity.requirements.required_skills?.length > 0 && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-1">Required Skills</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {opportunity.requirements.required_skills.map((skill: string) => (
                            <Badge key={skill} variant="filled">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Pipeline Summary</h3>
                
                <div className="space-y-3">
                  <Link href={`/brand/pipeline?opportunity=${id}&status=matched`} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--grey-50)] hover:bg-[var(--grey-100)] transition-colors">
                    <span className="text-sm">New Matches</span>
                    <span className="font-medium text-[var(--gold)]">{newMatches.length}</span>
                  </Link>
                  <Link href={`/brand/pipeline?opportunity=${id}&status=interested`} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--grey-50)] hover:bg-[var(--grey-100)] transition-colors">
                    <span className="text-sm">Interested</span>
                    <span className="font-medium text-[var(--info)]">{interested.length}</span>
                  </Link>
                  <Link href={`/brand/pipeline?opportunity=${id}&status=interviewing`} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--grey-50)] hover:bg-[var(--grey-100)] transition-colors">
                    <span className="text-sm">Interviewing</span>
                    <span className="font-medium text-[var(--success)]">{interviewing.length}</span>
                  </Link>
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--grey-50)]">
                    <span className="text-sm">Closed</span>
                    <span className="font-medium text-[var(--grey-500)]">{closed.length}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--grey-200)]">
                  <Link href={`/brand/pipeline?opportunity=${id}`}>
                    <Button variant="secondary" className="w-full">
                      View Full Pipeline
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Store Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Store</h3>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--grey-100)] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[var(--grey-500)]" />
                  </div>
                  <div>
                    <p className="font-medium">{opportunity.store?.name}</p>
                    <p className="text-sm text-[var(--grey-600)] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {opportunity.store?.city}, {opportunity.store?.country}
                    </p>
                    {opportunity.store?.tier && (
                      <Badge variant="tier" className="mt-2">{opportunity.store.tier}</Badge>
                    )}
                  </div>
                </div>

                <Link href={`/brand/stores?id=${opportunity.store?.id}`} className="block mt-4">
                  <Button variant="ghost" size="sm" className="w-full">
                    View Store Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {matches && matches.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-h4 mb-4">Recent Candidates</h3>
                  
                  <div className="space-y-3">
                    {matches.slice(0, 5).map(match => (
                      <Link 
                        key={match.id} 
                        href={`/brand/pipeline/${match.talent_id}`}
                        className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] hover:bg-[var(--grey-50)] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white text-sm">
                          {match.talent?.first_name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {match.talent?.first_name} {match.talent?.last_name}
                          </p>
                          <p className="text-xs text-[var(--grey-500)]">
                            {match.match_score}% match
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}