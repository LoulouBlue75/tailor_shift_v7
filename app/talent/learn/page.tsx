import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo, Badge, Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { 
  BookOpen, Play, Award, TrendingUp, Clock, Star,
  ArrowLeft, ChevronRight, GraduationCap, Target, Sparkles
} from 'lucide-react'

// Learning content categories aligned with 6D dimensions
const LEARNING_TRACKS = [
  {
    id: 'product_knowledge',
    name: 'Product Excellence',
    description: 'Master luxury product storytelling and heritage',
    icon: Sparkles,
    color: 'var(--gold)',
    modules: 12,
    duration: '8 hours',
    skills: ['Brand Heritage', 'Craftsmanship', 'Materials', 'Storytelling']
  },
  {
    id: 'clienteling',
    name: 'Clienteling Mastery',
    description: 'Build lasting client relationships',
    icon: Star,
    color: 'var(--info)',
    modules: 10,
    duration: '6 hours',
    skills: ['CRM Tools', 'VIP Handling', 'Personalization', 'Follow-up']
  },
  {
    id: 'cultural_fluency',
    name: 'Cultural Intelligence',
    description: 'Navigate global luxury clientele',
    icon: GraduationCap,
    color: 'var(--success)',
    modules: 8,
    duration: '5 hours',
    skills: ['Cross-cultural', 'Etiquette', 'Languages', 'Customs']
  },
  {
    id: 'sales_performance',
    name: 'Sales Excellence',
    description: 'Drive results with sophisticated techniques',
    icon: TrendingUp,
    color: 'var(--warning)',
    modules: 15,
    duration: '10 hours',
    skills: ['Upselling', 'Cross-selling', 'Closing', 'KPIs']
  },
  {
    id: 'leadership',
    name: 'Leadership Path',
    description: 'Prepare for management roles',
    icon: Target,
    color: 'var(--charcoal)',
    modules: 14,
    duration: '12 hours',
    skills: ['Team Building', 'Coaching', 'Operations', 'Strategy']
  },
]

const FEATURED_COURSES = [
  {
    id: 1,
    title: 'The Art of Luxury Storytelling',
    track: 'Product Excellence',
    duration: '45 min',
    type: 'video',
    level: 'Intermediate',
    rating: 4.9,
    completions: 1240,
  },
  {
    id: 2,
    title: 'Building Your VIP Book',
    track: 'Clienteling Mastery',
    duration: '30 min',
    type: 'interactive',
    level: 'Beginner',
    rating: 4.8,
    completions: 2100,
  },
  {
    id: 3,
    title: 'Chinese Luxury Consumer Insights',
    track: 'Cultural Intelligence',
    duration: '60 min',
    type: 'video',
    level: 'Advanced',
    rating: 4.7,
    completions: 890,
  },
]

export default async function TalentLearnPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: talent } = await supabase
    .from('talents')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!talent) redirect('/talent/onboarding')

  // Get learning progress
  const { data: progress } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('talent_id', talent.id)

  // Get latest assessment to show skill gaps
  const { data: assessment } = await supabase
    .from('assessments')
    .select('dimension_scores')
    .eq('talent_id', talent.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  // Calculate recommended tracks based on assessment
  const dimensionScores = assessment?.dimension_scores || {}
  const recommendedTracks = LEARNING_TRACKS
    .map(track => ({
      ...track,
      score: dimensionScores[track.id] || 50,
      priority: 100 - (dimensionScores[track.id] || 50)
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)

  const totalModulesCompleted = progress?.reduce((sum: number, p: any) => 
    sum + (p.completed_modules || 0), 0
  ) || 0

  const totalHoursLearned = progress?.reduce((sum: number, p: any) => 
    sum + (p.minutes_spent || 0), 0
  ) / 60 || 0

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/talent/dashboard">
                <ArrowLeft className="w-5 h-5 text-[var(--grey-600)] hover:text-[var(--charcoal)]" />
              </Link>
              <Logo size="md" />
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/talent/dashboard" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Dashboard
              </Link>
              <Link href="/talent/learn" className="text-sm font-medium text-[var(--charcoal)]">
                Learn
              </Link>
              <Link href="/talent/opportunities" className="text-sm text-[var(--grey-600)] hover:text-[var(--charcoal)]">
                Opportunities
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Badge variant="gold">
                <Award className="w-3 h-3 mr-1" />
                {totalModulesCompleted} completed
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-h1 mb-2">Career Development</h1>
          <p className="text-[var(--grey-600)]">
            Build skills that matter in luxury retail
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
            <p className="text-2xl font-display">{totalModulesCompleted}</p>
            <p className="text-small text-[var(--grey-600)]">Modules</p>
          </Card>
          <Card className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
            <p className="text-2xl font-display">{Math.round(totalHoursLearned)}h</p>
            <p className="text-small text-[var(--grey-600)]">Learned</p>
          </Card>
          <Card className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
            <p className="text-2xl font-display">{progress?.length || 0}</p>
            <p className="text-small text-[var(--grey-600)]">Certificates</p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
            <p className="text-2xl font-display">
              {Math.round(Object.values(dimensionScores as Record<string, number>)
                .reduce((a, b) => a + b, 0) / 6) || '—'}
            </p>
            <p className="text-small text-[var(--grey-600)]">Avg Score</p>
          </Card>
        </div>

        {/* Recommended for You */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3 flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--gold)]" />
              Recommended for You
            </h2>
            <Link href="/talent/assessment">
              <Button variant="ghost" size="sm">
                Update Assessment
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {recommendedTracks.map(track => {
              const Icon = track.icon
              return (
                <Card key={track.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${track.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: track.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium">{track.name}</h3>
                        <p className="text-small text-[var(--grey-600)]">
                          Your score: {track.score}%
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--grey-600)] mb-4">
                      {track.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-small text-[var(--grey-500)]">
                        {track.modules} modules • {track.duration}
                      </span>
                      <Button size="sm">Start</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Featured Courses */}
        <section className="mb-10">
          <h2 className="text-h3 flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-[var(--gold)]" />
            Featured Courses
          </h2>
          
          <div className="space-y-3">
            {FEATURED_COURSES.map(course => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[var(--radius-md)] bg-[var(--grey-200)] flex items-center justify-center">
                      <Play className="w-6 h-6 text-[var(--grey-500)]" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{course.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-[var(--grey-600)]">
                        <Badge variant="default" size="sm">{course.track}</Badge>
                        <span>{course.duration}</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-[var(--gold)] fill-[var(--gold)]" />
                          {course.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Watch
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Learning Tracks */}
        <section>
          <h2 className="text-h3 flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5" />
            All Learning Tracks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEARNING_TRACKS.map(track => {
              const Icon = track.icon
              return (
                <Card key={track.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center"
                          style={{ backgroundColor: `${track.color}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: track.color }} />
                        </div>
                        <div>
                          <h3 className="font-medium">{track.name}</h3>
                          <p className="text-small text-[var(--grey-600)]">
                            {track.modules} modules • {track.duration}
                          </p>
                        </div>
                      </div>
                      <Link href={`/talent/learn/${track.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {track.skills.map(skill => (
                        <Badge key={skill} variant="default" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
