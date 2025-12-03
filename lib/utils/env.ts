/**
 * Environment utilities for consistent URL handling across environments
 */

/**
 * Get the site URL based on environment variables
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL - Explicitly set site URL (works on both client and server)
 * 2. NEXT_PUBLIC_APP_URL - Alternative name for site URL (backwards compatibility)
 * 3. VERCEL_URL - Auto-set by Vercel for deployments (server-side only, needs https:// prefix)
 * 4. window.location.origin - For client-side fallback
 * 5. http://localhost:3000 - Default fallback for development
 *
 * Usage:
 * - Set NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL in your .env for production
 * - For Vercel deployments, the VERCEL_URL is automatically available
 * - For local development, defaults to localhost:3000
 */
export function getSiteUrl(): string {
  // Check for explicit site URL (available on both client and server)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // Check for alternative app URL (backwards compatibility)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Check for Vercel URL (server-side only, auto-set by Vercel)
  // Note: VERCEL_URL doesn't include the protocol
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Client-side fallback - use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Default fallback for development
  return 'http://localhost:3000'
}

/**
 * Build a full URL path using the site URL
 * 
 * @param path - The path to append (should start with /)
 * @returns Full URL with the site base URL
 */
export function buildUrl(path: string): string {
  const baseUrl = getSiteUrl()
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}