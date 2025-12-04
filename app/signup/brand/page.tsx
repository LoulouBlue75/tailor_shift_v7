'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Logo, Card } from '@/components/ui'
import { 
  Building2, Users, Briefcase, BarChart3, Check, 
  AlertCircle, Loader2, ArrowRight, ChevronLeft 
} from 'lucide-react'
import Link from 'next/link'

// Department options with default roles
const DEPARTMENTS = [
  { 
    id: 'direction', 
    name: 'Direction', 
    description: 'C-level, Brand Directors',
    icon: Building2,
    defaultRole: 'admin_global',
    color: 'bg-purple-100 text-purple-700'
  },
  { 
    id: 'hr', 
    name: 'HR / Talent Acquisition', 
    description: 'Human Resources, Recruiting',
    icon: Users,
    defaultRole: 'hr_global',
    color: 'bg-blue-100 text-blue-700'
  },
  { 
    id: 'operations', 
    name: 'Operations', 
    description: 'Retail Operations, Area Managers',
    icon: Briefcase,
    defaultRole: 'recruiter',
    color: 'bg-green-100 text-green-700'
  },
  { 
    id: 'business', 
    name: 'Business', 
    description: 'Commercial, Merchandising',
    icon: BarChart3,
    defaultRole: 'viewer',
    color: 'bg-orange-100 text-orange-700'
  },
]

interface ExistingBrand {
  id: string
  name: string
  logo_url: string | null
  segment: string | null
}

interface DomainCheckResult {
  email_valid: boolean
  domain: string
  existing_brand: ExistingBrand | null
  domain_trusted: boolean
  requires_manual_review: boolean
}

