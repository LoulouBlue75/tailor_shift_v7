import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
})

export const metadata: Metadata = {
  title: {
    default: 'Tailor Shift — Luxury Retail Careers',
    template: '%s | Tailor Shift',
  },
  description:
    'The refined platform for luxury retail careers. Connect with premium maisons through intelligent matching and personalized development.',
  keywords: [
    'luxury retail',
    'recruitment',
    'careers',
    'fashion',
    'retail jobs',
    'boutique',
    'maison',
  ],
  authors: [{ name: 'Irbis Partners' }],
  creator: 'Tailor Shift',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.tailorshift.co',
    siteName: 'Tailor Shift',
    title: 'Tailor Shift — Luxury Retail Careers',
    description:
      'The refined platform for luxury retail careers. Connect with premium maisons through intelligent matching.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tailor Shift — Luxury Retail Careers',
    description:
      'The refined platform for luxury retail careers. Connect with premium maisons through intelligent matching.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
