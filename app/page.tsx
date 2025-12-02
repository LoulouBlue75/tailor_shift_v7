import Link from 'next/link'
import { Button, Logo } from '@/components/ui'
import { Sparkles, Shield, Target, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[var(--grey-100)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo variant="icon" size="lg" />
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/signup?type=talent" className="text-[15px] tracking-wide text-[var(--grey-600)] hover:text-[var(--charcoal)] transition-colors">
              Professionals
            </Link>
            <Link href="/signup?type=brand" className="text-[15px] tracking-wide text-[var(--grey-600)] hover:text-[var(--charcoal)] transition-colors">
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
      <section className="pt-28 pb-20 px-6 min-h-[85vh] flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Logo */}
          <div className="mb-10 flex justify-center">
            <Logo variant="full" size="hero" asLink={false} />
          </div>

          <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-display font-light leading-[1.08] tracking-[-0.02em] mb-6 text-[var(--charcoal)]">
            Where luxury meets opportunity
          </h1>
          <p className="text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-[var(--grey-600)] mb-12 max-w-2xl mx-auto">
            The refined platform for luxury retail careers. Connect with premium maisons through intelligent matching.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup?type=talent">
              <Button variant="secondary" size="lg" className="text-[15px] tracking-[0.03em] px-8">
                I&apos;m a Professional
              </Button>
            </Link>
            <Link href="/signup?type=brand">
              <Button variant="secondary" size="lg" className="text-[15px] tracking-[0.03em] px-8">
                I&apos;m a Brand
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-6 bg-[var(--ivory)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-display font-light tracking-[-0.01em] text-center mb-16 text-[var(--charcoal)]">
            Why Tailor Shift
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white border border-[var(--grey-200)] flex items-center justify-center mx-auto mb-6">
                <Target className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="text-[1.375rem] font-display font-normal mb-3 text-[var(--charcoal)]">
                Intelligent Matching
              </h3>
              <p className="text-[0.9375rem] leading-relaxed text-[var(--grey-600)]">
                Our 8-dimension algorithm matches you with opportunities that truly fit your expertise and aspirations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white border border-[var(--grey-200)] flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="text-[1.375rem] font-display font-normal mb-3 text-[var(--charcoal)]">
                Confidential
              </h3>
              <p className="text-[0.9375rem] leading-relaxed text-[var(--grey-600)]">
                Your data stays private. No public profiles, no unsolicited contact. You control who sees your information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white border border-[var(--grey-200)] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="text-[1.375rem] font-display font-normal mb-3 text-[var(--charcoal)]">
                Luxury Focused
              </h3>
              <p className="text-[0.9375rem] leading-relaxed text-[var(--grey-600)]">
                Built exclusively for luxury retail. We understand the nuances of maisons, boutiques, and client excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-display font-light tracking-[-0.01em] text-center mb-16 text-[var(--charcoal)]">
            How it works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-10">
            {[
              { step: '01', title: 'Create Profile', desc: 'Tell us about your experience and career goals' },
              { step: '02', title: 'Complete Assessment', desc: 'Understand your strengths across 6 dimensions' },
              { step: '03', title: 'Get Matched', desc: 'Receive curated opportunities that fit your profile' },
              { step: '04', title: 'Connect', desc: 'Express interest and start conversations' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-[2.5rem] font-display font-light text-[var(--gold)] mb-4 block tracking-tight">
                  {item.step}
                </span>
                <h3 className="text-[1.125rem] font-medium mb-2 text-[var(--charcoal)]">{item.title}</h3>
                <p className="text-[0.875rem] leading-relaxed text-[var(--grey-600)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--ivory)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-display font-light tracking-[-0.01em] mb-6 text-[var(--charcoal)]">
            Ready to start?
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-[var(--grey-600)] mb-10">
            Join the platform that connects exceptional talent with exceptional brands.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-[15px] tracking-[0.03em] px-8">
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
            <div className="flex items-center gap-3">
              <Logo variant="full" size="sm" asLink={false} />
              <span className="text-[0.8125rem] text-[var(--grey-500)]">
                An Irbis Partners company
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-[0.8125rem] text-[var(--grey-600)]">
              <Link href="/terms" className="hover:text-[var(--charcoal)] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[var(--charcoal)] transition-colors">Privacy</Link>
            </div>
            
            <p className="text-[0.8125rem] text-[var(--grey-500)]">
              © {new Date().getFullYear()} Tailor Shift. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
