'use client'

import { AlertTriangle, Clock, XCircle, Users, RefreshCw } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

export type ValidationBannerType = 
  | 'talent_pending'
  | 'talent_rejected'
  | 'brand_pending'
  | 'brand_rejected'
  | 'team_request_pending'
  | 'team_request_rejected'

interface PendingValidationBannerProps {
  type: ValidationBannerType
  message?: string
  brandName?: string
  rejectionReason?: string
  onResubmit?: () => void
  editProfilePath?: string
}

const BANNER_CONFIG: Record<ValidationBannerType, {
  icon: typeof AlertTriangle
  title: string
  defaultMessage: string
  variant: 'warning' | 'error' | 'info'
  showAction: boolean
  actionLabel?: string
}> = {
  talent_pending: {
    icon: Clock,
    title: 'Profile Under Review',
    defaultMessage: "Your profile is being reviewed by our team. We'll notify you within 48 hours.",
    variant: 'warning',
    showAction: false
  },
  talent_rejected: {
    icon: XCircle,
    title: 'Profile Needs Adjustments',
    defaultMessage: 'Please update your profile based on the feedback provided.',
    variant: 'error',
    showAction: true,
    actionLabel: 'Edit & Resubmit'
  },
  brand_pending: {
    icon: Clock,
    title: 'Account Verification Pending',
    defaultMessage: 'Your brand account is being verified. This usually takes 24-48 hours.',
    variant: 'warning',
    showAction: false
  },
  brand_rejected: {
    icon: XCircle,
    title: 'Verification Failed',
    defaultMessage: 'Your brand verification was not successful. Please contact support.',
    variant: 'error',
    showAction: true,
    actionLabel: 'Contact Support'
  },
  team_request_pending: {
    icon: Users,
    title: 'Team Access Pending',
    defaultMessage: 'Your request to join the team is pending approval from the account administrator.',
    variant: 'info',
    showAction: false
  },
  team_request_rejected: {
    icon: XCircle,
    title: 'Team Request Declined',
    defaultMessage: 'Your request to join the team was not approved.',
    variant: 'error',
    showAction: true,
    actionLabel: 'Request Again'
  }
}

const VARIANT_STYLES = {
  warning: {
    container: 'bg-[var(--warning-light)] border-[var(--warning)]',
    icon: 'text-[var(--warning)]',
    title: 'text-[var(--warning-dark)]',
    text: 'text-[var(--warning-dark)]/80'
  },
  error: {
    container: 'bg-[var(--error-light)] border-[var(--error)]',
    icon: 'text-[var(--error)]',
    title: 'text-[var(--error-dark)]',
    text: 'text-[var(--error-dark)]/80'
  },
  info: {
    container: 'bg-[var(--info-light)] border-[var(--info)]',
    icon: 'text-[var(--info)]',
    title: 'text-[var(--info-dark)]',
    text: 'text-[var(--info-dark)]/80'
  }
}

export function PendingValidationBanner({
  type,
  message,
  brandName,
  rejectionReason,
  onResubmit,
  editProfilePath
}: PendingValidationBannerProps) {
  const config = BANNER_CONFIG[type]
  const styles = VARIANT_STYLES[config.variant]
  const Icon = config.icon

  // Customize message for team request types
  let displayMessage = message || config.defaultMessage
  if (type === 'team_request_pending' && brandName) {
    displayMessage = `Your request to join ${brandName} is pending approval from the account administrator.`
  }
  if (type === 'team_request_rejected' && brandName) {
    displayMessage = `Your request to join ${brandName} was not approved.`
  }

  const handleAction = () => {
    if (onResubmit) {
      onResubmit()
    }
  }

  return (
    <div className={`mb-6 p-4 rounded-[var(--radius-lg)] border-l-4 ${styles.container}`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${styles.title}`}>
            {config.title}
          </h3>
          <p className={`mt-1 text-sm ${styles.text}`}>
            {displayMessage}
          </p>
          
          {rejectionReason && (
            <div className="mt-2 p-2 bg-white/50 rounded-[var(--radius-md)]">
              <p className={`text-sm font-medium ${styles.title}`}>Reason:</p>
              <p className={`text-sm ${styles.text}`}>{rejectionReason}</p>
            </div>
          )}

          {/* Restricted features notice */}
          {type.includes('pending') && (
            <p className={`mt-2 text-xs ${styles.text}`}>
              Some features are restricted until your account is verified.
            </p>
          )}
        </div>

        {config.showAction && (
          <div className="flex-shrink-0">
            {editProfilePath ? (
              <Link href={editProfilePath}>
                <Button size="sm" variant="secondary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {config.actionLabel}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="secondary" onClick={handleAction}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {config.actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to determine banner type from status
export function getBannerTypeFromStatus(
  userType: 'talent' | 'brand',
  status: string,
  hasTeamRequest?: boolean,
  teamRequestStatus?: string
): ValidationBannerType | null {
  // Check team request first (for brand users)
  if (hasTeamRequest && teamRequestStatus) {
    if (teamRequestStatus === 'pending') return 'team_request_pending'
    if (teamRequestStatus === 'rejected') return 'team_request_rejected'
  }

  // Check user-specific status
  if (userType === 'talent') {
    if (status === 'pending_review') return 'talent_pending'
    if (status === 'rejected') return 'talent_rejected'
  }

  if (userType === 'brand') {
    if (status === 'pending_verification' || status === 'onboarding') return 'brand_pending'
    if (status === 'rejected') return 'brand_rejected'
  }

  return null
}