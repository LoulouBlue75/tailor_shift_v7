import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button, UserMenu } from '@/components/ui'
import { ArrowLeft, Building2, MapPin, Heart, ChevronRight, Calendar, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react'

export default async function TalentMatchesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: talent } = await supabase
    .from('talents')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!talent) redirect('/talent/onboarding')

  // Get matches for this talent with opportunity and brand info
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      opportunity:opportunities(
        id, title, role_level, division, status,
        brand:brands(name, logo_url, segment),
        store:stores(name, city, country, tier)
      )
    `)
    .eq('talent_id', talent.id)
    .order('created_at', { ascending: false })

  // Group matches by status
  const mutualMatches = matches?.filter(m => m.status === 'mutual' || m.status === 'interested') || []
  const pendingMatches = matches?.filter(m => m.status === 'matched' || m.status === 'screening') || []
  const interviewingMatches = matches?.filter(m => m.status === 'interviewing' || m.status === 'offer') || []
  const closedMatches = matches?.filter(m => m.status === 'hired' || m.status === 'declined' || m.status === 'expired') || []

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'matched':
        return { label: 'New Match', color: 'bg-[var(--info-light)] text-[var(--info)]' }
      case 'interested':
        return { label: 'You Showed Interest', color: 'bg-[var(--gold-light)] text-[var(--gold-dark)]' }
      case 'mutual':
        return { label: 'Mutual Interest', color: 'bg-[var(--success-light)] text-[var(--success)]' }
      case 'screening':
        return { label: 'Under Review', color: 'bg-[var(--grey-100)] text-[var(--grey-600)]' }
      case 'interviewing':
        return { label: 'Interviewing', color: 'bg-[var(--gold-light)] text-[var(--gold-dark)]' }
      case 'offer':
        return { label: 'Offer Received!', color: 'bg-[var(--success-light)] text-[var(--success)]' }
      case 'hired':
        return { label: 'Hired', color: 'bg-[var(--success)] text-white' }
      case 'declined':
        return { label: 'Declined', color: 'bg-[var(--grey-200)] text-[var(--grey-600)]' }
      case 'expired':
        return { label: 'Expired', color: 'bg-[var(--grey-200)] text-[var(--grey-600)]' }
      default:
        return { label: status, color: 'bg-[var(--grey-100)] text-[var(--grey-600)]' }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  // Get user initials for menu
  const userInitials = talent.first_name && talent.last_name
    ? `${talent.first_name[0]}${talent.last_name[0]}`.toUpperCase()
    : '?'

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
              <Link href="/talent/dashboard" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Dashboard
              </Link>
              <Link href="/talent/opportunities" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Opportunities
              </Link>
              <Link href="/talent/matches" className="text-sm font-medium text-[var(--charcoal)]">
                Matches
              </Link>
              <Link href="/talent/network" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Network
              </Link>
            </nav>

            <UserMenu
              initials={userInitials}
              fullName={`${talent.first_name || ''} ${talent.last_name || ''}`}
              email={profile?.email}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-h1 mb-1">Your Matches</h1>
          <p className="text-[var(--grey-600)]">
            Track your opportunities and interview progress
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-2xl font-display text-[var(--gold)]">{matches?.length || 0}</p>
            <p className="text-small text-[var(--grey-600)]">Total Matches</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-display text-[var(--success)]">{mutualMatches.length}</p>
            <p className="text-small text-[var(--grey-600)]">Mutual Interest</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-display text-[var(--info)]">{pendingMatches.length}</p>
            <p className="text-small text-[var(--grey-600)]">Pending</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-display text-[var(--charcoal)]">{interviewingMatches.length}</p>
            <p className="text-small text-[var(--grey-600)]">Interviewing</p>
          </Card>
        </div>

        {/* No Matches State */}
        {(!matches || matches.length === 0) ? (
          <Card className="p-12 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-[var(--grey-400)]" />
            <h3 className="text-h3 mb-2">No matches yet</h3>
            <p className="text-[var(--grey-600)] mb-6">
              Complete your profile and browse opportunities to get matched with brands
            </p>
            <Link href="/talent/opportunities">
              <Button>Browse Opportunities</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Matches (Mutual Interest / Interviewing) */}
            {(mutualMatches.length > 0 || interviewingMatches.length > 0) && (
              <div>
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                  Active Conversations
                </h2>
                <div className="space-y-3">
                  {[...interviewingMatches, ...mutualMatches].map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      getStatusInfo={getStatusInfo}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Matches */}
            {pendingMatches.length > 0 && (
              <div>
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--info)]"></span>
                  Pending Matches
                </h2>
                <div className="space-y-3">
                  {pendingMatches.map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      getStatusInfo={getStatusInfo}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Closed */}
            {closedMatches.length > 0 && (
              <div>
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--grey-300)]"></span>
                  Closed
                </h2>
                <div className="space-y-3">
                  {closedMatches.map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      getStatusInfo={getStatusInfo}
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

// Match Card Component
function MatchCard({ 
  match,
  getStatusInfo,
  formatDate 
}: { 
  match: any
  getStatusInfo: (status: string) => { label: string; color: string }
  formatDate: (date: string) => string
}) {
  const statusInfo = getStatusInfo(match.status)
  const opp = match.opportunity

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          {/* Brand Logo */}
          <div className="w-14 h-14 rounded-[var(--radius-md)] bg-[var(--grey-100)] flex items-center justify-center shrink-0">
            {opp?.brand?.logo_url ? (
              <img src={opp.brand.logo_url} alt={opp.brand.name} className="w-10 h-10 object-contain" />
            ) : (
              <Building2 className="w-6 h-6 text-[var(--grey-500)]" />
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-lg">{opp?.title || 'Opportunity'}</h3>
                <p className="text-[var(--grey-600)]">{opp?.brand?.name || 'Unknown Brand'}</p>
              </div>
              
              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {opp?.role_level && <Badge variant="level">{opp.role_level}</Badge>}
              {opp?.store?.tier && <Badge variant="tier">{opp.store.tier}</Badge>}
              {opp?.division && (
                <Badge variant="filled">{opp.division.replace(/_/g, ' ')}</Badge>
              )}
            </div>

            {/* Location & Date */}
            <div className="flex items-center gap-4 text-sm text-[var(--grey-500)]">
              {opp?.store && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {opp.store.city}, {opp.store.country}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Matched {formatDate(match.created_at)}
              </span>
              {match.match_score && (
                <span className="text-[var(--gold)]">
                  {match.match_score}% match
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {match.status === 'matched' && (
              <>
                <Button size="sm" variant="secondary">
                  <Heart className="w-4 h-4 mr-1" />
                  Interested
                </Button>
                <Button size="sm" variant="ghost">
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
            {(match.status === 'mutual' || match.status === 'interviewing') && (
              <Link href={`/messages?match=${match.id}`}>
                <Button size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </Link>
            )}
            <Link href={`/talent/opportunities/${opp?.id}`}>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}