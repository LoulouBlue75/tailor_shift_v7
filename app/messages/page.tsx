import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardContent, Button, Input } from '@/components/ui'
import { 
  MessageCircle, Search, Send, ArrowLeft, 
  Building2, User, Clock, Check, CheckCheck
} from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Determine user type
  const { data: talent } = await supabase
    .from('talents')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!talent && !brand) redirect('/login')

  const userType = talent ? 'talent' : 'brand'
  const userId = talent?.id || brand?.id

  // Get conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      messages(
        id, content, created_at, sender_type, sender_id, read_at
      )
    `)
    .or(`talent_id.eq.${userId},brand_id.eq.${userId}`)
    .order('updated_at', { ascending: false })
    .limit(20)

  // Format conversations with last message
  const formattedConversations = (conversations || []).map(conv => {
    const messages = conv.messages || []
    const lastMessage = messages.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    
    const unreadCount = messages.filter((m: any) => 
      m.sender_type !== userType && !m.read_at
    ).length

    return {
      ...conv,
      lastMessage,
      unreadCount,
    }
  })

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={userType === 'talent' ? '/talent/dashboard' : '/brand/dashboard'}>
                <ArrowLeft className="w-5 h-5 text-[var(--grey-600)] hover:text-[var(--charcoal)]" />
              </Link>
              <Logo size="md" />
            </div>
            
            <h1 className="text-lg font-medium">Messages</h1>

            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Conversations List */}
          <div className="w-96 border-r border-[var(--grey-200)] bg-white flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-[var(--grey-200)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--grey-400)]" />
                <Input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {formattedConversations.length > 0 ? (
                formattedConversations.map((conv: any) => (
                  <Link 
                    key={conv.id} 
                    href={`/messages/${conv.id}`}
                    className="block"
                  >
                    <div className="flex items-start gap-3 p-4 border-b border-[var(--grey-100)] hover:bg-[var(--grey-100)] transition-colors cursor-pointer">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-[var(--charcoal)] flex items-center justify-center text-white shrink-0">
                        {userType === 'talent' ? (
                          <Building2 className="w-5 h-5" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">
                            {conv.title || 'New Conversation'}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-caption text-[var(--grey-500)] shrink-0 ml-2">
                              {formatTime(conv.lastMessage.created_at)}
                            </span>
                          )}
                        </div>
                        
                        {conv.lastMessage && (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-[var(--grey-600)] truncate flex-1">
                              {conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge variant="gold" size="sm">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-[var(--grey-300)] mb-4" />
                  <h3 className="font-medium mb-2">No messages yet</h3>
                  <p className="text-sm text-[var(--grey-600)]">
                    {userType === 'talent' 
                      ? 'Start applying to opportunities to connect with brands'
                      : 'Reach out to talents in your pipeline'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message View Placeholder */}
          <div className="flex-1 flex flex-col items-center justify-center bg-[var(--grey-100)]">
            <MessageCircle className="w-16 h-16 text-[var(--grey-300)] mb-4" />
            <h2 className="text-xl font-display mb-2">Select a conversation</h2>
            <p className="text-[var(--grey-600)]">Choose a conversation to view messages</p>
          </div>
        </div>
      </main>
    </div>
  )
}
