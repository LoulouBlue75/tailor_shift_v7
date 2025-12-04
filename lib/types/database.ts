// ============================================================================
// TAILOR SHIFT V7 — DATABASE TYPES
// Auto-generated from 001_v7_clean_reset.sql schema
// ============================================================================

export type UserType = 'talent' | 'brand' | 'admin'
export type TalentStatus = 'onboarding' | 'pending_review' | 'approved' | 'rejected' | 'suspended'
export type RoleLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8'
export type StoreTier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5'
export type BrandSegment = 'ultra_luxury' | 'luxury' | 'premium' | 'accessible_luxury'
export type Division = 'fashion' | 'leather_goods' | 'shoes' | 'beauty' | 'fragrance' | 'watches' | 'high_jewelry' | 'eyewear' | 'accessories'
export type Region = 'EMEA' | 'Americas' | 'APAC' | 'Middle_East'
export type AssessmentLevel = 'developing' | 'proficient' | 'advanced' | 'expert'
export type AssessmentStatus = 'pending' | 'in_progress' | 'completed' | 'expired'
export type OpportunityStatus = 'draft' | 'active' | 'paused' | 'filled' | 'cancelled'
export type MatchStatus = 'matched' | 'interested' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'declined' | 'expired'
export type TeamRole = 'owner' | 'admin' | 'recruiter' | 'viewer'
export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked'
export type EndorsementStatus = 'pending' | 'verified' | 'expired'
export type LearningStatus = 'not_started' | 'in_progress' | 'completed'
export type BlockType = 'foh' | 'boh' | 'leadership' | 'clienteling' | 'operations' | 'business'

