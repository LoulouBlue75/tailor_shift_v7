'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Settings, LogOut, User, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  initials?: string
  fullName?: string
  email?: string
  showName?: boolean
  variant?: 'default' | 'compact'
}

export function UserMenu({
  initials = '?',
  fullName,
  email,
  showName = false,
  variant = 'default',
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--grey-100)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--gold-light)] flex items-center justify-center text-sm font-medium text-[var(--gold-dark)]">
          {initials}
        </div>
        {showName && fullName && (
          <>
            <span className="text-sm font-medium text-[var(--charcoal)] hidden sm:block">
              {fullName}
            </span>
            <ChevronDown className={`w-4 h-4 text-[var(--grey-500)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-[var(--radius-md)] bg-white border border-[var(--grey-200)] shadow-lg z-50 overflow-hidden">
          {/* User Info Header */}
          {(fullName || email) && (
            <div className="px-4 py-3 border-b border-[var(--grey-200)] bg-[var(--grey-50)]">
              {fullName && (
                <p className="text-sm font-medium text-[var(--charcoal)] truncate">
                  {fullName}
                </p>
              )}
              {email && (
                <p className="text-xs text-[var(--grey-500)] truncate">
                  {email}
                </p>
              )}
            </div>
          )}

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/talent/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--grey-700)] hover:bg-[var(--grey-100)] transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--grey-700)] hover:bg-[var(--grey-100)] transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-[var(--grey-200)] py-1">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--error-light)] transition-colors w-full disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}