export default function BrandSignupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<'email' | 'department' | 'choice' | 'team_request' | 'signup'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  
  // Domain check result
  const [domainCheck, setDomainCheck] = useState<DomainCheckResult | null>(null)
  const [userChoice, setUserChoice] = useState<'join' | 'create' | null>(null)
  
  // Check domain when email is entered
  const checkDomain = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Extract domain from email
      const domain = email.split('@')[1].toLowerCase()
      
      // Check if domain matches any existing brand
      // First check contact_email domain in brands table
      const { data: brands } = await supabase
        .from('brands')
        .select('id, name, logo_url, segment, contact_email')
      
      // Find brand with matching domain
      let existingBrand: ExistingBrand | null = null
      for (const brand of brands || []) {
        if (brand.contact_email) {
          const brandDomain = brand.contact_email.split('@')[1]?.toLowerCase()
          if (brandDomain === domain) {
            existingBrand = {
              id: brand.id,
              name: brand.name,
              logo_url: brand.logo_url,
              segment: brand.segment
            }
            break
          }
        }
      }
      
      // Check if this is a known luxury brand domain
      const luxuryDomains = [
        'lvmh.com', 'louisvuitton.com', 'dior.com', 'fendi.com', 'loewe.com',
        'kering.com', 'gucci.com', 'saintlaurent.com', 'balenciaga.com',
        'hermes.com', 'chanel.com', 'prada.com', 'cartier.com', 'rolex.com'
      ]
      const domainTrusted = luxuryDomains.includes(domain)
      
      // Corporate domains require manual review
      const publicDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
      const requiresReview = !domainTrusted && !publicDomains.includes(domain)
      
      setDomainCheck({
        email_valid: true,
        domain,
        existing_brand: existingBrand,
        domain_trusted: domainTrusted,
        requires_manual_review: requiresReview
      })
      
      // Move to next step
      if (existingBrand) {
        setStep('choice')
      } else {
        setStep('department')
      }
    } catch (err) {
      console.error('Domain check error:', err)
      setError('Error checking email domain. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle user choice (join team or create brand)
  const handleChoice = (choice: 'join' | 'create') => {
    setUserChoice(choice)
    if (choice === 'join') {
      setStep('team_request')
    } else {
      setStep('department')
    }
  }
  
  // Handle signup
  const handleSignup = async () => {
    if (!email || !password || !department) {
      setError('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })
      
      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')
      
      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          full_name: fullName || null,
          user_type: 'brand',
          department,
          onboarding_completed: false
        })
      
      if (profileError) throw profileError
      
      // Redirect to brand onboarding
      router.push('/brand/onboarding')
      
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Error creating account. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Handle team request
  const handleTeamRequest = async () => {
    if (!email || !password || !department || !domainCheck?.existing_brand) {
      setError('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })
      
      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')
      
      // Get default role for department
      const deptConfig = DEPARTMENTS.find(d => d.id === department)
      const defaultRole = deptConfig?.defaultRole || 'viewer'
      
      // Create profile with pending status
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          full_name: fullName || null,
          user_type: 'brand',
          department,
          account_status: 'pending',
          onboarding_completed: true  // They don't need to set up brand
        })
      
      if (profileError) throw profileError
      
      // Create team request
      const { data: teamRequest, error: requestError } = await supabase
        .from('brand_team_requests')
        .insert({
          brand_id: domainCheck.existing_brand.id,
          profile_id: authData.user.id,
          email,
          department,
          requested_role: defaultRole,
          requested_scope: { geographic: 'global', divisions: ['all'] },
          job_title: jobTitle || null,
          request_message: requestMessage || null
        })
        .select()
        .single()
      
      if (requestError) throw requestError
      
      // Update profile with pending request ID
      await supabase
        .from('profiles')
        .update({ pending_team_request_id: teamRequest.id })
        .eq('id', authData.user.id)
      
      // Create notification for brand owner
      // TODO: Implement notification creation
      
      // Redirect to brand dashboard (will show pending banner)
      router.push('/brand/dashboard')
      
    } catch (err: any) {
      console.error('Team request error:', err)
      setError(err.message || 'Error creating team request. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-[var(--ivory)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <Link href="/login" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
            Already have an account?
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back button for secondary steps */}
          {step !== 'email' && (
            <button
              onClick={() => {
                if (step === 'choice') setStep('email')
                else if (step === 'team_request') setStep('choice')
                else if (step === 'department' && userChoice === 'create') setStep('choice')
                else if (step === 'department') setStep('email')
                else if (step === 'signup') setStep('department')
              }}
              className="flex items-center gap-2 text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)] mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          
          <Card className="p-8">
            {/* Step: Email */}
            {step === 'email' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-h2 mb-2">Join TailorShift for Brands</h1>
                  <p className="text-[var(--grey-600)]">
                    Find exceptional luxury retail talent
                  </p>
                </div>
                
                <div className="space-y-6">
                  <Input
                    label="Work Email"
                    type="email"
                    placeholder="your.name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    hint="Use your company email for faster verification"
                  />
                  
                  {error && (
                    <div className="p-3 bg-[var(--error-light)] text-[var(--error)] rounded-[var(--radius-md)] text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    onClick={checkDomain} 
                    loading={loading}
                    disabled={!email}
                    className="w-full"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-[var(--grey-500)]">
                    Looking for opportunities?{' '}
                    <Link href="/signup" className="text-[var(--gold)] hover:underline">
                      Sign up as Talent
                    </Link>
                  </p>
                </div>
              </>
            )}
            
            {/* Step: Choice (when existing brand found) */}
            {step === 'choice' && domainCheck?.existing_brand && (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[var(--gold-light)] rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-[var(--gold)]" />
                  </div>
                  <h1 className="text-h2 mb-2">{domainCheck.existing_brand.name}</h1>
                  <p className="text-[var(--grey-600)]">
                    is already on TailorShift
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Card
                    variant="interactive"
                    className={`p-4 cursor-pointer ${userChoice === 'join' ? 'border-[var(--gold)]' : ''}`}
                    onClick={() => handleChoice('join')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--success-light)] flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-[var(--success)]" />
                      </div>
                      <div>
                        <p className="font-medium">Request to join the team</p>
                        <p className="text-sm text-[var(--grey-600)] mt-1">
                          Your request will be sent to the account administrator for approval
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card
                    variant="interactive"
                    className={`p-4 cursor-pointer ${userChoice === 'create' ? 'border-[var(--gold)]' : ''}`}
                    onClick={() => handleChoice('create')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--grey-100)] flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-[var(--grey-600)]" />
                      </div>
                      <div>
                        <p className="font-medium">Create a separate brand account</p>
                        <p className="text-sm text-[var(--grey-600)] mt-1">
                          For independent brands or different business units
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}
            
            {/* Step: Department */}
            {step === 'department' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-h2 mb-2">Your Department</h1>
                  <p className="text-[var(--grey-600)]">
                    This helps us set up your account correctly
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {DEPARTMENTS.map((dept) => {
                    const Icon = dept.icon
                    const isSelected = department === dept.id
                    
                    return (
                      <Card
                        key={dept.id}
                        variant={isSelected ? 'selected' : 'interactive'}
                        className="p-4 cursor-pointer"
                        onClick={() => setDepartment(dept.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dept.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{dept.name}</p>
                            <p className="text-sm text-[var(--grey-600)]">{dept.description}</p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-[var(--gold)]" />
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
                
                <Button
                  onClick={() => setStep('signup')}
                  disabled={!department}
                  className="w-full"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
            
            {/* Step: Team Request Details */}
            {step === 'team_request' && domainCheck?.existing_brand && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-h2 mb-2">Complete Your Request</h1>
                  <p className="text-[var(--grey-600)]">
                    Request to join {domainCheck.existing_brand.name}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Your Name"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Department</label>
                    <select
                      value={department || ''}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--grey-200)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Input
                    label="Job Title (optional)"
                    placeholder="Regional HR Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Message to Admin (optional)</label>
                    <textarea
                      placeholder="Je suis la nouvelle RRH pour la région Paris..."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-[var(--grey-200)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] resize-none"
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-[var(--error-light)] text-[var(--error)] rounded-[var(--radius-md)] text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  
                  <Button
                    onClick={handleTeamRequest}
                    loading={loading}
                    disabled={!fullName || !password || !department}
                    className="w-full"
                  >
                    Request to Join
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
            
            {/* Step: Signup (new brand) */}
            {step === 'signup' && (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-h2 mb-2">Create Your Account</h1>
                  <p className="text-[var(--grey-600)]">
                    Almost there! Set up your login
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-[var(--grey-50)] rounded-[var(--radius-md)]">
                    <p className="text-sm text-[var(--grey-600)]">
                      Email: <span className="font-medium text-[var(--charcoal)]">{email}</span>
                    </p>
                  </div>
                  
                  <Input
                    label="Your Name"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  
                  {domainCheck?.requires_manual_review && (
                    <div className="p-3 bg-[var(--warning-light)] text-[var(--warning)] rounded-[var(--radius-md)] text-sm">
                      <p className="font-medium">Manual verification required</p>
                      <p className="text-[var(--warning-dark)]/80 mt-1">
                        Your account will be reviewed within 24-48 hours before activation.
                      </p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="p-3 bg-[var(--error-light)] text-[var(--error)] rounded-[var(--radius-md)] text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  
                  <Button
                    onClick={handleSignup}
                    loading={loading}
                    disabled={!fullName || !password}
                    className="w-full"
                  >
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <p className="text-xs text-[var(--grey-500)] text-center">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="underline">Privacy Policy</Link>
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}