import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button, UserMenu } from '@/components/ui'
import Link from 'next/link'
import {
  Building2, Users, Bell, Shield, Globe, AlertTriangle,
  CheckCircle, XCircle, ChevronRight, TrendingUp
} from 'lucide-react'
import { isGroupAdmin, getGroupBrands, getGroupPendingRequests, getGroupTeamMembers, getLuxuryGroup } from '@/lib/auth/group-rbac'
import { GroupPendingApprovals } from '@/components/group/pending-group-approvals'

export default async function GroupDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user is a group admin
  const groupAccess = await isGroupAdmin(user.id)
  if (!groupAccess.isAdmin || !groupAccess.groupId) {
    redirect('/brand/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get group details
  const group = await getLuxuryGroup(groupAccess.groupId)
  if (!group) redirect('/brand/dashboard')

  // Get brands in the group
  const brands = await getGroupBrands(groupAccess.groupId)
  
  // Get pending requests for group approval
  const pendingRequests = await getGroupPendingRequests(groupAccess.groupId, { 
    requiresGroupApproval: true 
  })
  
  // Get all pending requests (for awareness)
  const allPendingRequests = await getGroupPendingRequests(groupAccess.groupId)
  
  // Get group team members
  const groupTeam = await getGroupTeamMembers(groupAccess.groupId)
  
  // Aggregate stats
  const verifiedBrands = brands.filter(b => b.verified).length
  const pendingGroupApprovalCount = pendingRequests.length
  const totalPendingCount = allPendingRequests.length

  const ROLE_LABELS: Record<string, string> = {
    group_owner: 'Group Owner',
    group_admin: 'Group Admin',
    group_hr: 'Group HR',
    group_viewer: 'Viewer'
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-[var(--charcoal)] border-b border-[var(--grey-700)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Logo size="md" />
              <div className="flex items-center gap-2 pl-4 border-l border-[var(--grey-600)]">
                <Shield className="w-4 h-4 text-[var(--gold)]" />
                <span className="font-medium text-sm text-white">{group.name}</span>
                <Badge variant="gold" size="sm">Group Admin</Badge>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/group/dashboard" className="text-sm font-medium text-white">
                Dashboard
              </Link>
              <Link href="/group/brands" className="text-sm text-[var(--grey-400)] hover:text-white">
                Brands
              </Link>
              <Link href="/group/team" className="text-sm text-[var(--grey-400)] hover:text-white">
                Team
              </Link>
              <Link href="/group/analytics" className="text-sm text-[var(--grey-400)] hover:text-white">
                Analytics
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-[var(--grey-400)] hover:text-white hover:bg-[var(--grey-700)] rounded-full relative transition-colors">
                <Bell className="w-5 h-5" />
                {totalPendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--gold)] text-[var(--charcoal)] text-xs font-bold rounded-full flex items-center justify-center">
                    {totalPendingCount > 9 ? '9+' : totalPendingCount}
                  </span>
                )}
              </button>
              <UserMenu
                initials={profile?.full_name?.[0] || 'G'}
                fullName={profile?.full_name || 'Group Admin'}
                email={profile?.email}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-h1 mb-1">
              {group.name} Administration
            </h1>
            <p className="text-[var(--grey-600)]">
              Oversee recruitment across {brands.length} maison{brands.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="filled" className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {groupAccess.role && ROLE_LABELS[groupAccess.role]}
            </Badge>
          </div>
        </div>

        {/* Alerts */}
        {pendingGroupApprovalCount > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">
                {pendingGroupApprovalCount} team request{pendingGroupApprovalCount !== 1 ? 's' : ''} require{pendingGroupApprovalCount === 1 ? 's' : ''} your approval
              </p>
              <p className="text-sm text-amber-600">
                These requests need group-level authorization before the users can access their brands.
              </p>
            </div>
            <Link href="#pending">
              <Button variant="gold" size="sm">Review Now</Button>
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--gold-light)] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{brands.length}</p>
                <p className="text-small text-[var(--grey-600)]">Maisons</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{verifiedBrands}</p>
                <p className="text-small text-[var(--grey-600)]">Verified</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--warning-light)] flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{totalPendingCount}</p>
                <p className="text-small text-[var(--grey-600)]">Pending Requests</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--info-light)] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--info)]" />
              </div>
              <div>
                <p className="text-2xl font-display font-light">{groupTeam.length}</p>
                <p className="text-small text-[var(--grey-600)]">Group Admins</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Approvals */}
          <div className="lg:col-span-2" id="pending">
            <GroupPendingApprovals 
              groupId={groupAccess.groupId} 
              requiresGroupApproval={true}
            />

            {/* All Brands Overview */}
            <Card className="mt-6">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Maisons Overview
                </CardTitle>
                <Link href="/group/brands" className="text-small text-[var(--gold)] hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {brands.length > 0 ? (
                  <div className="space-y-3">
                    {brands.slice(0, 6).map(brand => (
                      <div
                        key={brand.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--grey-100)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="w-8 h-8 rounded object-contain bg-white"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-[var(--grey-200)] flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-[var(--grey-400)]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{brand.name}</p>
                            {brand.segment && (
                              <p className="text-xs text-[var(--grey-500)] capitalize">
                                {brand.segment.replace(/_/g, ' ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {brand.verified ? (
                            <Badge variant="success" size="sm">Verified</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Pending</Badge>
                          )}
                          {brand.requires_group_approval && (
                            <span title="Requires group approval">
                              <Shield className="w-4 h-4 text-[var(--grey-400)]" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {brands.length > 6 && (
                      <p className="text-center text-sm text-[var(--grey-500)] py-2">
                        +{brands.length - 6} more brands
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--grey-500)]">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No brands in this group</p>
                    <p className="text-small">Add brands to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Team */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Group Team
                </CardTitle>
                <Link href="/group/team" className="text-small text-[var(--gold)] hover:underline">
                  Manage
                </Link>
              </CardHeader>
              <CardContent>
                {groupTeam.length > 0 ? (
                  <div className="space-y-3">
                    {groupTeam.slice(0, 5).map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        {member.profiles.avatar_url ? (
                          <img
                            src={member.profiles.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--grey-200)] flex items-center justify-center">
                            <span className="text-xs font-medium text-[var(--grey-600)]">
                              {member.profiles.full_name?.[0] || '?'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.profiles.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-[var(--grey-500)]">
                            {ROLE_LABELS[member.role] || member.role}
                          </p>
                        </div>
                      </div>
                    ))}
                    {groupTeam.length > 5 && (
                      <Link href="/group/team" className="block text-center text-sm text-[var(--gold)] hover:underline py-2">
                        View all {groupTeam.length} members
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[var(--grey-500)]">
                    <p className="text-sm">No team members yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/group/brands/add" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[var(--gold)]" />
                      <span className="text-sm">Add Maison</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
                <Link href="/group/team/invite" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[var(--grey-600)]" />
                      <span className="text-sm">Invite Group Admin</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
                <Link href="/group/analytics" className="block">
                  <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] hover:bg-[var(--grey-100)] transition-colors">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-[var(--grey-600)]" />
                      <span className="text-sm">View Analytics</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--grey-400)]" />
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Group Info */}
            <Card className="bg-[var(--charcoal)] text-white">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-[var(--gold)]" />
                  <p className="font-semibold">{group.name}</p>
                </div>
                <p className="text-sm text-[var(--grey-400)] mb-4">
                  Luxury group with {group.maisons?.length || brands.length} maisons globally
                </p>
                {group.maisons && group.maisons.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {group.maisons.slice(0, 6).map(maison => (
                      <Badge key={maison} variant="filled" size="sm" className="bg-[var(--grey-700)] text-white">
                        {maison}
                      </Badge>
                    ))}
                    {group.maisons.length > 6 && (
                      <Badge variant="gold" size="sm">
                        +{group.maisons.length - 6}
                      </Badge>
                    )}
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