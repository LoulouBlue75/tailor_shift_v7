'use client'

import React from 'react'
import { Lock } from 'lucide-react'
import { Button } from './button'

interface RestrictedFeatureGateProps {
  /** The status required to access this feature */
  requiredStatus: 'approved' | 'active' | 'verified'
  /** The user's current account status */
  currentStatus: string
  /** Content to render when access is granted */
  children: React.ReactNode
  /** Content to render when access is denied (optional) */
  fallback?: React.ReactNode
  /** Show a default "locked" message if no fallback provided */
  showDefaultFallback?: boolean
  /** Optional message to display in default fallback */
  lockedMessage?: string
}

// Status values that grant access for each required level
const STATUS_ACCESS_MAP: Record<string, string[]> = {
  approved: ['approved', 'active', 'verified'],
  active: ['active', 'verified'],
  verified: ['verified']
}

/**
 * RestrictedFeatureGate - Conditionally renders content based on account validation status
 * 
 * Usage:
 * <RestrictedFeatureGate 
 *   requiredStatus="approved" 
 *   currentStatus={talent.status}
 *   fallback={<Button disabled>Complete validation to apply</Button>}
 * >
 *   <Button onClick={handleApply}>Express Interest</Button>
 * </RestrictedFeatureGate>
 */
export function RestrictedFeatureGate({
  requiredStatus,
  currentStatus,
  children,
  fallback,
  showDefaultFallback = true,
  lockedMessage = 'This feature is available after account verification'
}: RestrictedFeatureGateProps) {
  const normalizedStatus = currentStatus?.toLowerCase() || ''
  const allowedStatuses = STATUS_ACCESS_MAP[requiredStatus] || []
  const hasAccess = allowedStatuses.includes(normalizedStatus)

  if (hasAccess) {
    return <>{children}</>
  }

  // Return custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Return default locked fallback
  if (showDefaultFallback) {
    return (
      <div className="flex items-center gap-2 p-3 bg-[var(--grey-100)] rounded-[var(--radius-md)] text-[var(--grey-500)]">
        <Lock className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{lockedMessage}</span>
      </div>
    )
  }

  // Return nothing if no fallback and showDefaultFallback is false
  return null
}

/**
 * Helper hook for checking multiple features at once
 */
export function useAccountAccess(currentStatus: string) {
  const normalizedStatus = currentStatus?.toLowerCase() || ''
  
  return {
    isApproved: STATUS_ACCESS_MAP.approved.includes(normalizedStatus),
    isActive: STATUS_ACCESS_MAP.active.includes(normalizedStatus),
    isVerified: STATUS_ACCESS_MAP.verified.includes(normalizedStatus),
    isPending: ['pending', 'pending_review', 'pending_verification', 'onboarding'].includes(normalizedStatus),
    isRejected: normalizedStatus === 'rejected',
    isSuspended: normalizedStatus === 'suspended',
    status: normalizedStatus
  }
}

/**
 * RestrictedButton - A button that shows locked state when user doesn't have access
 */
interface RestrictedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  requiredStatus: 'approved' | 'active' | 'verified'
  currentStatus: string
  lockedMessage?: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function RestrictedButton({
  requiredStatus,
  currentStatus,
  lockedMessage = 'Account verification required',
  children,
  variant = 'primary',
  size = 'md',
  ...props
}: RestrictedButtonProps) {
  const normalizedStatus = currentStatus?.toLowerCase() || ''
  const allowedStatuses = STATUS_ACCESS_MAP[requiredStatus] || []
  const hasAccess = allowedStatuses.includes(normalizedStatus)

  if (!hasAccess) {
    return (
      <Button 
        variant="ghost" 
        size={size} 
        disabled 
        className="opacity-50 cursor-not-allowed"
        title={lockedMessage}
      >
        <Lock className="w-4 h-4 mr-2" />
        {children}
      </Button>
    )
  }

  return (
    <Button variant={variant} size={size} {...props}>
      {children}
    </Button>
  )
}

/**
 * RestrictedLink - A link that shows locked state when user doesn't have access
 */
interface RestrictedLinkProps {
  requiredStatus: 'approved' | 'active' | 'verified'
  currentStatus: string
  href: string
  lockedMessage?: string
  children: React.ReactNode
  className?: string
}

export function RestrictedLink({
  requiredStatus,
  currentStatus,
  href,
  lockedMessage = 'Account verification required',
  children,
  className = ''
}: RestrictedLinkProps) {
  const normalizedStatus = currentStatus?.toLowerCase() || ''
  const allowedStatuses = STATUS_ACCESS_MAP[requiredStatus] || []
  const hasAccess = allowedStatuses.includes(normalizedStatus)

  if (!hasAccess) {
    return (
      <span 
        className={`inline-flex items-center gap-2 text-[var(--grey-400)] cursor-not-allowed ${className}`}
        title={lockedMessage}
      >
        <Lock className="w-3 h-3" />
        {children}
      </span>
    )
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}