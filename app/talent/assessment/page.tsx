'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Logo, Card } from '@/components/ui'
import { 
  DIMENSIONS, 
  ASSESSMENT_QUESTIONS, 
  calculateDimensionScores, 
  calculateOverallLevel,
  type Dimension 
} from '@/lib/assessment/questions'
import { Check, ArrowRight, ArrowLeft, Clock } from 'lucide-react'

export default function AssessmentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentDimension, setCurrentDimension] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)

  const dimension = DIMENSIONS[currentDimension]
  const dimensionQuestions = ASSESSMENT_QUESTIONS.filter(q => q.dimension === dimension?.id)
  const question = dimensionQuestions[currentQuestion]
  const totalQuestions = ASSESSMENT_QUESTIONS.length
  const answeredCount = Object.keys(answers).length

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < dimensionQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else if (currentDimension < DIMENSIONS.length - 1) {
      setCurrentDimension(currentDimension + 1)
      setCurrentQuestion(0)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else if (currentDimension > 0) {
      setCurrentDimension(currentDimension - 1)
      const prevDimensionQuestions = ASSESSMENT_QUESTIONS.filter(
        q => q.dimension === DIMENSIONS[currentDimension - 1].id
      )
      setCurrentQuestion(prevDimensionQuestions.length - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: talent } = await supabase
        .from('talents')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!talent) throw new Error('Talent not found')

      const dimensionScores = calculateDimensionScores(answers)
      const level = calculateOverallLevel(dimensionScores)

      const { error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          talent_id: talent.id,
          type: '6d_standard',
          status: 'completed',
          answers,
          dimension_scores: dimensionScores,
          overall_score: Math.round(
            Object.values(dimensionScores).reduce((a, b) => a + b, 0) / 6
          ),
          level,
          completed_at: new Date().toISOString(),
        })

      if (assessmentError) throw assessmentError

      router.push('/talent/assessment/results')
    } catch (error) {
      console.error('Error saving assessment:', error)
    } finally {
      setLoading(false)
    }
  }

  const isLastQuestion = currentDimension === DIMENSIONS.length - 1 && 
    currentQuestion === dimensionQuestions.length - 1

  if (!started) {
    return (
      <div className="min-h-screen bg-[var(--ivory)] flex flex-col">
        <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <Logo size="md" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl text-center">
            <h1 className="text-h1 mb-4">Your six-dimension assessment</h1>
            <p className="text-lg text-[var(--grey-600)] mb-8">
              Discover your unique strengths in luxury retail
            </p>

            {/* Dimensions Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {DIMENSIONS.map((dim) => (
                <Card key={dim.id} className="p-4 text-center">
                  <span className="text-2xl mb-2 block">{dim.icon}</span>
                  <p className="font-medium text-sm">{dim.name}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-[var(--grey-600)] mb-8">
              <Clock className="w-5 h-5" />
              <span>Ten minutes • Thirty questions</span>
            </div>

            <Button size="lg" onClick={() => setStarted(true)}>
              Begin
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[var(--grey-200)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <span className="text-small text-[var(--grey-500)]">
              {answeredCount} / {totalQuestions} questions
            </span>
          </div>
        </div>
      </header>

      {/* Dimension Progress */}
      <div className="bg-white border-b border-[var(--grey-200)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {DIMENSIONS.map((dim, index) => {
              const dimQuestions = ASSESSMENT_QUESTIONS.filter(q => q.dimension === dim.id)
              const dimAnswered = dimQuestions.filter(q => answers[q.id] !== undefined).length
              const isComplete = dimAnswered === dimQuestions.length
              const isCurrent = index === currentDimension

              return (
                <div key={dim.id} className="flex-1">
                  <div className={`
                    h-2 rounded-full transition-colors
                    ${isComplete ? 'bg-[var(--gold)]' : isCurrent ? 'bg-[var(--charcoal)]' : 'bg-[var(--grey-200)]'}
                  `} />
                  <p className={`
                    text-small mt-1 truncate
                    ${isCurrent ? 'text-[var(--charcoal)] font-medium' : 'text-[var(--grey-500)]'}
                  `}>
                    {dim.icon} {dim.name}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Dimension Header */}
          <div className="text-center mb-8">
            <span className="text-4xl mb-2 block">{dimension.icon}</span>
            <h2 className="text-h3 text-[var(--gold)]">{dimension.name}</h2>
            <p className="text-[var(--grey-600)] text-sm">{dimension.description}</p>
          </div>

          {/* Question Card */}
          <Card className="p-8 mb-8">
            <p className="text-small text-[var(--grey-500)] mb-2">
              Question {currentQuestion + 1} of {dimensionQuestions.length}
            </p>
            <h3 className="text-h3 mb-6">{question.text}</h3>

            {/* Scenario Context */}
            {question.scenario && (
              <div className="bg-[var(--grey-100)] rounded-[var(--radius-md)] p-4 mb-6">
                <p className="text-sm text-[var(--grey-700)] italic">
                  {question.scenario.context}
                </p>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {(question.scenario?.responses || question.options)?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`
                    w-full p-4 rounded-[var(--radius-md)] border text-left transition-all
                    ${answers[question.id] === option.value
                      ? 'border-[var(--gold)] bg-[var(--gold-light)]'
                      : 'border-[var(--grey-200)] hover:border-[var(--grey-300)] hover:bg-[var(--grey-100)]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {'text' in option ? option.text : option.label}
                    </span>
                    {answers[question.id] === option.value && (
                      <Check className="w-5 h-5 text-[var(--gold)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentDimension === 0 && currentQuestion === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleComplete}
                loading={loading}
                disabled={!answers[question.id]}
              >
                Complete Assessment
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!answers[question.id]}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
