import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'short'
  asLink?: boolean
}

export function Logo({
  className,
  size = 'md',
  variant = 'full',
  asLink = true,
}: LogoProps) {
  const sizeStyles = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const content = (
    <span
      className={cn(
        'font-display font-light tracking-wide text-[var(--charcoal)]',
        sizeStyles[size],
        className
      )}
    >
      {variant === 'full' ? 'Tailor Shift' : 'TS'}
    </span>
  )

  if (asLink) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
