import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button } from '@/components/ui'
import { 
  Users, UserPlus, Search, MapPin, Briefcase, Star, 
  ArrowLeft, MessageCircle, Award, Filter
} from 'lucide-react'

export default async function TalentNetworkPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentTalent } = await supabase
    .from('talents')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!currentTalent) redirect('/talent/onboarding')

  // Get connections
  const { data: connections } = await supabase
    .from('connections')
    .select(`
      *,
      connected_talent:talents!connections_connected_id_fkey(
        id, first_name, last_name, current_role_level,
        current_employer, current_location, divisions_expertise
      )
    `)
    .eq('talent_id', currentTalent.id)
    .eq('status', 'accepted')

  // Get suggested talents (for demo, just get other talents)
  const { data: suggestedTalents } = await supabase
    .from('talents')
    .select('*')
    .neq('id', currentTalent.id)
    .limit(10)

  // Get pending connection requests
  const { data: pendingRequests } = await supabase
    .from('connections')
    .select(`
      *,
      talent:talents!connections_talent_id_fkey(
        id, first_name, last_name, current_role_level,
        current_employer, current_location
      )
    `)
    .eq('connected_id', currentTalent.id)
    .eq('status', 'pending')

  // Get endorsements received
  const { data: endorsements } = await supabase
    .from('endorsements')
    .select(`
      *,
      endorser:talents!endorsements_endorser_id_fkey(
        first_name, last_name, current_employer
      )
    `)
    .eq('talent_id', currentTalent.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/talent/dashboard">
                <ArrowLeft className="w-5 h-5 text-[var(--grey-600)] hover:text-[var(--charcoal)]" />
              </Link>
              <Logo size="md" />
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/talent/dashboard" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Dashboard
              </Link>
              <Link href="/talent/network" className="text-sm font-medium text-[var(--charcoal)]">
                Network
              </Link>
              <Link href="/talent/opportunities" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Opportunities
              </Link>
            </nav>

            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-h1 mb-1">Your Network</h1>
          <p className="text-[var(--grey-600)]">
            Connect with peers and build your professional network
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
            <p className="text-2xl font-display">{connections?.length || 0}</p>
            <p className="text-small text-[var(--grey-600)]">Connections</p>
          </Card>
          <Card className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
            <p className="text-2xl font-display">{endorsements?.length || 0}</p>
            <p className="text-small text-[var(--grey-600)]">Endorsements</p>
          </Card>
          <Card className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
            <p className="text-2xl font-display">{pendingRequests?.length || 0}</p>
            <p className="text-small text-[var(--grey-600)]">Pending</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Requests */}
            {pendingRequests && pendingRequests.length > 0 && (
              <Card>
                <div className="p-4 border-b border-[var(--grey-200)]">
                  <h3 className="font-medium flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[var(--gold)]" />
                    Connection Requests ({pendingRequests.length})
                  </h3>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {pendingRequests.map((request: any) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-[var(--grey-100)] rounded-[var(--radius-md)]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white text-sm font-medium">
                            {request.talent?.first_name?.[0]}{request.talent?.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {request.talent?.first_name} {request.talent?.last_name}
                            </p>
                            <p className="text-small text-[var(--grey-600)]">
                              {request.talent?.current_employer}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Accept</Button>
                          <Button variant="ghost" size="sm">Decline</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggested Connections */}
            <Card>
              <div className="p-4 border-b border-[var(--grey-200)]">
                <h3 className="font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Professionals You May Know
                </h3>
              </div>
              <CardContent className="p-0">
                {suggestedTalents && suggestedTalents.length > 0 ? (
                  <div className="divide-y divide-[var(--grey-200)]">
                    {suggestedTalents.map((talent: any) => (
                      <div key={talent.id} className="p-4 hover:bg-[var(--grey-100)] transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white font-medium">
                              {talent.first_name?.[0]}{talent.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium">
                                {talent.first_name} {talent.last_name}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-[var(--grey-600)]">
                                {talent.current_employer && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {talent.current_employer}
                                  </span>
                                )}
                                {talent.current_location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {talent.current_location}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 mt-2">
                                {talent.divisions_expertise?.slice(0, 3).map((div: string) => (
                                  <Badge key={div} variant="default" size="sm">
                                    {div.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">
                              <UserPlus className="w-4 h-4 mr-1" />
                              Connect
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-[var(--grey-500)]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No suggestions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Connections */}
            <Card>
              <div className="p-4 border-b border-[var(--grey-200)]">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  My Connections
                </h3>
              </div>
              <CardContent className="p-4">
                {connections && connections.length > 0 ? (
                  <div className="space-y-3">
                    {connections.slice(0, 5).map((conn: any) => (
                      <div key={conn.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--grey-200)] flex items-center justify-center text-sm font-medium">
                          {conn.connected_talent?.first_name?.[0]}{conn.connected_talent?.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conn.connected_talent?.first_name} {conn.connected_talent?.last_name}
                          </p>
                          <p className="text-caption text-[var(--grey-600)] truncate">
                            {conn.connected_talent?.current_employer}
                          </p>
                        </div>
                      </div>
                    ))}
                    {connections.length > 5 && (
                      <Button variant="ghost" size="sm" className="w-full">
                        View all {connections.length} connections
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--grey-500)] text-center py-4">
                    No connections yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Endorsements */}
            <Card>
              <div className="p-4 border-b border-[var(--grey-200)]">
                <h3 className="font-medium flex items-center gap-2">
                  <Award className="w-4 h-4 text-[var(--gold)]" />
                  Endorsements
                </h3>
              </div>
              <CardContent className="p-4">
                {endorsements && endorsements.length > 0 ? (
                  <div className="space-y-3">
                    {endorsements.map((endorsement: any) => (
                      <div key={endorsement.id} className="p-3 bg-[var(--grey-100)] rounded-[var(--radius-md)]">
                        <p className="text-sm italic text-[var(--grey-700)] mb-2">
                          "{endorsement.message}"
                        </p>
                        <p className="text-caption text-[var(--grey-600)]">
                          — {endorsement.endorser?.first_name} {endorsement.endorser?.last_name}
                        </p>
                        <Badge variant="gold" size="sm" className="mt-2">
                          {endorsement.skill}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Award className="w-8 h-8 mx-auto mb-2 text-[var(--grey-300)]" />
                    <p className="text-sm text-[var(--grey-500)]">
                      No endorsements yet
                    </p>
                    <p className="text-caption text-[var(--grey-400)] mt-1">
                      Connect with colleagues to receive endorsements
                    </p>
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
