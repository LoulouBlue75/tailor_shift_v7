import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border border-[var(--grey-200)] bg-transparent text-[var(--charcoal)]',
        filled:
          'bg-[var(--grey-100)] text-[var(--charcoal)]',
        gold:
          'bg-[var(--gold-light)] text-[var(--gold-dark)] border border-[var(--gold)]',
        success:
          'bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]',
        error:
          'bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]',
        warning:
          'bg-[var(--warning-light)] text-[var(--warning)] border border-[var(--warning)]',
        info:
          'bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]',
        // Role levels
        level:
          'bg-[var(--charcoal)] text-white',
        // Store tiers
        tier:
          'bg-[var(--ivory)] text-[var(--gold-dark)] border border-[var(--gold)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
