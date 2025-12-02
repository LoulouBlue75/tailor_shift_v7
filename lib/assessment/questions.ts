// 6D Assessment Framework for Tailor Shift
// Based on luxury retail competency model

export type Dimension = 
  | 'product_knowledge'
  | 'clienteling_mastery'
  | 'cultural_alignment'
  | 'sales_performance'
  | 'leadership'
  | 'operations'

export const DIMENSIONS: { id: Dimension; name: string; icon: string; description: string }[] = [
  { 
    id: 'product_knowledge', 
    name: 'Product Knowledge', 
    icon: '💎',
    description: 'Understanding of luxury products, craftsmanship, heritage, and storytelling'
  },
  { 
    id: 'clienteling_mastery', 
    name: 'Clienteling Mastery', 
    icon: '🤝',
    description: 'Client relationship building, VIC management, and personalized service'
  },
  { 
    id: 'cultural_alignment', 
    name: 'Cultural Alignment', 
    icon: '🌟',
    description: 'Brand values, luxury mindset, and cultural fit with maison heritage'
  },
  { 
    id: 'sales_performance', 
    name: 'Sales Performance', 
    icon: '📈',
    description: 'Revenue generation, target achievement, and commercial acumen'
  },
  { 
    id: 'leadership', 
    name: 'Leadership', 
    icon: '👑',
    description: 'Team management, coaching, vision setting, and people development'
  },
  { 
    id: 'operations', 
    name: 'Operations', 
    icon: '⚙️',
    description: 'Store operations, inventory, compliance, and process excellence'
  },
]

export interface AssessmentQuestion {
  id: string
  dimension: Dimension
  text: string
  type: 'scale' | 'scenario' | 'self_rating'
  options?: { value: number; label: string }[]
  scenario?: {
    context: string
    responses: { value: number; text: string }[]
  }
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // PRODUCT KNOWLEDGE (5 questions)
  {
    id: 'pk_1',
    dimension: 'product_knowledge',
    text: 'How would you describe your knowledge of luxury craftsmanship techniques?',
    type: 'self_rating',
    options: [
      { value: 1, label: 'Basic awareness' },
      { value: 2, label: 'Can explain key techniques' },
      { value: 3, label: 'Deep understanding across categories' },
      { value: 4, label: 'Expert level, can educate others' },
      { value: 5, label: 'Industry authority, published/recognized' },
    ]
  },
  {
    id: 'pk_2',
    dimension: 'product_knowledge',
    text: 'When presenting a high-value piece to a client, what is your primary focus?',
    type: 'scenario',
    scenario: {
      context: 'A client is considering a €50,000 watch purchase.',
      responses: [
        { value: 2, text: 'I focus on specifications and features' },
        { value: 3, text: 'I emphasize value and exclusivity' },
        { value: 4, text: 'I tell the story of the maison and craftsmanship' },
        { value: 5, text: 'I create an emotional journey connecting the piece to their life' },
      ]
    }
  },
  {
    id: 'pk_3',
    dimension: 'product_knowledge',
    text: 'How many luxury maisons can you speak knowledgeably about?',
    type: 'self_rating',
    options: [
      { value: 1, label: '1-2 brands (current employer)' },
      { value: 2, label: '3-5 brands in my category' },
      { value: 3, label: '6-10 brands across categories' },
      { value: 4, label: '10+ brands with deep knowledge' },
      { value: 5, label: 'Comprehensive industry expertise' },
    ]
  },
  {
    id: 'pk_4',
    dimension: 'product_knowledge',
    text: 'How do you stay current with luxury market trends and new collections?',
    type: 'scale',
    options: [
      { value: 1, label: 'I wait for company training' },
      { value: 2, label: 'I occasionally read industry news' },
      { value: 3, label: 'I regularly follow trade publications' },
      { value: 4, label: 'I attend shows and network with peers' },
      { value: 5, label: 'I am actively connected to the industry' },
    ]
  },
  {
    id: 'pk_5',
    dimension: 'product_knowledge',
    text: 'How would you handle a client asking about a competitor product?',
    type: 'scenario',
    scenario: {
      context: 'A client mentions they are also considering a competitor\'s similar item.',
      responses: [
        { value: 1, text: 'I avoid discussing competitors' },
        { value: 2, text: 'I point out competitors\' weaknesses' },
        { value: 3, text: 'I refocus on our product\'s strengths' },
        { value: 5, text: 'I acknowledge both options and highlight our unique heritage' },
      ]
    }
  },

