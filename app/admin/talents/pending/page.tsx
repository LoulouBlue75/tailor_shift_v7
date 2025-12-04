import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button } from '@/components/ui'
import { ArrowLeft, Users, CheckCircle, XCircle, Eye, Clock, MapPin, Briefcase, Calendar, ChevronRight, Settings } from 'lucide-react'

export default async function AdminPendingTalentsPage() {
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

  // Get pending talents
  const { data: pendingTalents, count: totalPending } = await supabase
    .from('talents')
    .select(`
      *,
      profile:profiles(email, created_at)
    `, { count: 'exact' })
    .eq('status', 'pending_review')
    .order('created_at', { ascending: true })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getWaitingTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) return { value: hours, unit: 'hours', urgent: false }
    const days = Math.floor(hours / 24)
    return { value: days, unit: 'days', urgent: days > 2 }
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
              <Link href="/admin/dashboard" className="text-sm text-white/70 hover:text-white">
                Dashboard
              </Link>
              <Link href="/admin/talents/pending" className="text-sm font-medium text-white flex items-center gap-1">
                Validation Queue
                {totalPending && totalPending > 0 && (
                  <span className="px-1.5 py-0.5 bg-[var(--error)] rounded-full text-xs">
                    {totalPending}
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-h1 mb-1">Validation Queue</h1>
            <p className="text-[var(--grey-600)]">
              {totalPending || 0} talent{totalPending !== 1 ? 's' : ''} waiting for validation
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--grey-300)] bg-white text-sm">
              <option value="oldest">Oldest first</option>
              <option value="newest">Newest first</option>
            </select>
          </div>
        </div>

        {/* No Pending Talents */}
        {(!pendingTalents || pendingTalents.length === 0) ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-[var(--success)] mb-4" />
            <h2 className="text-h2 mb-2">All caught up!</h2>
            <p className="text-[var(--grey-600)] mb-6">
              No talents waiting for validation. Great job!
            </p>
            <Link href="/admin/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingTalents.map(talent => {
              const waitingTime = getWaitingTime(talent.created_at)
              
              return (
                <Card key={talent.id} className={`hover:shadow-md transition-shadow ${waitingTime.urgent ? 'border-l-4 border-l-[var(--error)]' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white text-xl shrink-0">
                        {talent.first_name?.[0]}{talent.last_name?.[0]}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium">{talent.first_name} {talent.last_name}</h3>
                            <p className="text-[var(--grey-600)]">{talent.current_role || 'Role not specified'}</p>
                            <p className="text-sm text-[var(--grey-500)]">{talent.profile?.email}</p>
                          </div>
                          
                          {/* Waiting Time Badge */}
                          <div className={`px-3 py-1 rounded-full text-sm ${
                            waitingTime.urgent 
                              ? 'bg-[var(--error-light)] text-[var(--error)]' 
                              : 'bg-[var(--grey-100)] text-[var(--grey-600)]'
                          }`}>
                            <Clock className="w-3.5 h-3.5 inline mr-1" />
                            Waiting {waitingTime.value} {waitingTime.unit}
                          </div>
                        </div>

                        {/* Tags & Info */}
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          {talent.years_experience && (
                            <span className="flex items-center gap-1 text-sm text-[var(--grey-600)]">
                              <Briefcase className="w-4 h-4" />
                              {talent.years_experience}+ years
                            </span>
                          )}
                          {talent.current_location && (
                            <span className="flex items-center gap-1 text-sm text-[var(--grey-600)]">
                              <MapPin className="w-4 h-4" />
                              {talent.current_location}
                            </span>
                          )}
                          {talent.divisions && talent.divisions.length > 0 && (
                            <div className="flex gap-1">
                              {talent.divisions.slice(0, 3).map((div: string) => (
                                <Badge key={div} variant="filled" className="text-xs">
                                  {div.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                              {talent.divisions.length > 3 && (
                                <Badge variant="filled" className="text-xs">
                                  +{talent.divisions.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Profile Completeness */}
                        <div className="mt-4">
                          <div className="flex items-center gap-4 text-xs text-[var(--grey-500)]">
                            <span className={talent.first_name && talent.last_name ? 'text-[var(--success)]' : ''}>
                              {talent.first_name && talent.last_name ? '✓' : '○'} Identity
                            </span>
                            <span className={talent.divisions && talent.divisions.length > 0 ? 'text-[var(--success)]' : ''}>
                              {talent.divisions && talent.divisions.length > 0 ? '✓' : '○'} Divisions
                            </span>
                            <span className={talent.years_experience ? 'text-[var(--success)]' : ''}>
                              {talent.years_experience ? '✓' : '○'} Experience
                            </span>
                            <span className={talent.languages && talent.languages.length > 0 ? 'text-[var(--success)]' : ''}>
                              {talent.languages && talent.languages.length > 0 ? '✓' : '○'} Languages
                            </span>
                            <span className={talent.compensation_profile ? 'text-[var(--success)]' : ''}>
                              {talent.compensation_profile ? '✓' : '○'} Compensation
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Link href={`/admin/talents/${talent.id}`}>
                          <Button className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                        <div className="flex gap-2">
                          <form action={`/api/admin/talents/${talent.id}/approve`} method="POST" className="flex-1">
                            <Button type="submit" variant="secondary" size="sm" className="w-full text-[var(--success)]">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </form>
                          <form action={`/api/admin/talents/${talent.id}/reject`} method="POST" className="flex-1">
                            <Button type="submit" variant="secondary" size="sm" className="w-full text-[var(--error)]">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination (if needed) */}
        {totalPending && totalPending > 20 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled>Previous</Button>
              <span className="px-3 py-1 text-sm text-[var(--grey-600)]">Page 1 of {Math.ceil(totalPending / 20)}</span>
              <Button variant="secondary" size="sm">Next</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}