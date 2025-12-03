import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET'
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || 'NOT_SET',
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: {
        set: supabaseUrl !== 'NOT_SET',
        value: supabaseUrl,
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        set: anonKey !== 'NOT_SET',
        length: anonKey.length,
        prefix: anonKey.substring(0, 20),
        suffix: anonKey.substring(anonKey.length - 10),
      },
      NEXT_PUBLIC_APP_URL: {
        set: appUrl !== 'NOT_SET',
        value: appUrl,
      },
      NEXT_PUBLIC_SITE_URL: {
        set: siteUrl !== 'NOT_SET',
        value: siteUrl,
      },
    },
  })
}