  // CLIENTELING MASTERY (5 questions)
  {
    id: 'cm_1',
    dimension: 'clienteling_mastery',
    text: 'How many VIC (Very Important Client) relationships do you currently manage?',
    type: 'self_rating',
    options: [
      { value: 1, label: 'None yet' },
      { value: 2, label: '1-10 clients' },
      { value: 3, label: '11-30 clients' },
      { value: 4, label: '31-50 clients with €100K+ annual' },
      { value: 5, label: '50+ VICs with €500K+ portfolio' },
    ]
  },
  {
    id: 'cm_2',
    dimension: 'clienteling_mastery',
    text: 'How do you maintain client relationships between visits?',
    type: 'scenario',
    scenario: {
      context: 'A VIC client made a significant purchase 3 months ago.',
      responses: [
        { value: 1, text: 'I wait for them to return' },
        { value: 2, text: 'I send a generic holiday card' },
        { value: 3, text: 'I reach out with new arrivals they might like' },
        { value: 5, text: 'I maintain regular personalized contact tied to their interests' },
      ]
    }
  },
  {
    id: 'cm_3',
    dimension: 'clienteling_mastery',
    text: 'How do you handle a dissatisfied VIC client?',
    type: 'scenario',
    scenario: {
      context: 'Your top client is unhappy with a repair service that took too long.',
      responses: [
        { value: 1, text: 'I explain the company policy' },
        { value: 2, text: 'I apologize and offer a small gesture' },
        { value: 3, text: 'I personally follow up and ensure resolution' },
        { value: 5, text: 'I take ownership, escalate, and create a surprise recovery experience' },
      ]
    }
  },
  {
    id: 'cm_4',
    dimension: 'clienteling_mastery',
    text: 'What tools do you use to track client preferences?',
    type: 'scale',
    options: [
      { value: 1, label: 'Memory only' },
      { value: 2, label: 'Basic notes' },
      { value: 3, label: 'Company CRM system' },
      { value: 4, label: 'CRM plus personal detailed files' },
      { value: 5, label: 'Sophisticated system with life events and preferences' },
    ]
  },
  {
    id: 'cm_5',
    dimension: 'clienteling_mastery',
    text: 'How do you approach building a client book in a new position?',
    type: 'self_rating',
    options: [
      { value: 1, label: 'I wait for walk-in clients' },
      { value: 2, label: 'I work with assigned clients' },
      { value: 3, label: 'I actively network and prospect' },
      { value: 4, label: 'I leverage personal network and referrals' },
      { value: 5, label: 'I bring a portable client book with loyal following' },
    ]
  },

  // CULTURAL ALIGNMENT (5 questions)
  {
    id: 'ca_1',
    dimension: 'cultural_alignment',
    text: 'What attracts you most to working in luxury retail?',
    type: 'scale',
    options: [
      { value: 1, label: 'The salary and benefits' },
      { value: 2, label: 'The prestige of the brands' },
      { value: 3, label: 'Working with beautiful products' },
      { value: 4, label: 'Creating exceptional client experiences' },
      { value: 5, label: 'Being part of preserving heritage and craftsmanship' },
    ]
  },
  {
    id: 'ca_2',
    dimension: 'cultural_alignment',
    text: 'How do you embody the brand values outside of work?',
    type: 'self_rating',
    options: [
      { value: 1, label: 'I separate work and personal life' },
      { value: 2, label: 'I wear some brand items' },
      { value: 3, label: 'I live an aligned lifestyle' },
      { value: 4, label: 'I am a brand ambassador in my community' },
      { value: 5, label: 'I fully embody luxury values in all aspects' },
    ]
  },
  {
    id: 'ca_3',
    dimension: 'cultural_alignment',
    text: 'How important is attention to detail in your work?',
    type: 'scale',
    options: [
      { value: 1, label: 'I focus on the big picture' },
      { value: 2, label: 'I pay attention when required' },
      { value: 3, label: 'I am naturally detail-oriented' },
      { value: 4, label: 'Details are essential to excellence' },
      { value: 5, label: 'Perfection in details is non-negotiable' },
    ]
  },
  {
    id: 'ca_4',
    dimension: 'cultural_alignment',
    text: 'How do you handle requests that bend company policy?',
    type: 'scenario',
    scenario: {
      context: 'A VIC asks for special treatment outside normal guidelines.',
      responses: [
        { value: 2, text: 'I strictly follow policy and decline' },
        { value: 3, text: 'I find creative solutions within guidelines' },
        { value: 4, text: 'I escalate to management for approval' },
        { value: 5, text: 'I balance brand integrity with client importance, then escalate thoughtfully' },
      ]
    }
  },
  {
    id: 'ca_5',
    dimension: 'cultural_alignment',
    text: 'What is your view on discretion and confidentiality?',
    type: 'scale',
    options: [
      { value: 1, label: 'I share interesting stories with friends' },
      { value: 2, label: 'I am generally discrete' },
      { value: 3, label: 'I never discuss clients publicly' },
      { value: 4, label: 'Absolute confidentiality is fundamental' },
      { value: 5, label: 'I treat client privacy as sacred trust' },
    ]
  },

