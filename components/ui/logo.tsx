import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'full'
  asLink?: boolean
}

export function Logo({
  className,
  size = 'md',
  variant = 'icon',
  asLink = true,
}: LogoProps) {
  // Icon (pictogram) sizes
  const iconSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 40, height: 40 },
  }

  // Full logo sizes (maintaining aspect ratio 1365:768 ≈ 1.78:1)
  const fullSizes = {
    sm: { width: 120, height: 68 },
    md: { width: 160, height: 90 },
    lg: { width: 200, height: 113 },
  }

  const dimensions = variant === 'icon' ? iconSizes[size] : fullSizes[size]
  const src = variant === 'icon' ? '/logo-icon.svg' : '/logo-full.svg'
  const alt = variant === 'icon' ? 'Tailor Shift' : 'Tailor Shift Logo'

  const content = (
    <Image
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={cn('object-contain', className)}
      priority
    />
  )

  if (asLink) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
