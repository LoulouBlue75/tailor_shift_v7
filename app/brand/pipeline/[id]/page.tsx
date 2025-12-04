import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button, UserMenu } from '@/components/ui'
import { ArrowLeft, MapPin, Calendar, Briefcase, GraduationCap, Languages, Star, Heart, MessageSquare, CheckCircle, XCircle, Clock, DollarSign, ChevronRight, Award } from 'lucide-react'
import { calculateCompensationAlignment, getCompensationBadgeInfo } from '@/lib/matching/algorithm'

export default async function BrandTalentDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ opportunity?: string }>
}) {
  const { id } = await params
  const { opportunity: opportunityId } = await searchParams
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

  // Get the talent with their profile info
  const { data: talent, error } = await supabase
    .from('talents')
    .select(`
      *,
      profile:profiles(email)
    `)
    .eq('id', id)
    .single()

  if (error || !talent) {
    notFound()
  }

  // Get matches between this talent and brand's opportunities
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      opportunity:opportunities(
        id, title, role_level, division, status, compensation_range,
        store:stores(name, city, country, tier)
      )
    `)
    .eq('talent_id', id)
    .in('opportunity.brand_id', [brandMember.brand_id])
    .order('created_at', { ascending: false })

  // Get specific opportunity if provided in URL
  const selectedOpportunity = opportunityId 
    ? matches?.find(m => m.opportunity?.id === opportunityId)?.opportunity
    : matches?.[0]?.opportunity

  // Get talent's experiences
  const { data: experiences } = await supabase
    .from('experiences')
    .select(`
      *,
      brand:brands(name, logo_url)
    `)
    .eq('talent_id', id)
    .order('start_date', { ascending: false })
    .limit(5)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  }

  const getMatchStatus = (status: string) => {
    switch (status) {
      case 'matched':
        return { label: 'New Match', color: 'bg-[var(--gold-light)] text-[var(--gold-dark)]' }
      case 'interested':
        return { label: 'Talent Interested', color: 'bg-[var(--info-light)] text-[var(--info)]' }
      case 'mutual':
        return { label: 'Mutual Interest', color: 'bg-[var(--success-light)] text-[var(--success)]' }
      case 'screening':
        return { label: 'Under Review', color: 'bg-[var(--grey-100)] text-[var(--grey-600)]' }
      case 'interviewing':
        return { label: 'Interviewing', color: 'bg-[var(--success-light)] text-[var(--success)]' }
      case 'offer':
        return { label: 'Offer Made', color: 'bg-[var(--success)] text-white' }
      case 'hired':
        return { label: 'Hired!', color: 'bg-[var(--success)] text-white' }
      case 'declined':
        return { label: 'Declined', color: 'bg-[var(--grey-200)] text-[var(--grey-600)]' }
      default:
        return { label: status, color: 'bg-[var(--grey-100)] text-[var(--grey-600)]' }
    }
  }

  // Calculate compensation alignment if both data available
  let compensationBadge = null
  if (talent.compensation_profile && selectedOpportunity?.compensation_range) {
    const talentExpectations = talent.compensation_profile.salary_expectations?.min || talent.compensation_profile.current_base
    const oppRange = selectedOpportunity.compensation_range
    const alignment = calculateCompensationAlignment(
      talentExpectations,
      oppRange.min_base,
      oppRange.max_base,
      talent.compensation_profile.currency,
      oppRange.currency
    )
    compensationBadge = getCompensationBadgeInfo(alignment)
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
              <Link href="/brand/opportunities" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Opportunities
              </Link>
              <Link href="/brand/pipeline" className="text-sm font-medium text-[var(--charcoal)]">
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
        <Link href="/brand/pipeline" className="inline-flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white text-2xl font-display">
                    {talent.first_name?.[0]}{talent.last_name?.[0]}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-h2">{talent.first_name} {talent.last_name}</h1>
                        <p className="text-lg text-[var(--grey-600)]">{talent.current_role || 'Sales Associate'}</p>
                        {talent.current_location && (
                          <p className="text-sm text-[var(--grey-500)] flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {talent.current_location}
                          </p>
                        )}
                      </div>

                      {/* Match Score */}
                      {matches && matches[0]?.match_score && (
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full border-4 border-[var(--gold)] flex items-center justify-center">
                            <span className="text-xl font-display text-[var(--gold)]">{matches[0].match_score}%</span>
                          </div>
                          <p className="text-xs text-[var(--grey-500)] mt-1">Match</p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {talent.years_experience && (
                        <Badge variant="level">{talent.years_experience}+ years</Badge>
                      )}
                      {talent.divisions?.map((div: string) => (
                        <Badge key={div} variant="filled">{div.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation Alignment */}
            {compensationBadge && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-h3 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[var(--gold)]" />
                    Compensation Alignment
                  </h2>
                  
                  <div className="flex items-center gap-4">
                    <span className={`text-2xl ${compensationBadge.color}`}>
                      {compensationBadge.icon}
                    </span>
                    <div>
                      <p className="font-medium">{compensationBadge.label}</p>
                    </div>
                  </div>

                  <p className="text-small text-[var(--grey-500)] mt-4 bg-[var(--grey-50)] p-3 rounded-[var(--radius-sm)]">
                    💡 Exact salary figures are private. This indicator shows alignment between talent expectations and your budget range.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience
                </h2>
                
                {experiences && experiences.length > 0 ? (
                  <div className="space-y-6">
                    {experiences.map((exp, index) => (
                      <div key={exp.id} className={`${index !== 0 ? 'border-t border-[var(--grey-200)] pt-6' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--grey-100)] flex items-center justify-center shrink-0">
                            {exp.brand?.logo_url ? (
                              <img src={exp.brand.logo_url} alt={exp.brand.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <Briefcase className="w-5 h-5 text-[var(--grey-500)]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{exp.role_title}</h4>
                            <p className="text-[var(--grey-600)]">{exp.brand?.name || exp.company_name}</p>
                            <p className="text-sm text-[var(--grey-500)]">
                              {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-[var(--grey-600)] mt-2">{exp.description}</p>
                            )}
                            {exp.achievements && exp.achievements.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {exp.achievements.map((achievement: string, i: number) => (
                                  <li key={i} className="text-sm text-[var(--grey-600)] flex items-start gap-2">
                                    <Award className="w-3.5 h-3.5 mt-0.5 text-[var(--gold)]" />
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--grey-500)]">No experience listed</p>
                )}
              </CardContent>
            </Card>

            {/* Skills & Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Languages */}
              {talent.languages && talent.languages.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-h4 mb-4 flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {talent.languages.map((lang: string) => (
                        <Badge key={lang} variant="filled">{lang}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {talent.skills && talent.skills.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-h4 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.map((skill: string) => (
                        <Badge key={skill} variant="level">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Actions</h3>
                
                <div className="space-y-3">
                  <Button className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Show Interest
                  </Button>
                  <Button variant="secondary" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="ghost" className="w-full text-[var(--error)]">
                    <XCircle className="w-4 h-4 mr-2" />
                    Pass on Candidate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Matches */}
            {matches && matches.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-h4 mb-4">Match History</h3>
                  
                  <div className="space-y-3">
                    {matches.map(match => {
                      const status = getMatchStatus(match.status)
                      return (
                        <div key={match.id} className="p-3 rounded-[var(--radius-md)] bg-[var(--grey-50)]">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{match.opportunity?.title}</p>
                            <span className={`px-2 py-0.5 rounded text-xs ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--grey-500)]">
                            {match.opportunity?.store?.city}, {match.opportunity?.store?.country}
                          </p>
                          {match.match_score && (
                            <p className="text-xs text-[var(--gold)] mt-1">
                              {match.match_score}% match
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Quick Info</h3>
                
                <div className="space-y-3 text-sm">
                  {talent.availability && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--grey-500)]">Availability</span>
                      <span className="font-medium capitalize">{talent.availability}</span>
                    </div>
                  )}
                  {talent.preferred_contract && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--grey-500)]">Preferred Contract</span>
                      <span className="font-medium">{talent.preferred_contract}</span>
                    </div>
                  )}
                  {talent.mobility_preference && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--grey-500)]">Mobility</span>
                      <span className="font-medium capitalize">{talent.mobility_preference}</span>
                    </div>
                  )}
                  {talent.created_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--grey-500)]">Profile Created</span>
                      <span className="font-medium">{new Date(talent.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
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