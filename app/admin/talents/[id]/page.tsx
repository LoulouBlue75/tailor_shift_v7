import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button } from '@/components/ui'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, User, MapPin, Briefcase, Languages, DollarSign, Calendar, Mail, Phone, Clock, Star, Settings, FileText, Award, Building2 } from 'lucide-react'

export default async function AdminTalentDetailPage({
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

  // Check if user is admin
  if (profile?.user_type !== 'admin') {
    redirect('/login')
  }

  // Get talent with all details
  const { data: talent, error } = await supabase
    .from('talents')
    .select(`
      *,
      profile:profiles(email, created_at)
    `)
    .eq('id', id)
    .single()

  if (error || !talent) {
    notFound()
  }

  // Get talent's experiences
  const { data: experiences } = await supabase
    .from('experiences')
    .select(`
      *,
      brand:brands(name, logo_url)
    `)
    .eq('talent_id', id)
    .order('start_date', { ascending: false })

  // Get talent's matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      opportunity:opportunities(
        title, 
        brand:brands(name)
      )
    `)
    .eq('talent_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'onboarding':
        return <Badge variant="level" className="bg-[var(--info-light)] text-[var(--info)]">Onboarding</Badge>
      case 'pending_review':
        return <Badge variant="level" className="bg-[var(--warning-light)] text-[var(--warning)]">Pending Review</Badge>
      case 'approved':
        return <Badge variant="level" className="bg-[var(--success-light)] text-[var(--success)]">Approved</Badge>
      case 'rejected':
        return <Badge variant="level" className="bg-[var(--error-light)] text-[var(--error)]">Rejected</Badge>
      case 'suspended':
        return <Badge variant="level" className="bg-[var(--grey-200)] text-[var(--grey-600)]">Suspended</Badge>
      default:
        return <Badge variant="level">{status}</Badge>
    }
  }

  // Calculate profile completeness
  const profileChecks = {
    identity: !!(talent.first_name && talent.last_name),
    contact: !!(talent.profile?.email),
    divisions: talent.divisions && talent.divisions.length > 0,
    experience: !!(talent.years_experience),
    languages: talent.languages && talent.languages.length > 0,
    location: !!(talent.current_location),
    compensation: !!(talent.compensation_profile),
    preferences: !!(talent.availability || talent.mobility_preference),
  }
  const completenessScore = Object.values(profileChecks).filter(Boolean).length
  const completenessPercentage = Math.round((completenessScore / Object.keys(profileChecks).length) * 100)

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
              <Link href="/admin/dashboard" className="text-sm text-white/70 hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/talents/pending" className="text-sm text-white/70 hover:text-white">
                Validation Queue
              </Link>
              <Link href="/admin/talents" className="text-sm font-medium text-white">
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
        {/* Back Navigation */}
        <Link href="/admin/talents/pending" className="inline-flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Validation Queue
        </Link>

        {/* Action Bar (Sticky for review) */}
        {talent.status === 'pending_review' && (
          <Card className="mb-6 border-l-4 border-l-[var(--warning)] sticky top-20 z-40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
                  <div>
                    <p className="font-medium">This talent is pending validation</p>
                    <p className="text-sm text-[var(--grey-600)]">Review the profile and approve or reject</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={`/api/admin/talents/${talent.id}/reject`} method="POST">
                    <Button type="submit" variant="secondary" className="text-[var(--error)]">
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </form>
                  <form action={`/api/admin/talents/${talent.id}/approve`} method="POST">
                    <Button type="submit">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve Talent
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white text-3xl font-display shrink-0">
                    {talent.first_name?.[0]}{talent.last_name?.[0]}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h1 className="text-h1">{talent.first_name} {talent.last_name}</h1>
                          {getStatusBadge(talent.status)}
                        </div>
                        <p className="text-lg text-[var(--grey-600)]">{talent.current_role || 'Role not specified'}</p>
                        {talent.current_location && (
                          <p className="text-sm text-[var(--grey-500)] flex items-center gap-1 mt-1">
                            <MapPin className="w-4 h-4" />
                            {talent.current_location}
                          </p>
                        )}
                      </div>

                      {/* Completeness Score */}
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                          completenessPercentage >= 80 ? 'border-[var(--success)]' :
                          completenessPercentage >= 50 ? 'border-[var(--warning)]' :
                          'border-[var(--error)]'
                        }`}>
                          <span className="text-lg font-display">{completenessPercentage}%</span>
                        </div>
                        <p className="text-xs text-[var(--grey-500)] mt-1">Complete</p>
                      </div>
                    </div>

                    {/* Divisions */}
                    {talent.divisions && talent.divisions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {talent.divisions.map((div: string) => (
                          <Badge key={div} variant="filled">{div.replace(/_/g, ' ')}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Email</p>
                    <p className="font-medium">{talent.profile?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Phone</p>
                    <p className="font-medium">{talent.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Location</p>
                    <p className="font-medium">{talent.current_location || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Account Created</p>
                    <p className="font-medium">{formatDate(talent.profile?.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-h3 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </h2>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Current Role</p>
                    <p className="font-medium">{talent.current_role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Years of Experience</p>
                    <p className="font-medium">{talent.years_experience ? `${talent.years_experience}+ years` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Availability</p>
                    <p className="font-medium capitalize">{talent.availability || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-1">Mobility Preference</p>
                    <p className="font-medium capitalize">{talent.mobility_preference || 'N/A'}</p>
                  </div>
                </div>

                {/* Languages */}
                {talent.languages && talent.languages.length > 0 && (
                  <div>
                    <p className="text-small text-[var(--grey-500)] mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.languages.map((lang: string) => (
                        <Badge key={lang} variant="level">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {talent.skills && talent.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-small text-[var(--grey-500)] mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.map((skill: string) => (
                        <Badge key={skill} variant="filled">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compensation */}
            {talent.compensation_profile && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-h3 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[var(--gold)]" />
                    Compensation Profile
                    <span className="text-xs bg-[var(--grey-100)] px-2 py-0.5 rounded text-[var(--grey-500)]">Private</span>
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {talent.compensation_profile.current_base && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-1">Current Base</p>
                        <p className="font-medium">
                          {talent.compensation_profile.currency || '€'}{talent.compensation_profile.current_base.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {talent.compensation_profile.current_variable && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-1">Current Variable</p>
                        <p className="font-medium">
                          {talent.compensation_profile.current_variable}%
                        </p>
                      </div>
                    )}
                    {talent.compensation_profile.salary_expectations?.min && (
                      <div>
                        <p className="text-small text-[var(--grey-500)] mb-1">Expected Salary</p>
                        <p className="font-medium">
                          {talent.compensation_profile.currency || '€'}{talent.compensation_profile.salary_expectations.min.toLocaleString()}
                          {talent.compensation_profile.salary_expectations.max && 
                            ` - ${talent.compensation_profile.currency || '€'}${talent.compensation_profile.salary_expectations.max.toLocaleString()}`
                          }
                        </p>
                      </div>
                    )}
                    {talent.compensation_profile.benefits && (
                      <div className="col-span-2">
                        <p className="text-small text-[var(--grey-500)] mb-2">Benefits & Perks</p>
                        <div className="flex flex-wrap gap-2">
                          {talent.compensation_profile.benefits.map((benefit: string) => (
                            <Badge key={benefit} variant="filled" className="text-xs">{benefit}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience History */}
            {experiences && experiences.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-h3 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Experience History
                  </h2>
                  
                  <div className="space-y-6">
                    {experiences.map((exp, index) => (
                      <div key={exp.id} className={`${index !== 0 ? 'border-t border-[var(--grey-200)] pt-6' : ''}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--grey-100)] flex items-center justify-center shrink-0">
                            {exp.brand?.logo_url ? (
                              <img src={exp.brand.logo_url} alt={exp.brand.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <Building2 className="w-5 h-5 text-[var(--grey-500)]" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{exp.role_title}</h4>
                            <p className="text-[var(--grey-600)]">{exp.brand?.name || exp.company_name}</p>
                            <p className="text-sm text-[var(--grey-500)]">
                              {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-[var(--grey-600)] mt-2">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completeness */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Profile Checklist</h3>
                
                <div className="space-y-2">
                  {Object.entries(profileChecks).map(([key, complete]) => (
                    <div key={key} className="flex items-center justify-between py-1">
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className={complete ? 'text-[var(--success)]' : 'text-[var(--grey-400)]'}>
                        {complete ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4">Status Actions</h3>
                
                <div className="space-y-2">
                  {talent.status !== 'approved' && (
                    <form action={`/api/admin/talents/${talent.id}/approve`} method="POST">
                      <Button type="submit" className="w-full" variant={talent.status === 'pending_review' ? 'primary' : 'secondary'}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </form>
                  )}
                  {talent.status !== 'rejected' && (
                    <form action={`/api/admin/talents/${talent.id}/reject`} method="POST">
                      <Button type="submit" variant="secondary" className="w-full text-[var(--error)]">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </form>
                  )}
                  {talent.status === 'approved' && (
                    <form action={`/api/admin/talents/${talent.id}/suspend`} method="POST">
                      <Button type="submit" variant="ghost" className="w-full text-[var(--grey-500)]">
                        Suspend Account
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            {matches && matches.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-h4 mb-4">Recent Matches</h3>
                  
                  <div className="space-y-3">
                    {matches.map(match => (
                      <div key={match.id} className="p-2 bg-[var(--grey-50)] rounded-[var(--radius-sm)]">
                        <p className="text-sm font-medium truncate">{match.opportunity?.title}</p>
                        <p className="text-xs text-[var(--grey-500)]">{match.opportunity?.brand?.name}</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-[var(--grey-500)]">{match.status}</span>
                          {match.match_score && (
                            <span className="text-xs text-[var(--gold)]">{match.match_score}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Notes (Placeholder) */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-h4 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Admin Notes
                </h3>
                
                <textarea 
                  className="w-full p-3 border border-[var(--grey-300)] rounded-[var(--radius-md)] text-sm resize-none"
                  rows={4}
                  placeholder="Add notes about this candidate..."
                />
                <Button variant="secondary" size="sm" className="mt-2 w-full">
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}