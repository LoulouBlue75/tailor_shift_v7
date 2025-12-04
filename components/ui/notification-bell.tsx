'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Users, Building2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  data: Record<string, any>
  read_at: string | null
  created_at: string
}

interface NotificationBellProps {
  userId: string
  variant?: 'light' | 'dark'
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  team_request_received: <Users className="w-4 h-4 text-blue-500" />,
  team_request_approved: <CheckCircle className="w-4 h-4 text-green-500" />,
  team_request_rejected: <XCircle className="w-4 h-4 text-red-500" />,
  team_member_joined: <Users className="w-4 h-4 text-green-500" />,
  group_approval_required: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  default: <Bell className="w-4 h-4 text-slate-400" />
}

export function NotificationBell({ userId, variant = 'light' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Initial fetch for unread count
  useEffect(() => {
    fetchUnreadCount()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count')
      if (response.ok) {
        const { count } = await response.json()
        setUnreadCount(count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      })
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      })
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  const getNotificationLink = (notification: Notification): string | null => {
    switch (notification.type) {
      case 'team_request_received':
        return notification.data.brand_id ? `/brand/team?highlight=${notification.data.request_id}` : null
      case 'team_request_approved':
      case 'team_request_rejected':
        return notification.data.brand_id ? `/brand/dashboard` : null
      case 'group_approval_required':
        return `/group/dashboard#pending`
      default:
        return null
    }
  }

  const baseButtonClass = variant === 'dark'
    ? 'text-[var(--grey-400)] hover:text-white hover:bg-[var(--grey-700)]'
    : 'text-[var(--grey-600)] hover:text-[var(--charcoal)] hover:bg-[var(--grey-100)]'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full relative transition-colors ${baseButtonClass}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--gold)] text-[var(--charcoal)] text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[var(--grey-200)] overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--grey-200)]">
            <h3 className="font-semibold text-[var(--charcoal)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[var(--gold)] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[var(--grey-500)]">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => {
                const link = getNotificationLink(notification)
                const isUnread = !notification.read_at
                const icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default
                
                const content = (
                  <div
                    className={`p-4 border-b border-[var(--grey-100)] hover:bg-[var(--grey-50)] transition-colors cursor-pointer ${
                      isUnread ? 'bg-[var(--gold-light)]/20' : ''
                    }`}
                    onClick={() => {
                      if (isUnread) markAsRead(notification.id)
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${isUnread ? 'font-semibold' : ''} text-[var(--charcoal)]`}>
                            {notification.title}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[var(--gold)] flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        {notification.body && (
                          <p className="text-xs text-[var(--grey-600)] mt-0.5 line-clamp-2">
                            {notification.body}
                          </p>
                        )}
                        <p className="text-xs text-[var(--grey-400)] mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
                
                if (link) {
                  return (
                    <Link key={notification.id} href={link} onClick={() => setIsOpen(false)}>
                      {content}
                    </Link>
                  )
                }
                
                return <div key={notification.id}>{content}</div>
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-[var(--grey-200)] bg-[var(--grey-50)]">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-center text-[var(--gold)] hover:underline block"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}