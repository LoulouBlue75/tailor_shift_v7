import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button, UserMenu, PendingValidationBanner, getBannerTypeFromStatus } from '@/components/ui'
import Link from 'next/link'
import {
  User, MapPin, Briefcase, MessageCircle, Target,
  ChevronRight, Bell, Star, Heart,
  TrendingUp, Clock, CheckCircle, Building, Sparkles
} from 'lucide-react'

export default async function TalentDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Allow users who completed onboarding to see dashboard, even if pending
  if (!profile?.onboarding_completed) {
    redirect('/talent/onboarding')
  }

  const { data: talent } = await supabase
    .from('talents')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  // Get match count
  const { count: matchCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('talent_id', talent?.id)
    .in('status', ['suggested', 'mutual'])

  // Get unread messages count
  const { count: unreadCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('talent_id', talent?.id)
    .gt('talent_unread_count', 0)

  const completionPct = talent?.profile_completion_pct || 0

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/talent/dashboard" className="text-sm font-medium text-[var(--charcoal)]">
                Dashboard
              </Link>
              <Link href="/talent/opportunities" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Opportunities
              </Link>
              <Link href="/messages" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Messages
                {(unreadCount || 0) > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--gold)] text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] hover:bg-[var(--grey-100)] rounded-full relative transition-colors">
                <Bell className="w-5 h-5" />
                {/* Notification badge placeholder */}
              </button>
              <UserMenu
                initials={`${talent?.first_name?.[0] || ''}${talent?.last_name?.[0] || ''}`}
                fullName={`${talent?.first_name || ''} ${talent?.last_name || ''}`}
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
              Welcome back, {talent?.first_name}
            </h1>
            <p className="text-[var(--grey-600)]">
              Here&apos;s what&apos;s happening with your career journey
            </p>
          </div>
          <Link href="/talent/profile">
            <Button variant="secondary" size="sm">
              <User className="w-4 h-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </div>

        {/* Validation Status Banner */}
        {talent?.status && talent.status !== 'approved' && (
          <PendingValidationBanner
            type={getBannerTypeFromStatus('talent', talent.status) || 'talent_pending'}
            rejectionReason={talent.rejection_reason || undefined}
            editProfilePath="/talent/profile/edit"
          />
        )}

        {/* Profile Completion Alert - only show if approved */}
        {talent?.status === 'approved' && completionPct < 100 && (
          <Card className="mb-6 border-[var(--gold)] bg-[var(--gold-light)]/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--charcoal)]">
                    Complete your profile to unlock more matches
                  </p>
                  <p className="text-small text-[var(--grey-600)]">
                    {completionPct}% complete • Add more details to improve your visibility
                  </p>
                </div>
              </div>
              <Link href="/talent/profile/edit">
                <Button size="sm">Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
                <Target className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{matchCount || 0}</p>
                <p className="text-small text-[var(--grey-600)]">New Matches</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{completionPct}%</p>
                <p className="text-small text-[var(--grey-600)]">Profile Complete</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--info-light)] flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[var(--info)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{unreadCount || 0}</p>
                <p className="text-small text-[var(--grey-600)]">Unread Messages</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--grey-100)] flex items-center justify-center">
                <Clock className="w-6 h-6 text-[var(--grey-600)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light capitalize">
                  {talent?.career_preferences?.timeline || 'Passive'}
                </p>
                <p className="text-small text-[var(--grey-600)]">Search Status</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Suggested Matches */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Suggested Opportunities</CardTitle>
                <Link href="/talent/opportunities" className="text-small text-[var(--gold)] hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Placeholder for matches */}
                <div className="text-center py-8 text-[var(--grey-500)]">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No matches yet</p>
                  <p className="text-small">Complete your profile and assessment to get matched</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/talent/assessment" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-[var(--gold)]" />
                      <span className="text-sm">Take Assessment</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
                <Link href="/talent/profile/edit" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[var(--grey-600)]" />
                      <span className="text-sm">Edit Profile</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
                <Link href="/talent/experience/new" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-[var(--grey-600)]" />
                      <span className="text-sm">Add Experience</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Dream Brands Section */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                  Dream Brands
                </CardTitle>
                <Link href="/talent/onboarding?step=6" className="text-small text-[var(--gold)] hover:underline">
                  Edit
                </Link>
              </CardHeader>
              <CardContent>
                {((talent?.career_preferences as { target_brands?: string[] } | null)?.target_brands?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {((talent?.career_preferences as { target_brands?: string[] } | null)?.target_brands ?? []).map((brand: string, index: number) => {
                      const isCurrentEmployer = talent?.current_employer &&
                        brand.toLowerCase() === talent.current_employer.toLowerCase()
                      
                      return (
                        <div key={brand} className="flex items-center gap-3 p-2 rounded-[var(--radius-md)] bg-[var(--grey-50)]">
                          <span className={`
                            w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${index === 0
                              ? 'bg-[var(--gold)] text-white'
                              : 'bg-[var(--grey-200)] text-[var(--grey-700)]'
                            }
                          `}>
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium flex-1">{brand}</span>
                          {isCurrentEmployer && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--burgundy)]/10 text-[var(--burgundy)] rounded-full">
                              Internal
                            </span>
                          )}
                        </div>
                      )
                    })}
                    
                    {/* Internal Mobility Status */}
                    {talent?.internal_mobility_interest && (
                      <div className="mt-3 p-2 bg-[var(--success-light)] rounded-[var(--radius-md)] border border-[var(--success)]">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[var(--success)]" />
                          <span className="text-xs text-[var(--success)] font-medium">
                            Open to internal mobility at {talent.current_employer}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[var(--grey-500)]">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No dream brands set</p>
                    <p className="text-xs">Add brands you'd love to work for</p>
                    <Link href="/talent/onboarding?step=6">
                      <Button size="sm" variant="secondary" className="mt-3">
                        Add Dream Brands
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="level">{talent?.current_role_level || 'N/A'}</Badge>
                  {(talent?.store_tier_experience?.length || 0) > 0 ? (
                    talent.store_tier_experience.map((tier: string) => (
                      <Badge key={tier} variant="tier">{tier}</Badge>
                    ))
                  ) : (
                    <Badge variant="tier">{talent?.current_store_tier || 'N/A'}</Badge>
                  )}
                </div>
                {talent?.current_location && (
                  <div className="flex items-center gap-2 text-small text-[var(--grey-600)]">
                    <MapPin className="w-4 h-4" />
                    {talent.current_location}
                  </div>
                )}
                {talent?.divisions_expertise?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {talent.divisions_expertise.slice(0, 3).map((div: string) => (
                      <Badge key={div} variant="default" size="sm">
                        {div.replace('_', ' ')}
                      </Badge>
                    ))}
                    {talent.divisions_expertise.length > 3 && (
                      <Badge variant="filled" size="sm">
                        +{talent.divisions_expertise.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