// ============================================================================
// PROFILES
// ============================================================================
export interface Profile {
  id: string
  user_type: UserType
  email: string
  full_name: string | null
  avatar_url: string | null
  locale: string
  preferred_language: string
  notification_preferences: Record<string, boolean>
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// TALENTS
// ============================================================================
export interface CareerPreferences {
  target_role_levels: RoleLevel[]
  target_store_tiers: StoreTier[]
  target_divisions: Division[]
  target_locations: string[]
  target_brands: string[]
  mobility: 'local' | 'national' | 'international'
  timeline: 'active' | 'passive' | 'not_looking'
}

export interface CompensationProfile {
  current_base: number | null
  current_variable: number | null
  currency: string
  expectations: number | null
  // Extended fields added in compensation collection feature
  salary_flexibility?: 'flexible' | 'firm'
  hide_exact_figures?: boolean
}

export interface AssessmentSummary {
  product_knowledge: number | null
  clienteling: number | null
  cultural_fluency: number | null
  sales_performance: number | null
  leadership: number | null
  operations: number | null
  overall_level: AssessmentLevel | null
  completed_at: string | null
}

export interface Talent {
  id: string
  profile_id: string
  first_name: string
  last_name: string
  phone: string | null
  linkedin_url: string | null
  current_role_level: RoleLevel | null
  current_store_tier: StoreTier | null
  store_tier_experience: StoreTier[]  // New: multi-select store tiers
  years_in_luxury: number | null
  current_employer: string | null
  current_location: string | null
  divisions_expertise: Division[]
  languages: string[]
  career_preferences: CareerPreferences
  compensation_profile: CompensationProfile
  assessment_summary: AssessmentSummary
  profile_completion_pct: number
  status: TalentStatus
  eligibility_score: number | null
  eligibility_decision: string | null
  eligibility_reasons: string[]
  eligibility_flags: string[]
  review_notes: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  resubmit_count: number
  visible_to_current_brand: boolean
  internal_mobility_interest: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// EXPERIENCE BLOCKS
// ============================================================================
export interface StoreContext {
  format: string
  surface: string
  team_size: string
  daily_traffic: string
  revenue_scale: string
  product_complexity: string
  sku_depth: string
  client_profile: string
  operating_hours: string
  org_model: string
}

export interface PositionScope {
  management_span: string
  foh_boh_split: string
  responsibilities: string[]
  reports_to: string
}

export interface ExperienceBlock {
  id: string
  talent_id: string
  block_type: BlockType
  title: string
  company: string
  brand_segment: BrandSegment | null
  division: Division | null
  role_level: RoleLevel | null
  store_tier: StoreTier | null
  location: string | null
  store_context: StoreContext | null
  position_scope: PositionScope | null
  start_date: string
  end_date: string | null
  is_current: boolean
  responsibilities: string[]
  achievements: string[]
  skills_demonstrated: string[]
  team_size: number | null
  verified: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// ASSESSMENTS
// ============================================================================
export interface DimensionScores {
  product_knowledge: number
  clienteling: number
  cultural_fluency: number
  sales_performance: number
  leadership: number
  operations: number
}

export interface Assessment {
  id: string
  talent_id: string
  version: string
  product_knowledge_score: number | null
  clienteling_score: number | null
  cultural_fluency_score: number | null
  sales_performance_score: number | null
  leadership_score: number | null
  operations_score: number | null
  dimension_scores: DimensionScores | Record<string, number>
  overall_score: number | null
  overall_level: AssessmentLevel | null
  responses: Record<string, any> | null
  insights: Record<string, any>
  status: AssessmentStatus
  started_at: string | null
  completed_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// BRANDS
// ============================================================================
export interface BrandBranding {
  logo_url: string | null
  primary_color: string
  secondary_color: string
  font_family: string | null
  background_style: string
  custom_domain: string | null
  hide_ts_branding: boolean
}

export interface Brand {
  id: string
  profile_id: string
  name: string
  logo_url: string | null
  website: string | null
  segment: BrandSegment | null
  parent_group: string | null
  primary_division: Division | null
  divisions: Division[]
  headquarters_location: string | null
  contact_name: string | null
  contact_role: string | null
  contact_email: string | null
  contact_phone: string | null
  branding: BrandBranding
  verified: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// STORES
// ============================================================================
export interface ContextFingerprint {
  format: string
  surface: string
  team_size: string
  daily_traffic: string
  revenue_scale: string
  product_complexity: string
  sku_depth: string
  client_profile: string
  operating_hours: string
  org_model: string
}

export interface Store {
  id: string
  brand_id: string
  name: string
  code: string | null
  tier: StoreTier
  address: string | null
  city: string
  country: string
  region: Region | null
  latitude: number | null
  longitude: number | null
  store_size_sqm: number | null
  team_size: number | null
  divisions: Division[]
  context_fingerprint: ContextFingerprint | null
  status: 'active' | 'opening_soon' | 'inactive'
  created_at: string
  updated_at: string
}

// ============================================================================
// OPPORTUNITIES
// ============================================================================
export interface CapabilityRequirement {
  minimum: number | null
  importance: number // 1-5
}

export interface CapabilityRequirements {
  product_knowledge: CapabilityRequirement
  clienteling: CapabilityRequirement
  cultural_fluency: CapabilityRequirement
  sales_performance: CapabilityRequirement
  leadership: CapabilityRequirement
  operations: CapabilityRequirement
}

export interface CompensationRange {
  min_base: number | null
  max_base: number | null
  variable_pct: number | null
  currency: string
}

export interface MatchingCriteria {
  preferred_maisons: string[]
  preferred_divisions: Division[]
  weight_overrides: Record<string, number>
}

export interface Opportunity {
  id: string
  brand_id: string
  store_id: string | null
  title: string
  role_level: RoleLevel
  division: Division | null
  required_experience_years: number | null
  required_languages: string[]
  required_skills: string[]
  capability_requirements: CapabilityRequirements
  description: string | null
  responsibilities: string[]
  benefits: string[]
  compensation_range: CompensationRange
  brand_assessment_id: string | null
  brand_assessment_required: boolean
  matching_criteria: MatchingCriteria
  status: OpportunityStatus
  published_at: string | null
  deadline_at: string | null
  filled_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// MATCHES
// ============================================================================
export interface ScoreBreakdown {
  role_fit: number
  division_fit: number
  store_context: number
  capability_fit: number
  geography: number
  experience_block: number
  preference: number
  brand_assessment: number
}

export interface Match {
  id: string
  talent_id: string
  opportunity_id: string
  match_score: number
  score_breakdown: ScoreBreakdown
  compensation_alignment: 'within_range' | 'above_range' | 'below_range' | 'unknown' | null
  status: MatchStatus
  talent_action: 'interested' | 'declined' | null
  talent_action_at: string | null
  brand_action: 'interested' | 'declined' | null
  brand_action_at: string | null
  brand_notes: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// BRAND TEAM
// ============================================================================
export interface BrandTeamMember {
  id: string
  brand_id: string
  profile_id: string
  role: TeamRole
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  status: 'pending' | 'active' | 'deactivated'
  created_at: string
}

// ============================================================================
// MESSAGING
// ============================================================================
export interface Conversation {
  id: string
  talent_id: string
  brand_id: string
  match_id: string | null
  title: string | null
  last_message_at: string | null
  talent_unread_count: number
  brand_unread_count: number
  status: 'active' | 'archived' | 'blocked'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_type: 'talent' | 'brand'
  sender_id: string
  content: string
  message_type: 'text' | 'system' | 'file'
  metadata: Record<string, any>
  read_at: string | null
  created_at: string
}

// ============================================================================
// NETWORKING
// ============================================================================
export interface Connection {
  id: string
  talent_id: string
  connected_id: string
  status: ConnectionStatus
  message: string | null
  created_at: string
  responded_at: string | null
}

export interface Endorsement {
  id: string
  talent_id: string
  endorser_id: string | null
  skill: string
  message: string | null
  endorser_name: string | null
  endorser_email: string | null
  endorser_relationship: string | null
  verification_token: string | null
  verified_at: string | null
  status: EndorsementStatus
  created_at: string
}

export interface TalentVisibilitySettings {
  talent_id: string
  visible_to_same_maison: boolean
  visible_to_same_group: boolean
  share_full_name: boolean
  share_current_role: boolean
  share_location: boolean
  share_divisions: boolean
  share_years_experience: boolean
  accept_connection_requests: boolean
  updated_at: string
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  data: Record<string, any>
  read_at: string | null
  sent_email: boolean
  created_at: string
}

// ============================================================================
// LEARNING
// ============================================================================
export interface LearningModule {
  id: string
  title: string
  description: string | null
  category: keyof DimensionScores
  content_type: 'video' | 'article' | 'exercise' | 'quiz'
  content_url: string | null
  duration_minutes: number | null
  target_role_levels: RoleLevel[]
  target_gaps: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'draft' | 'active' | 'archived'
  sort_order: number
  created_at: string
  updated_at: string
}

export interface LearningProgress {
  id: string
  talent_id: string
  module_id: string
  status: LearningStatus
  progress_pct: number
  completed_modules: number
  minutes_spent: number
  quiz_score: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// BRAND ASSESSMENTS
// ============================================================================
export interface BrandAssessment {
  id: string
  brand_id: string
  title: string
  description: string | null
  estimated_duration_minutes: number
  is_mandatory: boolean
  passing_score: number
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface BrandAssessmentQuestion {
  id: string
  assessment_id: string
  question_text: string
  question_type: 'mcq' | 'scale' | 'situational' | 'open'
  options: { value: string; label: string; score: number }[] | null
  max_score: number
  order_index: number
  is_required: boolean
  created_at: string
}

export interface TalentBrandAssessmentResult {
  id: string
  talent_id: string
  assessment_id: string
  score: number | null
  max_possible_score: number | null
  passed: boolean | null
  responses: Record<string, any> | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// ============================================================================
// LUXURY GROUPS
// ============================================================================
export interface LuxuryGroup {
  id: string
  name: string
  maisons: string[]
  created_at: string
}

// ============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// ============================================================================
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      talents: { Row: Talent; Insert: Partial<Talent>; Update: Partial<Talent> }
      experience_blocks: { Row: ExperienceBlock; Insert: Partial<ExperienceBlock>; Update: Partial<ExperienceBlock> }
      assessments: { Row: Assessment; Insert: Partial<Assessment>; Update: Partial<Assessment> }
      brands: { Row: Brand; Insert: Partial<Brand>; Update: Partial<Brand> }
      stores: { Row: Store; Insert: Partial<Store>; Update: Partial<Store> }
      opportunities: { Row: Opportunity; Insert: Partial<Opportunity>; Update: Partial<Opportunity> }
      matches: { Row: Match; Insert: Partial<Match>; Update: Partial<Match> }
      brand_team_members: { Row: BrandTeamMember; Insert: Partial<BrandTeamMember>; Update: Partial<BrandTeamMember> }
      conversations: { Row: Conversation; Insert: Partial<Conversation>; Update: Partial<Conversation> }
      messages: { Row: Message; Insert: Partial<Message>; Update: Partial<Message> }
      connections: { Row: Connection; Insert: Partial<Connection>; Update: Partial<Connection> }
      endorsements: { Row: Endorsement; Insert: Partial<Endorsement>; Update: Partial<Endorsement> }
      talent_visibility_settings: { Row: TalentVisibilitySettings; Insert: Partial<TalentVisibilitySettings>; Update: Partial<TalentVisibilitySettings> }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
      learning_modules: { Row: LearningModule; Insert: Partial<LearningModule>; Update: Partial<LearningModule> }
      learning_progress: { Row: LearningProgress; Insert: Partial<LearningProgress>; Update: Partial<LearningProgress> }
      brand_assessments: { Row: BrandAssessment; Insert: Partial<BrandAssessment>; Update: Partial<BrandAssessment> }
      brand_assessment_questions: { Row: BrandAssessmentQuestion; Insert: Partial<BrandAssessmentQuestion>; Update: Partial<BrandAssessmentQuestion> }
      talent_brand_assessment_results: { Row: TalentBrandAssessmentResult; Insert: Partial<TalentBrandAssessmentResult>; Update: Partial<TalentBrandAssessmentResult> }
      luxury_groups: { Row: LuxuryGroup; Insert: Partial<LuxuryGroup>; Update: Partial<LuxuryGroup> }
    }
  }
}