  // SALES PERFORMANCE (5 questions)
  {
    id: 'sp_1',
    dimension: 'sales_performance',
    text: 'What is your track record with sales targets?',
    type: 'self_rating',
    options: [
      { value: 1, label: 'I sometimes meet targets' },
      { value: 2, label: 'I consistently meet targets' },
      { value: 3, label: 'I exceed targets by 10-20%' },
      { value: 4, label: 'I exceed targets by 20-50%' },
      { value: 5, label: 'I am consistently top 5% performer' },
    ]
  },
  {
    id: 'sp_2',
    dimension: 'sales_performance',
    text: 'How do you handle a slow sales period?',
    type: 'scenario',
    scenario: {
      context: 'Traffic is down 30% and you\'re behind target for the month.',
      responses: [
        { value: 1, text: 'I wait for traffic to improve' },
        { value: 2, text: 'I focus on available customers' },
        { value: 3, text: 'I reach out to my client book' },
        { value: 5, text: 'I create events, activate CRM, and develop creative solutions' },
      ]
    }
  },
  {
    id: 'sp_3',
    dimension: 'sales_performance',
    text: 'What is your average transaction value compared to team average?',
    type: 'self_rating',
    options: [
      { value: 1, label: 'Below team average' },
      { value: 2, label: 'At team average' },
      { value: 3, label: '10-30% above average' },
      { value: 4, label: '30-50% above average' },
      { value: 5, label: '50%+ above average' },
    ]
  },
  {
    id: 'sp_4',
    dimension: 'sales_performance',
    text: 'How do you approach cross-selling and upselling?',
    type: 'scale',
    options: [
      { value: 1, label: 'I focus on the initial request' },
      { value: 2, label: 'I suggest obvious complements' },
      { value: 3, label: 'I present a curated selection' },
      { value: 4, label: 'I create complete lifestyle proposals' },
      { value: 5, label: 'I anticipate future needs and build wardrobes/collections' },
    ]
  },
  {
    id: 'sp_5',
    dimension: 'sales_performance',
    text: 'How do you handle price objections on luxury items?',
    type: 'scenario',
    scenario: {
      context: 'A client loves a piece but hesitates at the price.',
      responses: [
        { value: 1, text: 'I offer a discount or alternative' },
        { value: 2, text: 'I explain the quality justifies the price' },
        { value: 3, text: 'I refocus on value and exclusivity' },
        { value: 5, text: 'I explore their relationship with the piece and reinforce emotional connection' },
      ]
    }
  },

  // LEADERSHIP (5 questions)
  {
    id: 'ld_1',
    dimension: 'leadership',
    text: 'What is your experience with team leadership?',
    type: 'self_rating',
    options: [
      { value: 1, label: 'No formal leadership experience' },
      { value: 2, label: 'Informal peer leadership' },
      { value: 3, label: 'Team lead for 1-3 people' },
      { value: 4, label: 'Manager of 4-15 people' },
      { value: 5, label: 'Senior leader of 15+ or multi-store' },
    ]
  },
  {
    id: 'ld_2',
    dimension: 'leadership',
    text: 'How do you develop team members?',
    type: 'scenario',
    scenario: {
      context: 'A team member is underperforming but has potential.',
      responses: [
        { value: 1, text: 'I let HR handle performance issues' },
        { value: 2, text: 'I provide feedback during reviews' },
        { value: 3, text: 'I create a development plan together' },
        { value: 5, text: 'I coach actively, identify root causes, and invest in their growth' },
      ]
    }
  },
  {
    id: 'ld_3',
    dimension: 'leadership',
    text: 'How do you communicate vision and goals?',
    type: 'scale',
    options: [
      { value: 1, label: 'I share company targets' },
      { value: 2, label: 'I explain what we need to achieve' },
      { value: 3, label: 'I connect goals to team purpose' },
      { value: 4, label: 'I inspire with a shared vision' },
      { value: 5, label: 'I create meaning and align individual aspirations' },
    ]
  },
  {
    id: 'ld_4',
    dimension: 'leadership',
    text: 'How do you handle conflict within your team?',
    type: 'scenario',
    scenario: {
      context: 'Two team members are in conflict over client allocation.',
      responses: [
        { value: 1, text: 'I let them resolve it themselves' },
        { value: 2, text: 'I make a decision and enforce it' },
        { value: 3, text: 'I mediate and find compromise' },
        { value: 5, text: 'I address root causes, rebuild trust, and create fair systems' },
      ]
    }
  },
  {
    id: 'ld_5',
    dimension: 'leadership',
    text: 'How do you balance team needs with business demands?',
    type: 'scale',
    options: [
      { value: 1, label: 'Business results come first' },
      { value: 2, label: 'I try to meet both when possible' },
      { value: 3, label: 'I advocate for team while meeting targets' },
      { value: 4, label: 'I create sustainable performance through team investment' },
      { value: 5, label: 'I believe engaged teams drive superior results' },
    ]
  },

