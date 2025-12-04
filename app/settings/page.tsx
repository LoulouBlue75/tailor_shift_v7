import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/components/ui'
import { 
  Settings, User, Bell, Shield, Globe, Palette, 
  ArrowLeft, ChevronRight, Moon, Sun, LogOut, Trash2
} from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
]

const NOTIFICATION_SETTINGS = [
  { id: 'new_matches', label: 'New opportunity matches', description: 'When new opportunities match your profile' },
  { id: 'messages', label: 'Messages', description: 'When you receive a new message' },
  { id: 'endorsements', label: 'Endorsements', description: 'When someone endorses your skills' },
  { id: 'pipeline_updates', label: 'Pipeline updates', description: 'Status changes in your applications' },
  { id: 'marketing', label: 'Marketing & tips', description: 'Career tips and platform updates' },
]

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile and settings
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Determine user type for back navigation
  const { data: talent } = await supabase
    .from('talents')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  const userType = talent ? 'talent' : 'brand'
  const dashboardPath = userType === 'talent' ? '/talent/dashboard' : '/brand/dashboard'

  const currentLanguage = profile?.preferred_language || 'en'
  const notificationPrefs = profile?.notification_preferences || {}

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={dashboardPath}>
                <ArrowLeft className="w-5 h-5 text-[var(--grey-600)] hover:text-[var(--charcoal)]" />
              </Link>
              <Logo size="md" />
            </div>
            
            <h1 className="text-lg font-medium">Settings</h1>

            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--grey-100)]">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-[var(--grey-600)]">{user.email}</p>
              </div>
              <Badge variant="success" size="sm">Verified</Badge>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-[var(--grey-100)]">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-[var(--grey-600)]">Last changed 30 days ago</p>
              </div>
              <Button variant="ghost" size="sm">Change</Button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-[var(--grey-600)]">Add extra security to your account</p>
              </div>
              <Button variant="ghost" size="sm">Enable</Button>
            </div>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language & Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`p-3 rounded-[var(--radius-md)] border text-left transition-colors ${
                    currentLanguage === lang.code 
                      ? 'border-[var(--gold)] bg-[var(--gold-light)]' 
                      : 'border-[var(--grey-200)] hover:border-[var(--grey-300)]'
                  }`}
                >
                  <span className="text-xl mb-1 block">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {NOTIFICATION_SETTINGS.map(setting => (
                <div key={setting.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-small text-[var(--grey-600)]">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      defaultChecked={notificationPrefs[setting.id] !== false}
                    />
                    <div className="w-11 h-6 bg-[var(--grey-300)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--gold)]"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <button className="flex-1 p-4 rounded-[var(--radius-md)] border-2 border-[var(--gold)] bg-white text-center">
                <Sun className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button className="flex-1 p-4 rounded-[var(--radius-md)] border border-[var(--grey-200)] bg-[var(--charcoal)] text-white text-center">
                <Moon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button className="flex-1 p-4 rounded-[var(--radius-md)] border border-[var(--grey-200)] bg-gradient-to-r from-white to-[var(--charcoal)] text-center">
                <Settings className="w-6 h-6 mx-auto mb-2 text-[var(--grey-600)]" />
                <span className="text-sm font-medium text-[var(--grey-600)]">System</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Profile visibility</p>
                <p className="text-small text-[var(--grey-600)]">Who can see your profile</p>
              </div>
              <select className="px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--grey-200)] text-sm">
                <option>All brands</option>
                <option>Matched brands only</option>
                <option>Hidden</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Show current employer</p>
                <p className="text-small text-[var(--grey-600)]">Display your current workplace</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-[var(--grey-300)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--gold)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Data export</p>
                <p className="text-small text-[var(--grey-600)]">Download all your data</p>
              </div>
              <Button variant="ghost" size="sm">Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Sign out</p>
                <p className="text-small text-[var(--grey-600)]">Sign out of this device</p>
              </div>
              <form action="/auth/signout" method="POST">
                <Button variant="secondary" size="sm" type="submit">
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-[var(--error)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--error)]">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm text-[var(--error)]">Delete account</p>
                <p className="text-small text-[var(--grey-600)]">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Version */}
        <div className="mt-8 text-center">
          <p className="text-small text-[var(--grey-500)]">
            Tailor Shift v7.0.0 • Made with 💎 for luxury retail
          </p>
        </div>
      </main>
    </div>
  )
}
