import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  variant?: 'icon' | 'full'
  asLink?: boolean
}

export function Logo({
  className,
  size = 'md',
  variant = 'icon',
  asLink = true,
}: LogoProps) {
  // Icon (pictogram) sizes - optimized for header placement
  const iconSizes = {
    sm: { width: 28, height: 28 },
    md: { width: 36, height: 36 },
    lg: { width: 44, height: 44 },
    xl: { width: 52, height: 52 },
    hero: { width: 64, height: 64 },
  }

  // Full logo sizes (aspect ratio 1365:768 ≈ 1.78:1)
  const fullSizes = {
    sm: { width: 100, height: 56 },
    md: { width: 140, height: 79 },
    lg: { width: 180, height: 101 },
    xl: { width: 240, height: 135 },
    hero: { width: 320, height: 180 },
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
