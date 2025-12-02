import Link from 'next/link'
import { Button, Logo } from '@/components/ui'
import { Sparkles, Shield, Target, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[var(--grey-100)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/professionals" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)] transition-colors">
              Professionals
            </Link>
            <Link href="/brands" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)] transition-colors">
              Brands
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="text" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display mb-6">
            Where luxury meets opportunity
          </h1>
          <p className="text-xl text-[var(--grey-600)] mb-12 max-w-2xl mx-auto">
            The refined platform for luxury retail careers. Connect with premium maisons through intelligent matching.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup?type=talent">
              <Button variant="secondary" size="lg">
                I&apos;m a Professional
              </Button>
            </Link>
            <Link href="/signup?type=brand">
              <Button variant="secondary" size="lg">
                I&apos;m a Brand
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-6 bg-[var(--ivory)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-h2 text-center mb-16">Why Tailor Shift</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-white border border-[var(--grey-200)] flex items-center justify-center mx-auto mb-6">
                <Target className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="text-h3 mb-3">Intelligent Matching</h3>
              <p className="text-[var(--grey-600)]">
                Our 8-dimension algorithm matches you with opportunities that truly fit your expertise and aspirations.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-white border border-[var(--grey-200)] flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="text-h3 mb-3">Confidential</h3>
              <p className="text-[var(--grey-600)]">
                Your data stays private. No public profiles, no unsolicited contact. You control who sees your information.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-white border border-[var(--grey-200)] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="text-h3 mb-3">Luxury Focused</h3>
              <p className="text-[var(--grey-600)]">
                Built exclusively for luxury retail. We understand the nuances of maisons, boutiques, and client excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-h2 text-center mb-16">How it works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Create Profile', desc: 'Tell us about your experience and career goals' },
              { step: '02', title: 'Complete Assessment', desc: 'Understand your strengths across 6 dimensions' },
              { step: '03', title: 'Get Matched', desc: 'Receive curated opportunities that fit your profile' },
              { step: '04', title: 'Connect', desc: 'Express interest and start conversations' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-4xl font-display font-light text-[var(--gold)] mb-4 block">
                  {item.step}
                </span>
                <h3 className="text-h3 mb-2">{item.title}</h3>
                <p className="text-small text-[var(--grey-600)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--ivory)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h2 mb-6">Ready to start?</h2>
          <p className="text-[var(--grey-600)] mb-8">
            Join the platform that connects exceptional talent with exceptional brands.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Create Your Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--grey-200)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo size="sm" asLink={false} />
              <span className="text-small text-[var(--grey-500)]">
                An Irbis Partners company
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-small text-[var(--grey-600)]">
              <Link href="/terms" className="hover:text-[var(--charcoal)]">Terms</Link>
              <Link href="/privacy" className="hover:text-[var(--charcoal)]">Privacy</Link>
            </div>
            
            <p className="text-small text-[var(--grey-500)]">
              © {new Date().getFullYear()} Tailor Shift. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
