import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button, Input } from '@/components/ui'
import { ArrowLeft, Search, Filter, MoreHorizontal, Eye, Building2, MapPin, Settings } from 'lucide-react'

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: { q?: string; segment?: string }
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
    .from('brands')
    .select(`
      *,
      profile:profiles(email)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (searchParams.segment) {
    query = query.eq('segment', searchParams.segment)
  }

  const { data: brands, count } = await query

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
              <Link href="/admin/talents" className="text-sm text-white/70 hover:text-white">
                All Talents
              </Link>
              <Link href="/admin/brands" className="text-sm font-medium text-white">
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
            <h1 className="text-h1 mb-1">Brands</h1>
            <p className="text-[var(--grey-600)]">
              Manage {count || 0} registered brands
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin/brands/invite">
              <Button>
                Invite Brand
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
                    placeholder="Search by name..." 
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--grey-500)]" />
                <select 
                  className="h-10 px-3 rounded-[var(--radius-md)] border border-[var(--grey-300)] bg-white text-sm"
                >
                  <option value="">All Segments</option>
                  <option value="ultra_luxury">Ultra Luxury</option>
                  <option value="luxury">Luxury</option>
                  <option value="premium">Premium</option>
                  <option value="accessible_luxury">Accessible Luxury</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brands List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--grey-50)] border-b border-[var(--grey-200)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Segment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--grey-500)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[var(--grey-100)]">
                {brands?.map((brand) => (
                  <tr key={brand.id} className="hover:bg-[var(--grey-50)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--grey-100)] flex items-center justify-center text-[var(--charcoal)]">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-[var(--charcoal)]">
                            {brand.name}
                          </div>
                          {brand.verified && (
                            <Badge variant="success" size="sm" className="mt-1">Verified</Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default">
                        {brand.segment?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--grey-600)]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {brand.headquarters_location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--grey-600)]">
                      <div>{brand.contact_name}</div>
                      <div className="text-[var(--grey-500)] text-xs">{brand.contact_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/brands/${brand.id}`}>
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
                
                {(!brands || brands.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--grey-500)]">
                      No brands found.
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