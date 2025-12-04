import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo, Badge, Card, CardContent, Button } from '@/components/ui'
import Link from 'next/link'
import { MapPin, Building2, Heart, ChevronRight, Target, ArrowLeft, Filter, DollarSign, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'
import {
  calculateMatch,
  calculateCompensationAlignment,
  type TalentProfile,
  type OpportunityProfile,
  type MatchResult,
  type CompensationAlignmentResult
} from '@/lib/matching/algorithm'

export default async function TalentOpportunitiesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: talent } = await supabase
    .from('talents')
    .select('*, compensation_profile')
    .eq('profile_id', user.id)
    .single()

  if (!talent) redirect('/talent/onboarding')

  // Get latest assessment
  const { data: assessment } = await supabase
    .from('assessments')
    .select('dimension_scores')
    .eq('talent_id', talent.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  // Get active opportunities with brand and store info, including compensation_range
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select(`
      *,
      brand:brands(name, segment, logo_url),
      store:stores(name, city, country, tier),
      compensation_range
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(50)

  // Calculate matches
  const talentProfile: TalentProfile = {
    id: talent.id,
    current_role_level: talent.current_role_level || 'L2',
    current_location: talent.current_location || '',
    divisions_expertise: talent.divisions_expertise || [],
    years_in_luxury: talent.years_in_luxury || 0,
    languages: talent.languages || [],
    career_preferences: talent.career_preferences as TalentProfile['career_preferences'],
    assessment_scores: assessment?.dimension_scores,
  }

  // Extract talent compensation expectations
  const talentComp = talent.compensation_profile as {
    expectations?: number
    currency?: string
    current_base?: number
    hide_exact_figures?: boolean
  } | null

  const matchedOpportunities = (opportunities || []).map(opp => {
    const oppProfile: OpportunityProfile = {
      id: opp.id,
      role_level: opp.role_level,
      division: opp.division,
      city: opp.store?.city || '',
      country: opp.store?.country || '',
      required_experience_years: opp.required_experience_years,
      required_languages: opp.required_languages || [],
    }
    
    const match = calculateMatch(talentProfile, oppProfile)
    
    // Calculate compensation alignment for this opportunity
    const oppCompRange = opp.compensation_range as {
      min_base?: number
      max_base?: number
      currency?: string
    } | null
    
    const compAlignment = calculateCompensationAlignment(
      talentComp?.expectations,
      oppCompRange?.min_base,
      oppCompRange?.max_base,
      talentComp?.currency,
      oppCompRange?.currency
    )

    return { ...opp, match, compAlignment }
  }).sort((a, b) => b.match.overall_score - a.match.overall_score)

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-[var(--success)] text-white'
    if (score >= 65) return 'bg-[var(--gold)] text-white'
    if (score >= 50) return 'bg-[var(--info)] text-white'
    return 'bg-[var(--grey-400)] text-white'
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/talent/dashboard" className="flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                <ArrowLeft className="w-4 h-4" />
              </Link>
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
            </nav>

            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-h1 mb-1">Opportunities</h1>
            <p className="text-[var(--grey-600)]">
              {matchedOpportunities.length} positions matched to your profile
            </p>
          </div>
        </div>

        {!assessment && (
          <Card className="mb-6 border-[var(--gold)] bg-[var(--gold-light)]/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[var(--gold)]" />
                <p className="text-sm">
                  <strong>Complete your assessment</strong> to get better match scores
                </p>
              </div>
              <Link href="/talent/assessment">
                <Button size="sm">Take Assessment</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Prompt to add compensation expectations if not set */}
        {!talentComp?.expectations && (
          <Card className="mb-6 border-[var(--info)] bg-[var(--info)]/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[var(--info)]" />
                <p className="text-sm">
                  <strong>Add your salary expectations</strong> to see which roles fit your budget
                </p>
              </div>
              <Link href="/talent/profile#compensation">
                <Button size="sm" variant="secondary">Add Expectations</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {matchedOpportunities.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-[var(--grey-400)]" />
            <h3 className="text-h3 mb-2">No opportunities yet</h3>
            <p className="text-[var(--grey-600)]">
              Check back soon as brands post new positions
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {matchedOpportunities.map((opp) => (
              <Card key={opp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Brand Logo */}
                    <div className="w-14 h-14 rounded-[var(--radius-md)] bg-[var(--grey-100)] flex items-center justify-center shrink-0">
                      {opp.brand?.logo_url ? (
                        <img src={opp.brand.logo_url} alt={opp.brand.name} className="w-10 h-10 object-contain" />
                      ) : (
                        <Building2 className="w-6 h-6 text-[var(--grey-500)]" />
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-lg">{opp.title}</h3>
                          <p className="text-[var(--grey-600)]">{opp.brand?.name}</p>
                        </div>
                        
                        {/* Match Score */}
                        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${getMatchColor(opp.match.overall_score)}`}>
                          {opp.match.overall_score}% match
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="level">{opp.role_level}</Badge>
                        {opp.store?.tier && <Badge variant="tier">{opp.store.tier}</Badge>}
                        {opp.division && (
                          <Badge variant="filled">{opp.division.replace(/_/g, ' ')}</Badge>
                        )}
                        
                        {/* Compensation Fit Indicator */}
                        {opp.compAlignment && opp.compAlignment.alignment !== 'unknown' && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              opp.compAlignment.alignment === 'within_range'
                                ? 'bg-[var(--success-light)] text-[var(--success)]'
                                : opp.compAlignment.alignment === 'above_range'
                                  ? 'bg-[var(--warning-light,#FEF3CD)] text-[var(--warning,#856404)]'
                                  : 'bg-[var(--info-light,#D1ECF1)] text-[var(--info)]'
                            }`}
                          >
                            {opp.compAlignment.alignment === 'within_range' && (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                <span>Within budget</span>
                              </>
                            )}
                            {opp.compAlignment.alignment === 'above_range' && (
                              <>
                                <TrendingUp className="w-3 h-3" />
                                <span>Above budget</span>
                              </>
                            )}
                            {opp.compAlignment.alignment === 'below_range' && (
                              <>
                                <TrendingDown className="w-3 h-3" />
                                <span>Below expectations</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-4 text-sm text-[var(--grey-600)]">
                        {opp.store && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {opp.store.city}, {opp.store.country}
                          </span>
                        )}
                        {opp.required_experience_years && (
                          <span>{opp.required_experience_years}+ years exp</span>
                        )}
                      </div>

                      {/* Match Breakdown */}
                      <div className="mt-4 pt-4 border-t border-[var(--grey-200)]">
                        <p className="text-small text-[var(--grey-500)] mb-2">Match breakdown</p>
                        <div className="flex gap-4 overflow-x-auto">
                          {opp.match.breakdown.slice(0, 5).map((dim: { dimension: string; score: number; weight: number; weighted_score: number }) => (
                            <div key={dim.dimension} className="text-center shrink-0">
                              <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center mx-auto mb-1"
                                style={{ 
                                  borderColor: dim.score >= 70 ? 'var(--gold)' : 'var(--grey-300)',
                                  backgroundColor: dim.score >= 70 ? 'var(--gold-light)' : 'transparent'
                                }}
                              >
                                <span className="text-small font-medium">{dim.score}</span>
                              </div>
                              <span className="text-caption text-[var(--grey-600)] capitalize">
                                {dim.dimension.replace(/_/g, ' ').slice(0, 10)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link href={`/talent/opportunities/${opp.id}`}>
                        <Button size="sm">
                          View
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
