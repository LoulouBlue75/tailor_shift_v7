import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button, UserMenu } from '@/components/ui'
import { ArrowLeft, Building2, MapPin, Calendar, Briefcase, Clock, DollarSign, Heart, XCircle, MessageSquare, ChevronRight, CheckCircle, Users, Star } from 'lucide-react'
import { calculateCompensationAlignment, getCompensationBadgeInfo } from '@/lib/matching/algorithm'

export default async function TalentOpportunityDetailPage({
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

  const { data: talent } = await supabase
    .from('talents')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!talent) redirect('/talent/onboarding')

  // Get the opportunity with brand and store info
  const { data: opportunity, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      brand:brands(id, name, logo_url, segment, description),
      store:stores(id, name, city, country, tier, address)
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error || !opportunity) {
    notFound()
  }

  // Check if talent has existing match with this opportunity
  const { data: existingMatch } = await supabase
    .from('matches')
    .select('*')
    .eq('talent_id', talent.id)
    .eq('opportunity_id', id)
    .maybeSingle()

  // Calculate compensation alignment
  let compensationBadge = null
  if (talent.compensation_profile && opportunity.compensation_range) {
    const talentExpectations = talent.compensation_profile.salary_expectations?.min || talent.compensation_profile.current_base
    const oppRange = opportunity.compensation_range
    const alignment = calculateCompensationAlignment(
      talentExpectations,
      oppRange.min_base,
      oppRange.max_base,
      talent.compensation_profile.currency,
      oppRange.currency
    )
    compensationBadge = getCompensationBadgeInfo(alignment)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Flexible'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Get user initials for menu
  const userInitials = talent.first_name && talent.last_name
    ? `${talent.first_name[0]}${talent.last_name[0]}`.toUpperCase()
    : '?'

  const getMatchStatusInfo = (status: string | null) => {
    if (!status) return null
    switch (status) {
      case 'matched':
        return { label: 'Matched', color: 'bg-[var(--gold-light)] text-[var(--gold-dark)]' }
      case 'interested':
        return { label: 'You showed interest', color: 'bg-[var(--info-light)] text-[var(--info)]' }
      case 'mutual':
        return { label: 'Mutual Interest!', color: 'bg-[var(--success-light)] text-[var(--success)]' }
      case 'interviewing':
        return { label: 'Interviewing', color: 'bg-[var(--success-light)] text-[var(--success)]' }
      case 'offer':
        return { label: 'Offer Received!', color: 'bg-[var(--success)] text-white' }
      default:
        return { label: status, color: 'bg-[var(--grey-100)] text-[var(--grey-600)]' }
    }
  }

  const matchStatus = existingMatch ? getMatchStatusInfo(existingMatch.status) : null

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
              <Link href="/talent/opportunities" className="text-sm font-medium text-[var(--charcoal)]">
                Opportunities
              </Link>
              <Link href="/talent/matches" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
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
        {/* Back Navigation */}
        <Link href="/talent/opportunities" className="inline-flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Brand Logo */}
                  <div className="w-20 h-20 rounded-[var(--radius-md)] bg-[var(--grey-100)] flex items-center justify-center shrink-0">
                    {opportunity.brand?.logo_url ? (
                      <img src={opportunity.brand.logo_url} alt={opportunity.brand.name} className="w-14 h-14 object-contain" />
                    ) : (
                      <Building2 className="w-8 h-8 text-[var(--grey-500)]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="text-h2">{opportunity.title}</h1>
                        <p className="text-lg text-[var(--grey-600)]">{opportunity.brand?.name}</p>
                      </div>
                      
                      {matchStatus && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${matchStatus.color}`}>
                          {matchStatus.label}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <p className="text-[var(--grey-500)] flex items-center gap-1 mb-4">
                      <MapPin className="w-4 h-4" />
                      {opportunity.store?.name} • {opportunity.store?.city}, {opportunity.store?.country}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {opportunity.role_level && <Badge variant="level">{opportunity.role_level}</Badge>}
                      {opportunity.store?.tier && <Badge variant="tier">{opportunity.store.tier}</Badge>}
                      {opportunity.division && (
                        <Badge variant="filled">{opportunity.division.replace(/_/g, ' ')}</Badge>
                      )}
                      {opportunity.brand?.segment && (
                        <Badge variant="filled">{opportunity.brand.segment}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Score & Compensation */}
                {existingMatch?.match_score && (
                  <div className="mt-6 pt-6 border-t border-[var(--grey-200)] flex items-center gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-[var(--gold)] flex items-center justify-center mx-auto mb-1">
                        <span className="text-xl font-display text-[var(--gold)]">{existingMatch.match_score}%</span>
                      </div>
                      <p className="text-xs text-[var(--grey-500)]">Match Score</p>
                    </div>
                    
                    {compensationBadge && (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--grey-50)]">
                        <span className="text-2xl">{compensationBadge.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{compensationBadge.label}</p>
                          <p className="text-xs text-[var(--grey-500)]">Compensation Fit</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Position Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-h3 mb-4">Position Details</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Contract Type</p>
                    <p className="font-medium">{opportunity.contract_type || 'CDI'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Start Date</p>
                    <p className="font-medium">{formatDate(opportunity.start_date)}</p>
                  </div>
                  {opportunity.closes_at && (
                    <div>
                      <p className="text-small text-[var(--grey-500)] mb-1">Application Deadline</p>
                      <p className="font-medium">{formatDate(opportunity.closes_at)}</p>
                    </div>
                  )}
                  {opportunity.requirements?.min_experience && (
                    <div>
                      <p className="text-small text-[var(--grey-500)] mb-1">Required Experience</p>
                      <p className="font-medium">{opportunity.requirements.min_experience}+ years</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {opportunity.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-h3 mb-4">About the Role</h2>
                  <p className="text-[var(--grey-700)] whitespace-pre-line">{opportunity.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {opportunity.requirements && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-h3 mb-4">Requirements</h2>
                  
                  <div className="space-y-4">
                    {opportunity.requirements.required_languages?.length > 0 && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.requirements.required_languages.map((lang: string) => (
                            <Badge key={lang} variant="filled">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {opportunity.requirements.required_skills?.length > 0 && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.requirements.required_skills.map((skill: string) => (
                            <Badge key={skill} variant="level">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* About the Brand */}
            {opportunity.brand?.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-h3 mb-4">About {opportunity.brand.name}</h2>
                  <p className="text-[var(--grey-700)]">{opportunity.brand.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Interested?</h3>
                
                {existingMatch ? (
                  <div className="space-y-3">
                    {(existingMatch.status === 'mutual' || existingMatch.status === 'interviewing') ? (
                      <>
                        <p className="text-sm text-[var(--grey-600)] mb-4">
                          Great news! You and {opportunity.brand?.name} both showed interest.
                        </p>
                        <Link href={`/messages?match=${existingMatch.id}`}>
                          <Button className="w-full">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Start Conversation
                          </Button>
                        </Link>
                      </>
                    ) : existingMatch.status === 'interested' ? (
                      <p className="text-sm text-[var(--grey-600)]">
                        You showed interest in this role. We'll notify you when {opportunity.brand?.name} responds.
                      </p>
                    ) : existingMatch.status === 'matched' ? (
                      <>
                        <p className="text-sm text-[var(--grey-600)] mb-4">
                          You've been matched! Let them know you're interested.
                        </p>
                        <Button className="w-full">
                          <Heart className="w-4 h-4 mr-2" />
                          Show Interest
                        </Button>
                        <Button variant="ghost" className="w-full text-[var(--grey-500)]">
                          <XCircle className="w-4 h-4 mr-2" />
                          Not Interested
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--grey-500)]">
                        Application status: {existingMatch.status}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--grey-600)] mb-4">
                      This opportunity hasn't been matched to you yet, but you can express interest.
                    </p>
                    <Button className="w-full">
                      <Heart className="w-4 h-4 mr-2" />
                      Express Interest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Store Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Location</h3>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--grey-100)] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[var(--grey-500)]" />
                  </div>
                  <div>
                    <p className="font-medium">{opportunity.store?.name}</p>
                    <p className="text-sm text-[var(--grey-600)]">
                      {opportunity.store?.city}, {opportunity.store?.country}
                    </p>
                    {opportunity.store?.address && (
                      <p className="text-sm text-[var(--grey-500)] mt-1">{opportunity.store.address}</p>
                    )}
                    {opportunity.store?.tier && (
                      <Badge variant="tier" className="mt-2">{opportunity.store.tier}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation Alignment Card */}
            {compensationBadge && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-h4 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[var(--gold)]" />
                    Compensation Fit
                  </h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{compensationBadge.icon}</span>
                    <p className="font-medium">{compensationBadge.label}</p>
                  </div>

                  <p className="text-small text-[var(--grey-500)] bg-[var(--grey-50)] p-3 rounded-[var(--radius-sm)]">
                    Based on your salary expectations and this role's budget range. Exact figures remain confidential.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Facts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Quick Facts</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--grey-500)]">Posted</span>
                    <span className="font-medium">{formatDate(opportunity.created_at)}</span>
                  </div>
                  {opportunity.brand?.segment && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--grey-500)]">Brand Segment</span>
                      <span className="font-medium">{opportunity.brand.segment}</span>
                    </div>
                  )}
                  {opportunity.role_level && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--grey-500)]">Level</span>
                      <span className="font-medium">{opportunity.role_level}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}