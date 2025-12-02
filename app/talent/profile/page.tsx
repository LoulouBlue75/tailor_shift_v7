import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import Link from 'next/link'
import { 
  User, MapPin, Briefcase, Calendar, ExternalLink, Phone, 
  Edit, ArrowLeft, Linkedin, Clock, Target, Star
} from 'lucide-react'

export default async function TalentProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: talent } = await supabase
    .from('talents')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!talent) redirect('/talent/onboarding')

  const { data: experiences } = await supabase
    .from('experience_blocks')
    .select('*')
    .eq('talent_id', talent.id)
    .order('start_date', { ascending: false })

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('talent_id', talent.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/talent/dashboard" className="flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <Link href="/talent/profile/edit">
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-[var(--gold-light)] flex items-center justify-center text-3xl font-display text-[var(--gold-dark)] shrink-0">
                {talent.first_name?.[0]}{talent.last_name?.[0]}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-h1 mb-2">
                  {talent.first_name} {talent.last_name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="level" size="lg">{talent.current_role_level || 'N/A'}</Badge>
                  <Badge variant="tier" size="lg">{talent.current_store_tier || 'N/A'}</Badge>
                  {talent.years_in_luxury && (
                    <span className="text-[var(--grey-600)] text-sm">
                      {talent.years_in_luxury} years in luxury
                    </span>
                  )}
                </div>

                {talent.current_maison && (
                  <p className="text-[var(--grey-700)] mb-2">
                    Currently at <span className="font-medium">{talent.current_maison}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-[var(--grey-600)]">
                  {talent.current_location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {talent.current_location}
                    </div>
                  )}
                  {talent.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {talent.phone}
                    </div>
                  )}
                  {talent.linkedin_url && (
                    <a 
                      href={talent.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[var(--gold)] hover:underline"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Profile Completion */}
              <div className="text-center md:text-right">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-[var(--gold)] mb-2">
                  <span className="text-lg font-medium">{talent.profile_completion_pct || 0}%</span>
                </div>
                <p className="text-small text-[var(--grey-600)]">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Divisions */}
            <Card>
              <CardHeader>
                <CardTitle>Product Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                {talent.divisions_expertise?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {talent.divisions_expertise.map((div: string) => (
                      <Badge key={div} variant="filled" size="md">
                        {div.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--grey-500)]">No divisions added yet</p>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Experience</CardTitle>
                <Link href="/talent/experience/new">
                  <Button variant="ghost" size="sm">+ Add</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {experiences && experiences.length > 0 ? (
                  <div className="space-y-6">
                    {experiences.map((exp: any) => (
                      <div key={exp.id} className="flex gap-4 pb-6 border-b border-[var(--grey-200)] last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-[var(--gold)] mt-2 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-medium">{exp.title}</h3>
                            <div className="flex gap-1">
                              {exp.role_level && <Badge variant="level" size="sm">{exp.role_level}</Badge>}
                              {exp.store_tier && <Badge variant="tier" size="sm">{exp.store_tier}</Badge>}
                            </div>
                          </div>
                          {exp.maison && (
                            <p className="text-[var(--grey-700)]">{exp.maison}</p>
                          )}
                          <div className="flex items-center gap-4 text-small text-[var(--grey-500)] mt-1">
                            {exp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {exp.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {exp.start_date && new Date(exp.start_date).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                              {' - '}
                              {exp.is_current ? 'Present' : exp.end_date && new Date(exp.end_date).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-[var(--grey-600)] mt-2">{exp.description}</p>
                          )}
                          {exp.achievements?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {exp.achievements.map((ach: string, i: number) => (
                                <li key={i} className="text-sm text-[var(--grey-600)] flex items-start gap-2">
                                  <span className="text-[var(--gold)]">•</span>
                                  {ach}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--grey-500)]">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No experience added yet</p>
                    <Link href="/talent/experience/new">
                      <Button variant="ghost" size="sm" className="mt-2">Add your first experience</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assessment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[var(--gold)]" />
                  Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assessment ? (
                  <div className="space-y-4">
                    <Badge variant={assessment.level === 'expert' ? 'success' : 'default'}>
                      {assessment.level}
                    </Badge>
                    <p className="text-small text-[var(--grey-600)]">
                      Completed {new Date(assessment.completed_at).toLocaleDateString()}
                    </p>
                    <Link href="/talent/assessment/results">
                      <Button variant="ghost" size="sm" className="w-full">View Results</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[var(--grey-500)] text-sm mb-3">
                      Complete the 6D assessment to unlock better matches
                    </p>
                    <Link href="/talent/assessment">
                      <Button size="sm" className="w-full">Take Assessment</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Career Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Career Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-small text-[var(--grey-500)] mb-1">Status</p>
                  <Badge variant={
                    talent.career_preferences?.timeline === 'active' ? 'success' :
                    talent.career_preferences?.timeline === 'passive' ? 'warning' : 'default'
                  }>
                    {talent.career_preferences?.timeline === 'active' ? 'Actively Looking' :
                     talent.career_preferences?.timeline === 'passive' ? 'Open to Opportunities' : 'Not Looking'}
                  </Badge>
                </div>

                {talent.career_preferences?.target_role_levels?.length > 0 && (
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Target Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {talent.career_preferences.target_role_levels.map((role: string) => (
                        <Badge key={role} variant="level" size="sm">{role}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-small text-[var(--grey-500)] mb-1">Mobility</p>
                  <p className="text-sm capitalize">{talent.career_preferences?.mobility || 'Not specified'}</p>
                </div>

                {talent.career_preferences?.target_locations?.length > 0 && (
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Preferred Locations</p>
                    <p className="text-sm">{talent.career_preferences.target_locations.join(', ')}</p>
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
