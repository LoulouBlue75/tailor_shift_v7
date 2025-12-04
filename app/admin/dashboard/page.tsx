import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button } from '@/components/ui'
import { Users, Building2, Briefcase, CheckCircle, Clock, AlertTriangle, TrendingUp, UserCheck, UserX, ArrowRight, RefreshCw, Settings } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Check if user is admin
  if (profile?.user_type !== 'admin') {
    redirect('/login')
  }

  // Fetch KPIs
  // Talents stats
  const { count: totalTalents } = await supabase
    .from('talents')
    .select('*', { count: 'exact', head: true })

  const { count: pendingTalents } = await supabase
    .from('talents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review')

  const { count: approvedTalents } = await supabase
    .from('talents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: onboardingTalents } = await supabase
    .from('talents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'onboarding')

  // Recent pending talents (for quick action)
  const { data: recentPendingTalents } = await supabase
    .from('talents')
    .select(`
      id, first_name, last_name, current_role, status, created_at,
      profile:profiles(email)
    `)
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(5)

  // Brands stats
  const { count: totalBrands } = await supabase
    .from('brands')
    .select('*', { count: 'exact', head: true })

  const { count: activeBrands } = await supabase
    .from('brands')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Opportunities stats
  const { count: totalOpportunities } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })

  const { count: activeOpportunities } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Matches stats
  const { count: totalMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })

  const { count: hiredMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'hired')

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: newTalentsThisWeek } = await supabase
    .from('talents')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  const { count: newMatchesThisWeek } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-[var(--grey-50)]">
      {/* Admin Header */}
      <header className="bg-[var(--charcoal)] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="md" className="invert" />
              <span className="px-2 py-0.5 bg-[var(--gold)] text-[var(--charcoal)] rounded text-xs font-medium">
                ADMIN
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/admin/dashboard" className="text-sm font-medium text-white">
                Dashboard
              </Link>
              <Link href="/admin/talents/pending" className="text-sm text-white/70 hover:text-white flex items-center gap-1">
                Validation Queue
                {pendingTalents && pendingTalents > 0 && (
                  <span className="px-1.5 py-0.5 bg-[var(--error)] rounded-full text-xs">
                    {pendingTalents}
                  </span>
                )}
              </Link>
              <Link href="/admin/talents" className="text-sm text-white/70 hover:text-white">
                All Talents
              </Link>
              <Link href="/admin/brands" className="text-sm text-white/70 hover:text-white">
                Brands
              </Link>
              <Link href="/admin/settings" className="text-sm text-white/70 hover:text-white">
                <Settings className="w-4 h-4" />
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-sm text-white/70">{profile?.email}</span>
              <Link href="/auth/signout">
                <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-h1 mb-1">Admin Dashboard</h1>
          <p className="text-[var(--grey-600)]">
            Platform overview and key metrics
          </p>
        </div>

        {/* Urgent Action Alert */}
        {pendingTalents && pendingTalents > 0 && (
          <Card className="mb-6 border-l-4 border-l-[var(--warning)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
                  <div>
                    <p className="font-medium">{pendingTalents} talent{pendingTalents > 1 ? 's' : ''} awaiting validation</p>
                    <p className="text-sm text-[var(--grey-600)]">Review profiles to activate their accounts</p>
                  </div>
                </div>
                <Link href="/admin/talents/pending">
                  <Button size="sm">
                    Review Now
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Talents */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-[var(--gold)]" />
                <Badge variant="tier" className="bg-[var(--success-light)] text-[var(--success)]">
                  +{newTalentsThisWeek || 0} this week
                </Badge>
              </div>
              <p className="text-3xl font-display text-[var(--charcoal)]">{totalTalents || 0}</p>
              <p className="text-sm text-[var(--grey-600)]">Total Talents</p>
              <div className="mt-3 pt-3 border-t border-[var(--grey-200)] flex justify-between text-xs">
                <span className="text-[var(--success)]">✓ {approvedTalents || 0} approved</span>
                <span className="text-[var(--warning)]">⏳ {pendingTalents || 0} pending</span>
              </div>
            </CardContent>
          </Card>

          {/* Brands */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <p className="text-3xl font-display text-[var(--charcoal)]">{totalBrands || 0}</p>
              <p className="text-sm text-[var(--grey-600)]">Brands</p>
              <div className="mt-3 pt-3 border-t border-[var(--grey-200)] text-xs">
                <span className="text-[var(--success)]">{activeBrands || 0} active</span>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Briefcase className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <p className="text-3xl font-display text-[var(--charcoal)]">{totalOpportunities || 0}</p>
              <p className="text-sm text-[var(--grey-600)]">Opportunities</p>
              <div className="mt-3 pt-3 border-t border-[var(--grey-200)] text-xs">
                <span className="text-[var(--success)]">{activeOpportunities || 0} active</span>
              </div>
            </CardContent>
          </Card>

          {/* Matches */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-[var(--gold)]" />
                <Badge variant="tier" className="bg-[var(--info-light)] text-[var(--info)]">
                  +{newMatchesThisWeek || 0} this week
                </Badge>
              </div>
              <p className="text-3xl font-display text-[var(--charcoal)]">{totalMatches || 0}</p>
              <p className="text-sm text-[var(--grey-600)]">Total Matches</p>
              <div className="mt-3 pt-3 border-t border-[var(--grey-200)] text-xs">
                <span className="text-[var(--success)]">🎉 {hiredMatches || 0} hired</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Validations */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3">Pending Validations</h2>
                <Link href="/admin/talents/pending" className="text-sm text-[var(--gold)] hover:underline">
                  View all →
                </Link>
              </div>

              {recentPendingTalents && recentPendingTalents.length > 0 ? (
                <div className="space-y-3">
                  {recentPendingTalents.map(talent => (
                    <Link
                      key={talent.id}
                      href={`/admin/talents/${talent.id}`}
                      className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--grey-50)] hover:bg-[var(--grey-100)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white text-sm">
                          {talent.first_name?.[0]}{talent.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{talent.first_name} {talent.last_name}</p>
                          <p className="text-sm text-[var(--grey-500)]">{talent.current_role || 'Role not set'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="level" className="bg-[var(--warning-light)] text-[var(--warning)]">
                          Pending
                        </Badge>
                        <p className="text-xs text-[var(--grey-500)] mt-1">{formatDate(talent.created_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-[var(--success)] mb-2" />
                  <p className="text-[var(--grey-600)]">All caught up!</p>
                  <p className="text-sm text-[var(--grey-500)]">No pending validations</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-h3 mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/talents/pending">
                  <div className="p-4 rounded-[var(--radius-md)] bg-[var(--grey-50)] hover:bg-[var(--grey-100)] transition-colors text-center">
                    <UserCheck className="w-6 h-6 mx-auto mb-2 text-[var(--success)]" />
                    <p className="text-sm font-medium">Validate Talents</p>
                  </div>
                </Link>
                
                <Link href="/admin/talents?status=rejected">
                  <div className="p-4 rounded-[var(--radius-md)] bg-[var(--grey-50)] hover:bg-[var(--grey-100)] transition-colors text-center">
                    <UserX className="w-6 h-6 mx-auto mb-2 text-[var(--error)]" />
                    <p className="text-sm font-medium">Review Rejected</p>
                  </div>
                </Link>
                
                <Link href="/admin/brands">
                  <div className="p-4 rounded-[var(--radius-md)] bg-[var(--grey-50)] hover:bg-[var(--grey-100)] transition-colors text-center">
                    <Building2 className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
                    <p className="text-sm font-medium">Manage Brands</p>
                  </div>
                </Link>
                
                <Link href="/admin/matching">
                  <div className="p-4 rounded-[var(--radius-md)] bg-[var(--grey-50)] hover:bg-[var(--grey-100)] transition-colors text-center">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 text-[var(--info)]" />
                    <p className="text-sm font-medium">Run Matching</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Talent Pipeline Overview */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-h3 mb-4">Talent Pipeline</h2>
              
              <div className="flex items-center gap-4">
                {/* Onboarding */}
                <div className="flex-1 text-center p-4 rounded-[var(--radius-md)] bg-[var(--grey-50)]">
                  <p className="text-2xl font-display text-[var(--info)]">{onboardingTalents || 0}</p>
                  <p className="text-sm text-[var(--grey-600)]">Onboarding</p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-[var(--grey-400)]" />
                
                {/* Pending Review */}
                <div className="flex-1 text-center p-4 rounded-[var(--radius-md)] bg-[var(--warning-light)]">
                  <p className="text-2xl font-display text-[var(--warning)]">{pendingTalents || 0}</p>
                  <p className="text-sm text-[var(--grey-600)]">Pending Review</p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-[var(--grey-400)]" />
                
                {/* Approved */}
                <div className="flex-1 text-center p-4 rounded-[var(--radius-md)] bg-[var(--success-light)]">
                  <p className="text-2xl font-display text-[var(--success)]">{approvedTalents || 0}</p>
                  <p className="text-sm text-[var(--grey-600)]">Approved</p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-[var(--grey-400)]" />
                
                {/* Matched */}
                <div className="flex-1 text-center p-4 rounded-[var(--radius-md)] bg-[var(--gold-light)]">
                  <p className="text-2xl font-display text-[var(--gold-dark)]">{totalMatches || 0}</p>
                  <p className="text-sm text-[var(--grey-600)]">Matched</p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-[var(--grey-400)]" />
                
                {/* Hired */}
                <div className="flex-1 text-center p-4 rounded-[var(--radius-md)] bg-[var(--charcoal)] text-white">
                  <p className="text-2xl font-display">{hiredMatches || 0}</p>
                  <p className="text-sm text-white/70">Hired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}