import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { ArrowLeft, Settings, Database, Shield, Bell, Users, RefreshCw, Download, Upload } from 'lucide-react'

export default async function AdminSettingsPage() {
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
              <Link href="/admin/brands" className="text-sm text-white/70 hover:text-white">
                Brands
              </Link>
              <Link href="/admin/settings" className="text-sm font-medium text-white">
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Navigation */}
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-h1 mb-1">Admin Settings</h1>
          <p className="text-[var(--grey-600)]">
            Platform configuration and system settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Platform Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-[var(--grey-50)] rounded-[var(--radius-md)]">
                  <p className="text-2xl font-display text-[var(--charcoal)]">—</p>
                  <p className="text-sm text-[var(--grey-600)]">Total Users</p>
                </div>
                <div className="p-4 bg-[var(--grey-50)] rounded-[var(--radius-md)]">
                  <p className="text-2xl font-display text-[var(--charcoal)]">—</p>
                  <p className="text-sm text-[var(--grey-600)]">Active Matches</p>
                </div>
                <div className="p-4 bg-[var(--grey-50)] rounded-[var(--radius-md)]">
                  <p className="text-2xl font-display text-[var(--charcoal)]">—</p>
                  <p className="text-sm text-[var(--grey-600)]">Total Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matching Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Matching Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--grey-100)]">
                <div>
                  <p className="font-medium">Auto-Matching</p>
                  <p className="text-sm text-[var(--grey-600)]">Automatically generate matches when opportunities are posted</p>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--grey-100)]">
                <div>
                  <p className="font-medium">Minimum Match Score</p>
                  <p className="text-sm text-[var(--grey-600)]">Threshold for showing matches to talents</p>
                </div>
                <span className="font-medium">50%</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Dream Brand Boost</p>
                  <p className="text-sm text-[var(--grey-600)]">Extra points when talent has brand as preference</p>
                </div>
                <span className="font-medium">+15 pts</span>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--grey-100)]">
                <div>
                  <p className="font-medium">Dream Brand Alerts</p>
                  <p className="text-sm text-[var(--grey-600)]">Notify talents when dream brands post opportunities</p>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Email Digest Frequency</p>
                  <p className="text-sm text-[var(--grey-600)]">How often to send notification summaries</p>
                </div>
                <span className="font-medium">Daily</span>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--grey-100)]">
                <div>
                  <p className="font-medium">Talent Profile Privacy</p>
                  <p className="text-sm text-[var(--grey-600)]">Brands see anonymized stats until matched</p>
                </div>
                <Badge variant="success">Enforced</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--grey-100)]">
                <div>
                  <p className="font-medium">Compensation Confidentiality</p>
                  <p className="text-sm text-[var(--grey-600)]">Brands see alignment badges, not exact figures</p>
                </div>
                <Badge variant="success">Enforced</Badge>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Row Level Security</p>
                  <p className="text-sm text-[var(--grey-600)]">Database-level access controls</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[var(--grey-100)]">
                <div>
                  <p className="font-medium">Export All Data</p>
                  <p className="text-sm text-[var(--grey-600)]">Download complete platform data (JSON)</p>
                </div>
                <Button variant="secondary" size="sm" disabled>
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Import Brands</p>
                  <p className="text-sm text-[var(--grey-600)]">Bulk import brands from CSV</p>
                </div>
                <Button variant="secondary" size="sm" disabled>
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Version */}
        <div className="mt-8 text-center">
          <p className="text-small text-[var(--grey-500)]">
            Tailor Shift v7.0.0 • Admin Console • Made with 💎 for luxury retail
          </p>
        </div>
      </main>
    </div>
  )
}