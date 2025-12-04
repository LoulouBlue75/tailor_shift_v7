import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button, Input } from '@/components/ui'
import { ArrowLeft, Search, Filter, MoreHorizontal, Eye, CheckCircle, XCircle, Settings } from 'lucide-react'

export default async function AdminAllTalentsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; role?: string }
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    redirect('/login')
  }

  // Build query
  let query = supabase
    .from('talents')
    .select(`
      *,
      profile:profiles(email, created_at)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.role) {
    query = query.eq('current_role_level', searchParams.role)
  }

  // Note: Search would require a different approach or client-side filtering for simple implementation
  // or a text search index on Supabase. For now, we'll skip complex text search.

  const { data: talents, count } = await query

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
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-h1 mb-1">All Talents</h1>
            <p className="text-[var(--grey-600)]">
              Manage {count || 0} registered talents
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin/talents/invite">
              <Button>
                Invite Talent
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--grey-400)]" />
                  <Input 
                    placeholder="Search by name or email..." 
                    className="pl-9"
                    // defaultValue={searchParams.q}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--grey-500)]" />
                <select 
                  className="h-10 px-3 rounded-[var(--radius-md)] border border-[var(--grey-300)] bg-white text-sm"
                  // defaultValue={searchParams.status}
                >
                  <option value="">All Statuses</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
                
                <select 
                  className="h-10 px-3 rounded-[var(--radius-md)] border border-[var(--grey-300)] bg-white text-sm"
                  // defaultValue={searchParams.role}
                >
                  <option value="">All Roles</option>
                  <option value="L1">Sales Associate</option>
                  <option value="L2">Senior Sales</option>
                  <option value="L3">Team Lead</option>
                  <option value="L4">Assistant Manager</option>
                  <option value="L5">Store Manager</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Talents List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--grey-50)] border-b border-[var(--grey-200)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Talent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Role & Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[var(--grey-100)]">
                {talents?.map((talent) => (
                  <tr key={talent.id} className="hover:bg-[var(--grey-50)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white text-sm">
                          {talent.first_name?.[0]}{talent.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--charcoal)]">
                            {talent.first_name} {talent.last_name}
                          </div>
                          <div className="text-sm text-[var(--grey-500)]">
                            {talent.profile?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--charcoal)]">{talent.current_role_level || 'N/A'}</div>
                      <div className="text-sm text-[var(--grey-500)]">{talent.current_location || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          talent.status === 'approved' ? 'success' :
                          talent.status === 'pending_review' ? 'warning' :
                          talent.status === 'rejected' ? 'error' :
                          'default'
                        }
                      >
                        {talent.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--grey-500)]">
                      {new Date(talent.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/talents/${talent.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {(!talents || talents.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--grey-500)]">
                      No talents found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}