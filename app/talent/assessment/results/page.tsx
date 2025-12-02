import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import Link from 'next/link'
import { DIMENSIONS, type Dimension } from '@/lib/assessment/questions'
import { ArrowLeft, Download, Share2, Trophy, Target, TrendingUp } from 'lucide-react'

export default async function AssessmentResultsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: talent } = await supabase
    .from('talents')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!talent) redirect('/talent/onboarding')

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('talent_id', talent.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (!assessment) redirect('/talent/assessment')

  const dimensionScores = assessment.dimension_scores as Record<Dimension, number>
  const sortedDimensions = [...DIMENSIONS].sort(
    (a, b) => (dimensionScores[b.id] || 0) - (dimensionScores[a.id] || 0)
  )
  const topStrengths = sortedDimensions.slice(0, 3)
  const growthAreas = sortedDimensions.slice(-2)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-[var(--gold)] text-white'
      case 'Advanced': return 'bg-[var(--success)] text-white'
      case 'Proficient': return 'bg-[var(--info)] text-white'
      case 'Intermediate': return 'bg-[var(--warning)] text-white'
      default: return 'bg-[var(--grey-500)] text-white'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[var(--gold)]'
    if (score >= 60) return 'text-[var(--success)]'
    if (score >= 40) return 'text-[var(--info)]'
    return 'text-[var(--grey-600)]'
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/talent/dashboard" className="flex items-center gap-2 text-[var(--grey-600)] hover:text-[var(--charcoal)]">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[var(--gold-light)] flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-[var(--gold)]" />
          </div>
          <h1 className="text-h1 mb-2">Assessment Complete</h1>
          <p className="text-[var(--grey-600)]">
            Completed {new Date(assessment.completed_at).toLocaleDateString('en', { 
              day: 'numeric', month: 'long', year: 'numeric' 
            })}
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-br from-[var(--charcoal)] to-[#3a3a3a] p-8 text-white text-center">
            <p className="text-sm opacity-80 mb-2">Overall Score</p>
            <p className="text-6xl font-display font-light mb-4">{assessment.overall_score}%</p>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getLevelColor(assessment.level)}`}>
              {assessment.level} Level
            </span>
          </div>
        </Card>

        {/* Dimension Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>6D Competency Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Radar Chart Visual */}
            <div className="flex justify-center mb-8">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Background Grid */}
                  {[20, 40, 60, 80, 100].map((level) => (
                    <polygon
                      key={level}
                      points={DIMENSIONS.map((_, i) => {
                        const angle = (i * 60 - 90) * (Math.PI / 180)
                        const radius = level * 0.8
                        return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`
                      }).join(' ')}
                      fill="none"
                      stroke="var(--grey-200)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axes */}
                  {DIMENSIONS.map((_, i) => {
                    const angle = (i * 60 - 90) * (Math.PI / 180)
                    return (
                      <line
                        key={i}
                        x1="100"
                        y1="100"
                        x2={100 + 80 * Math.cos(angle)}
                        y2={100 + 80 * Math.sin(angle)}
                        stroke="var(--grey-200)"
                        strokeWidth="1"
                      />
                    )
                  })}

                  {/* Score Polygon */}
                  <polygon
                    points={DIMENSIONS.map((dim, i) => {
                      const angle = (i * 60 - 90) * (Math.PI / 180)
                      const score = dimensionScores[dim.id] || 0
                      const radius = score * 0.8
                      return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`
                    }).join(' ')}
                    fill="var(--gold-light)"
                    fillOpacity="0.5"
                    stroke="var(--gold)"
                    strokeWidth="2"
                  />

                  {/* Score Points */}
                  {DIMENSIONS.map((dim, i) => {
                    const angle = (i * 60 - 90) * (Math.PI / 180)
                    const score = dimensionScores[dim.id] || 0
                    const radius = score * 0.8
                    return (
                      <circle
                        key={dim.id}
                        cx={100 + radius * Math.cos(angle)}
                        cy={100 + radius * Math.sin(angle)}
                        r="4"
                        fill="var(--gold)"
                      />
                    )
                  })}
                </svg>

                {/* Labels */}
                {DIMENSIONS.map((dim, i) => {
                  const angle = (i * 60 - 90) * (Math.PI / 180)
                  const x = 50 + 50 * Math.cos(angle)
                  const y = 50 + 50 * Math.sin(angle)
                  
                  return (
                    <div
                      key={dim.id}
                      className="absolute text-center"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <span className="text-lg">{dim.icon}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dimension Bars */}
            <div className="space-y-4">
              {DIMENSIONS.map((dim) => {
                const score = dimensionScores[dim.id] || 0
                return (
                  <div key={dim.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <span>{dim.icon}</span>
                        {dim.name}
                      </span>
                      <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--grey-200)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--gold)] rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Growth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Top Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--gold)]" />
                Top Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topStrengths.map((dim, index) => (
                <div key={dim.id} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--gold-light)] flex items-center justify-center text-lg">
                    {dim.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{dim.name}</p>
                    <p className="text-small text-[var(--grey-600)]">{dim.description}</p>
                  </div>
                  <span className="font-display text-lg text-[var(--gold)]">
                    {dimensionScores[dim.id]}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Growth Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--info)]" />
                Growth Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {growthAreas.map((dim) => (
                <div key={dim.id} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--grey-100)] flex items-center justify-center text-lg">
                    {dim.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{dim.name}</p>
                    <p className="text-small text-[var(--grey-600)]">{dim.description}</p>
                  </div>
                  <span className="font-display text-lg text-[var(--grey-600)]">
                    {dimensionScores[dim.id]}%
                  </span>
                </div>
              ))}
              <Link href="/talent/learning" className="block">
                <Button variant="ghost" size="sm" className="w-full mt-2">
                  Explore Learning Paths
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Link href="/talent/dashboard">
            <Button variant="secondary">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/talent/opportunities">
            <Button>
              <Target className="w-4 h-4 mr-2" />
              Find Matching Opportunities
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
