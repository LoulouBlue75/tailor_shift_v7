import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { Users, Plus, Mail, Shield, MoreVertical, ArrowLeft, UserPlus } from 'lucide-react'

const ROLES = {
  owner: { name: 'Owner', color: 'var(--gold)', icon: Shield },
  admin: { name: 'Admin', color: 'var(--charcoal)', icon: Shield },
  recruiter: { name: 'Recruiter', color: 'var(--info)', icon: Users },
  viewer: { name: 'Viewer', color: 'var(--grey-500)', icon: Users },
}

export default async function BrandTeamPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!brand) redirect('/brand/onboarding')

  // Get team members
  const { data: teamMembers } = await supabase
    .from('brand_team_members')
    .select(`
      *,
      profile:profiles(id, email, full_name, avatar_url)
    `)
    .eq('brand_id', brand.id)
    .order('created_at', { ascending: true })

  // Get pending invitations
  const { data: invitations } = await supabase
    .from('brand_invitations')
    .select('*')
    .eq('brand_id', brand.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Current user is always owner if they created the brand
  const currentUserMember = {
    id: 'owner',
    profile_id: user.id,
    role: 'owner',
    profile: {
      email: user.email,
      full_name: brand.contact_name || 'Brand Owner',
    }
  }

  const allMembers = [currentUserMember, ...(teamMembers || [])]

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6">
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
              <Link href="/brand/pipeline" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Pipeline
              </Link>
              <Link href="/brand/team" className="text-sm font-medium text-[var(--charcoal)]">
                Team
              </Link>
            </nav>

            <Link href="/brand/team/invite">
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-h1 mb-1">Team</h1>
          <p className="text-[var(--grey-600)]">Manage your recruiting team members</p>
        </div>

        {/* Team Members */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({allMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-[var(--grey-200)]">
              {allMembers.map((member: any) => {
                const roleConfig = ROLES[member.role as keyof typeof ROLES] || ROLES.viewer
                const RoleIcon = roleConfig.icon
                
                return (
                  <div key={member.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[var(--grey-200)] flex items-center justify-center text-[var(--grey-600)] font-medium">
                        {member.profile?.full_name?.[0] || member.profile?.email?.[0]?.toUpperCase()}
                      </div>
                      
                      {/* Info */}
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {member.profile?.full_name || 'Team Member'}
                          {member.role === 'owner' && (
                            <Badge variant="gold" size="sm">Owner</Badge>
                          )}
                        </p>
                        <p className="text-sm text-[var(--grey-600)]">{member.profile?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--grey-100)]">
                        <RoleIcon className="w-4 h-4" style={{ color: roleConfig.color }} />
                        <span className="text-sm">{roleConfig.name}</span>
                      </div>
                      
                      {member.role !== 'owner' && (
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {invitations && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Pending Invitations ({invitations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-[var(--grey-200)]">
                {invitations.map((invitation: any) => (
                  <div key={invitation.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--grey-100)] flex items-center justify-center text-[var(--grey-400)]">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-[var(--grey-600)]">
                          Invited {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="warning" size="sm">Pending</Badge>
                      <Button variant="ghost" size="sm">Resend</Button>
                      <Button variant="ghost" size="sm" className="text-[var(--error)]">Cancel</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty Invitations State */}
        {(!invitations || invitations.length === 0) && allMembers.length === 1 && (
          <Card className="p-8 text-center">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-[var(--grey-400)]" />
            <h3 className="text-h3 mb-2">Grow your team</h3>
            <p className="text-[var(--grey-600)] mb-4">
              Invite colleagues to help manage recruitment
            </p>
            <Link href="/brand/team/invite">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Team Member
              </Button>
            </Link>
          </Card>
        )}

        {/* Roles Info */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-[var(--grey-600)] mb-4">Role Permissions</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(ROLES).map(([key, role]) => {
              const Icon = role.icon
              return (
                <div key={key} className="p-4 rounded-[var(--radius-md)] bg-white border border-[var(--grey-200)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: role.color }} />
                    <span className="font-medium text-sm">{role.name}</span>
                  </div>
                  <p className="text-small text-[var(--grey-600)]">
                    {key === 'owner' && 'Full access, manage billing and team'}
                    {key === 'admin' && 'Manage opportunities, team, and settings'}
                    {key === 'recruiter' && 'Post opportunities and manage pipeline'}
                    {key === 'viewer' && 'View-only access to pipeline and analytics'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