  // OPERATIONS (5 questions)
  {
    id: 'op_1',
    dimension: 'operations',
    text: 'What is your experience with store operations?',
    type: 'self_rating',
    options: [
      { value: 1, label: 'Limited to my sales role' },
      { value: 2, label: 'Basic opening/closing duties' },
      { value: 3, label: 'Full store operations trained' },
      { value: 4, label: 'P&L responsibility and inventory' },
      { value: 5, label: 'Multi-store operations oversight' },
    ]
  },
  {
    id: 'op_2',
    dimension: 'operations',
    text: 'How do you approach inventory management?',
    type: 'scale',
    options: [
      { value: 1, label: 'I leave it to the stock team' },
      { value: 2, label: 'I report discrepancies' },
      { value: 3, label: 'I actively monitor and optimize' },
      { value: 4, label: 'I analyze data to drive decisions' },
      { value: 5, label: 'I use predictive approaches and influence buying' },
    ]
  },
  {
    id: 'op_3',
    dimension: 'operations',
    text: 'How do you ensure compliance with brand standards?',
    type: 'scenario',
    scenario: {
      context: 'You notice a colleague cutting corners on VM standards.',
      responses: [
        { value: 1, text: 'I focus on my own work' },
        { value: 2, text: 'I mention it casually' },
        { value: 3, text: 'I help them understand the importance' },
        { value: 5, text: 'I lead by example and create a culture of excellence' },
      ]
    }
  },
  {
    id: 'op_4',
    dimension: 'operations',
    text: 'How do you handle unexpected operational challenges?',
    type: 'scenario',
    scenario: {
      context: 'The POS system crashes during peak hours.',
      responses: [
        { value: 1, text: 'I wait for IT to fix it' },
        { value: 2, text: 'I follow the backup procedure' },
        { value: 3, text: 'I find solutions while maintaining client experience' },
        { value: 5, text: 'I lead crisis response while protecting sales and client satisfaction' },
      ]
    }
  },
  {
    id: 'op_5',
    dimension: 'operations',
    text: 'What is your approach to process improvement?',
    type: 'scale',
    options: [
      { value: 1, label: 'I follow established processes' },
      { value: 2, label: 'I suggest improvements when asked' },
      { value: 3, label: 'I proactively identify improvements' },
      { value: 4, label: 'I implement and measure improvements' },
      { value: 5, label: 'I drive continuous improvement culture' },
    ]
  },
]

// Scoring algorithm
export function calculateDimensionScores(answers: Record<string, number>): Record<Dimension, number> {
  const scores: Record<Dimension, { total: number; count: number }> = {
    product_knowledge: { total: 0, count: 0 },
    clienteling_mastery: { total: 0, count: 0 },
    cultural_alignment: { total: 0, count: 0 },
    sales_performance: { total: 0, count: 0 },
    leadership: { total: 0, count: 0 },
    operations: { total: 0, count: 0 },
  }

  for (const [questionId, value] of Object.entries(answers)) {
    const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionId)
    if (question) {
      scores[question.dimension].total += value
      scores[question.dimension].count += 1
    }
  }

  const result: Record<Dimension, number> = {} as Record<Dimension, number>
  for (const [dimension, data] of Object.entries(scores)) {
    result[dimension as Dimension] = data.count > 0 
      ? Math.round((data.total / data.count / 5) * 100) 
      : 0
  }

  return result
}

export function calculateOverallLevel(scores: Record<Dimension, number>): string {
  const average = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  
  if (average >= 90) return 'Expert'
  if (average >= 75) return 'Advanced'
  if (average >= 60) return 'Proficient'
  if (average >= 40) return 'Intermediate'
  return 'Foundation'
}
