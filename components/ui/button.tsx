import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary - Filled black
        primary:
          'bg-[var(--charcoal)] text-white hover:bg-[var(--grey-800)] active:bg-[var(--grey-700)]',
        // Secondary - Outline
        secondary:
          'border border-[var(--grey-200)] bg-transparent text-[var(--charcoal)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)]',
        // Ghost - No border, subtle hover
        ghost:
          'bg-transparent text-[var(--charcoal)] hover:bg-[var(--grey-100)] active:bg-[var(--grey-200)]',
        // Text - Just text with hover underline
        text:
          'bg-transparent text-[var(--charcoal)] underline-offset-4 hover:underline',
        // Gold accent - Use sparingly
        gold:
          'bg-[var(--gold)] text-white hover:bg-[var(--gold-dark)] active:bg-[var(--gold-dark)]',
        // Gold outline
        goldOutline:
          'border border-[var(--gold)] bg-transparent text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white',
        // Destructive
        destructive:
          'bg-[var(--error)] text-white hover:bg-[var(--error)]/90 active:bg-[var(--error)]/80',
        // Destructive outline
        destructiveOutline:
          'border border-[var(--error)] bg-transparent text-[var(--error)] hover:bg-[var(--error)] hover:text-white',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8',
        iconLg: 'h-12 w-12',
      },
      rounded: {
        default: 'rounded-[var(--radius-md)]',
        sm: 'rounded-[var(--radius-sm)]',
        lg: 'rounded-[var(--radius-lg)]',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      rounded: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
