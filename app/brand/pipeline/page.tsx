import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { calculateMatch, type TalentProfile, type OpportunityProfile } from '@/lib/matching/algorithm'
import { 
  Users, Filter, ChevronRight, MapPin, Briefcase, Star, 
  Clock, UserCheck, Send, X, Search, ArrowLeft, Plus
} from 'lucide-react'

const PIPELINE_STAGES = [
  { id: 'matched', name: 'Matched', icon: Star, color: 'var(--grey-500)' },
  { id: 'interested', name: 'Interested', icon: Send, color: 'var(--info)' },
  { id: 'screening', name: 'Screening', icon: Search, color: 'var(--warning)' },
  { id: 'interviewing', name: 'Interviewing', icon: Clock, color: 'var(--gold)' },
  { id: 'offer', name: 'Offer', icon: UserCheck, color: 'var(--success)' },
  { id: 'hired', name: 'Hired', icon: Users, color: 'var(--success)' },
  { id: 'declined', name: 'Declined', icon: X, color: 'var(--error)' },
]

export default async function BrandPipelinePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!brand) redirect('/brand/onboarding')

  // Get opportunities with matches
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select(`
      *,
      store:stores(name, city, country),
      matches(
        id,
        talent_id,
        status,
        match_score,
        talent:talents(
          id, first_name, last_name, current_role_level, 
          current_employer, current_location, years_in_luxury
        )
      )
    `)
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: false })

  // Get all talents for matching (in production, this would be filtered/paginated)
  const { data: talents } = await supabase
    .from('talents')
    .select('*, assessment:assessments(dimension_scores)')
    .limit(100)

  // Calculate potential matches for opportunities without existing matches
  const opportunitiesWithMatches = (opportunities || []).map(opp => {
    const existingMatches = opp.matches || []
    
    // For demo: if no matches, calculate some based on talents
    let potentialMatches: any[] = []
    if (existingMatches.length === 0 && talents) {
      const oppProfile: OpportunityProfile = {
        id: opp.id,
        role_level: opp.role_level,
        division: opp.division,
        city: opp.store?.city || '',
        country: opp.store?.country || '',
        required_experience_years: opp.required_experience_years,
        required_languages: opp.required_languages || [],
      }

      potentialMatches = talents.slice(0, 5).map(t => {
        const talentProfile: TalentProfile = {
          id: t.id,
          current_role_level: t.current_role_level || 'L2',
          current_location: t.current_location || '',
          divisions_expertise: t.divisions_expertise || [],
          years_in_luxury: t.years_in_luxury || 0,
          languages: t.languages || [],
          assessment_scores: t.assessment?.[0]?.dimension_scores,
        }
        const match = calculateMatch(talentProfile, oppProfile)
        return {
          id: `temp-${t.id}`,
          talent_id: t.id,
          status: 'matched',
          match_score: match.overall_score,
          talent: t,
        }
      }).sort((a, b) => b.match_score - a.match_score)
    }

    return {
      ...opp,
      allMatches: [...existingMatches, ...potentialMatches],
    }
  })

  // Aggregate pipeline stats
  const pipelineStats = PIPELINE_STAGES.map(stage => {
    const count = opportunitiesWithMatches.reduce((sum, opp) => {
      return sum + (opp.allMatches?.filter((m: any) => m.status === stage.id).length || 0)
    }, 0)
    return { ...stage, count }
  })

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
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/brand/dashboard" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Dashboard
              </Link>
              <Link href="/brand/pipeline" className="text-sm font-medium text-[var(--charcoal)]">
                Pipeline
              </Link>
              <Link href="/brand/team" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Team
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Link href="/brand/opportunities/new">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Opportunity
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-h1 mb-1">Talent Pipeline</h1>
          <p className="text-[var(--grey-600)]">Track candidates through your hiring process</p>
        </div>

        {/* Pipeline Stats */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {pipelineStats.map(stage => (
            <div 
              key={stage.id}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[var(--grey-200)] shrink-0"
            >
              <stage.icon className="w-4 h-4" style={{ color: stage.color }} />
              <span className="text-sm font-medium">{stage.name}</span>
              <span className="text-sm text-[var(--grey-500)]">{stage.count}</span>
            </div>
          ))}
        </div>

        {/* Opportunities with Pipeline */}
        {opportunitiesWithMatches.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-[var(--grey-400)]" />
            <h3 className="text-h3 mb-2">No opportunities yet</h3>
            <p className="text-[var(--grey-600)] mb-4">Post your first opportunity to start building your pipeline</p>
            <Link href="/brand/opportunities/new">
              <Button>Post Opportunity</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {opportunitiesWithMatches.map(opp => (
              <Card key={opp.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {opp.title}
                      <Badge variant="level">{opp.role_level}</Badge>
                      <Badge variant={opp.status === 'active' ? 'success' : 'default'}>
                        {opp.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-[var(--grey-600)] mt-1">
                      {opp.store?.city && `${opp.store.city}, ${opp.store.country}`}
                      {opp.division && ` • ${opp.division.replace(/_/g, ' ')}`}
                    </p>
                  </div>
                  <Link href={`/brand/opportunities/${opp.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {opp.allMatches?.length > 0 ? (
                    <div className="space-y-3">
                      {opp.allMatches.slice(0, 5).map((match: any) => (
                        <div 
                          key={match.id}
                          className="flex items-center justify-between p-4 rounded-[var(--radius-md)] bg-[var(--grey-100)] hover:bg-[var(--grey-200)] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white font-medium">
                              {match.talent?.first_name?.[0]}{match.talent?.last_name?.[0]}
                            </div>
                            
                            {/* Info */}
                            <div>
                              <p className="font-medium">
                                {match.talent?.first_name} {match.talent?.last_name}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-[var(--grey-600)]">
                                {match.talent?.current_employer && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {match.talent.current_employer}
                                  </span>
                                )}
                                {match.talent?.current_location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {match.talent.current_location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Match Score */}
                            <div className="text-center">
                              <p className="text-lg font-display text-[var(--gold)]">{match.match_score}%</p>
                              <p className="text-caption text-[var(--grey-500)]">match</p>
                            </div>

                            {/* Stage Badge */}
                            <Badge variant={match.status === 'matched' ? 'default' : 'filled'}>
                              {PIPELINE_STAGES.find(s => s.id === match.status)?.name || match.status}
                            </Badge>

                            {/* Actions */}
                            <Link href={`/brand/pipeline/${match.talent_id}`}>
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                      
                      {opp.allMatches.length > 5 && (
                        <Link href={`/brand/opportunities/${opp.id}/matches`} className="block">
                          <Button variant="ghost" size="sm" className="w-full">
                            View all {opp.allMatches.length} candidates
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--grey-500)]">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No matches yet. Candidates will appear here once they apply.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
