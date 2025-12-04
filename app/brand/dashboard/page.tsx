import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button, UserMenu, PendingValidationBanner, getBannerTypeFromStatus } from '@/components/ui'
import { PendingTeamApprovals } from '@/components/brand/pending-team-approvals'
import { checkBrandPermission } from '@/lib/auth/brand-rbac'
import Link from 'next/link'
import {
  Building2, MapPin, Users, Briefcase, Plus,
  ChevronRight, Bell, Target, Store, Heart, TrendingUp, Lock
} from 'lucide-react'

export default async function BrandDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/brand/onboarding')
  }

  const { data: brand } = await supabase
    .from('brands')
    .select('*, status')
    .eq('profile_id', user.id)
    .single()

  if (!brand) redirect('/brand/onboarding')

  // Check for pending team request (for users who joined via team request)
  const { data: teamRequest } = await supabase
    .from('brand_team_requests')
    .select('id, status, brand_id')
    .eq('profile_id', user.id)
    .eq('status', 'pending')
    .single()

  // Determine the brand status for the banner
  const brandStatus = brand.status || (brand.verified ? 'verified' : 'pending_verification')
  const hasTeamRequest = !!teamRequest
  const teamRequestStatus = teamRequest?.status

  // Check if user can manage team (to show pending approvals)
  const canManageTeam = await checkBrandPermission(user.id, brand.id, 'manage_team')

  // Get store count
  const { count: storeCount } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brand.id)

  // Get active opportunities count
  const { count: opportunityCount } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brand.id)
    .eq('status', 'active')

  // Get matches count
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id')
    .eq('brand_id', brand.id)

  const opportunityIds = opportunities?.map(o => o.id) || []
  
  let matchCount = 0
  if (opportunityIds.length > 0) {
    const { count } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .in('opportunity_id', opportunityIds)
      .in('status', ['suggested', 'talent_interested', 'mutual'])
    matchCount = count || 0
  }

  // Get anonymized interest pool - talents who have this brand as a Dream Brand
  // PRIVACY: We only show aggregate counts, NEVER individual profiles
  const { data: interestedTalents } = await supabase
    .from('talents')
    .select('id, current_role_level, current_location, current_employer, internal_mobility_interest, career_preferences')
    .filter('career_preferences->target_brands', 'cs', `["${brand.name}"]`)
    .eq('status', 'active')

  // Aggregate by role level (anonymized)
  const interestByLevel: Record<string, number> = {}
  const interestByRegion: Record<string, number> = {}
  let internalMobilityCount = 0

  interestedTalents?.forEach((talent) => {
    // Count by role level
    const level = talent.current_role_level || 'Not specified'
    interestByLevel[level] = (interestByLevel[level] || 0) + 1
    
    // Count by region (extract region from location)
    const location = talent.current_location || 'Not specified'
    const region = location.split(',')[0].trim() // Take first part (city/region)
    interestByRegion[region] = (interestByRegion[region] || 0) + 1
    
    // Count internal mobility (current employees interested in internal moves)
    if (talent.current_employer?.toLowerCase() === brand.name.toLowerCase() &&
        talent.internal_mobility_interest) {
      internalMobilityCount++
    }
  })

  const totalInterested = interestedTalents?.length || 0

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
                {brand.verified && (
                  <Badge variant="success" size="sm">Verified</Badge>
                )}
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/brand/dashboard" className="text-sm font-medium text-[var(--charcoal)]">
                Dashboard
              </Link>
              <Link href="/brand/opportunities" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Opportunities
              </Link>
              <Link href="/brand/pipeline" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Pipeline
              </Link>
              <Link href="/brand/stores" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Stores
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] hover:bg-[var(--grey-100)] rounded-full relative transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <UserMenu
                initials={brand.contact_name?.[0] || brand.name?.[0] || 'A'}
                fullName={brand.contact_name || 'Admin'}
                email={profile?.email}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-h1 mb-1">
              Welcome, {brand.contact_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-[var(--grey-600)]">
              Manage your recruitment pipeline and find exceptional talent
            </p>
          </div>
          <Link href="/brand/opportunities/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post Opportunity
            </Button>
          </Link>
        </div>

        {/* Validation Status Banner */}
        {(() => {
          const bannerType = getBannerTypeFromStatus('brand', brandStatus, hasTeamRequest, teamRequestStatus)
          if (bannerType) {
            return (
              <PendingValidationBanner
                type={bannerType}
                brandName={brand.name}
              />
            )
          }
          return null
        })()}

        {/* Pending Team Approvals - show only for users who can manage team */}
        {canManageTeam && (
          <div className="mb-8">
            <PendingTeamApprovals brandId={brand.id} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{opportunityCount || 0}</p>
                <p className="text-small text-[var(--grey-600)]">Active Opportunities</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                <Target className="w-6 h-6 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{matchCount}</p>
                <p className="text-small text-[var(--grey-600)]">Candidate Matches</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--info-light)] flex items-center justify-center">
                <Store className="w-6 h-6 text-[var(--info)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{storeCount || 0}</p>
                <p className="text-small text-[var(--grey-600)]">Store Locations</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--grey-100)] flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--grey-600)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">0</p>
                <p className="text-small text-[var(--grey-600)]">In Pipeline</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Recent Candidates</CardTitle>
                <Link href="/brand/pipeline" className="text-small text-[var(--gold)] hover:underline">
                  View pipeline
                </Link>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-[var(--grey-500)]">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No candidates yet</p>
                  <p className="text-small">Post an opportunity to start receiving matches</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Quick Actions + Interest Pool */}
          <div className="space-y-6">
            {/* Interest Pool - ANONYMIZED */}
            <Card className="border-[var(--gold)] bg-[var(--gold-light)]/10">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[var(--gold)]" />
                  Talent Interest Pool
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-[var(--grey-500)]">
                  <Lock className="w-3 h-3" />
                  Anonymized
                </div>
              </CardHeader>
              <CardContent>
                {totalInterested > 0 ? (
                  <div className="space-y-4">
                    {/* Total Count */}
                    <div className="text-center p-4 bg-white rounded-[var(--radius-md)]">
                      <p className="text-3xl font-display font-light text-[var(--gold)]">{totalInterested}</p>
                      <p className="text-small text-[var(--grey-600)]">
                        Talents interested in {brand.name}
                      </p>
                    </div>

                    {/* By Role Level */}
                    {Object.keys(interestByLevel).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-[var(--grey-500)] uppercase tracking-wide mb-2">
                          By Role Level
                        </p>
                        <div className="space-y-1">
                          {Object.entries(interestByLevel)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([level, count]) => (
                              <div key={level} className="flex items-center justify-between text-sm">
                                <span className="text-[var(--grey-600)]">{level}</span>
                                <Badge variant="default" size="sm">{count}</Badge>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {/* By Region */}
                    {Object.keys(interestByRegion).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-[var(--grey-500)] uppercase tracking-wide mb-2">
                          By Location
                        </p>
                        <div className="space-y-1">
                          {Object.entries(interestByRegion)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 4)
                            .map(([region, count]) => (
                              <div key={region} className="flex items-center justify-between text-sm">
                                <span className="text-[var(--grey-600)]">{region}</span>
                                <Badge variant="default" size="sm">{count}</Badge>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {/* Internal Mobility */}
                    {internalMobilityCount > 0 && (
                      <div className="p-3 bg-[var(--burgundy)]/5 rounded-[var(--radius-md)] border border-[var(--burgundy)]/20">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[var(--burgundy)]" />
                          <div>
                            <p className="text-sm font-medium text-[var(--burgundy)]">
                              {internalMobilityCount} internal talent{internalMobilityCount > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-[var(--grey-600)]">
                              Current employees open to internal moves
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Privacy Notice */}
                    <p className="text-xs text-[var(--grey-500)] text-center mt-4">
                      Individual profiles only visible after mutual match
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-[var(--grey-500)]">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No interest yet</p>
                    <p className="text-xs">Talents can add {brand.name} to their Dream Brands</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/brand/opportunities/new" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5 text-[var(--gold)]" />
                      <span className="text-sm">Post New Opportunity</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
                <Link href="/brand/stores/new" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-[var(--grey-600)]" />
                      <span className="text-sm">Add Store Location</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
                <Link href="/brand/team" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[var(--grey-600)]" />
                      <span className="text-sm">Invite Team Member</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Brand Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="filled">{brand.segment?.replace(/_/g, ' ')}</Badge>
                </div>
                
                {brand.headquarters_location && (
                  <div className="flex items-center gap-2 text-small text-[var(--grey-600)]">
                    <MapPin className="w-4 h-4" />
                    {brand.headquarters_location}
                  </div>
                )}

                {brand.divisions?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {brand.divisions.slice(0, 4).map((div: string) => (
                      <Badge key={div} variant="default" size="sm">
                        {div.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                    {brand.divisions.length > 4 && (
                      <Badge variant="filled" size="sm">
                        +{brand.divisions.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                <Link href="/settings" className="block">
                  <Button variant="ghost" size="sm" className="w-full">
                    Edit Brand Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
