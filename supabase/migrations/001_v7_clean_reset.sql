-- ============================================================================
-- TAILOR SHIFT V7 — CLEAN RESET & UNIFIED SCHEMA
-- Migration: 001_v7_clean_reset.sql
-- 
-- ⚠️ WARNING: This script DROPS ALL EXISTING TABLES and creates fresh V7 schema
-- Execute in Supabase SQL Editor ONLY on a fresh project or when ready to reset
-- ============================================================================

-- ============================================================================
-- PART 1: DROP ALL EXISTING TABLES & OBJECTS (Clean slate)
-- ============================================================================

-- Drop all V5/V6/V7 tables (in dependency order)
DROP TABLE IF EXISTS talent_brand_assessment_results CASCADE;
DROP TABLE IF EXISTS brand_assessment_questions CASCADE;
DROP TABLE IF EXISTS brand_assessments CASCADE;
DROP TABLE IF EXISTS talent_learning_progress CASCADE;
DROP TABLE IF EXISTS learning_modules CASCADE;
DROP TABLE IF EXISTS skill_endorsements CASCADE;
DROP TABLE IF EXISTS talent_visibility_settings CASCADE;
DROP TABLE IF EXISTS talent_connections CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS talent_pipeline CASCADE;
DROP TABLE IF EXISTS brand_invitations CASCADE;
DROP TABLE IF EXISTS brand_team_members CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS experience_blocks CASCADE;
DROP TABLE IF EXISTS talents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS luxury_groups CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Drop triggers on auth.users (if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- PART 2: HELPER FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 3: PROFILES (extends auth.users)
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('talent', 'brand', 'admin')),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'en',
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_onboarding ON profiles(onboarding_completed);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'talent'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PART 4: TALENTS (with V6 admin validation + V7 features)
-- ============================================================================
CREATE TABLE talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Identity
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  
  -- Professional Identity
  current_role_level TEXT CHECK (current_role_level IN ('L1','L2','L3','L4','L5','L6','L7','L8')),
  current_store_tier TEXT CHECK (current_store_tier IN ('T1','T2','T3','T4','T5')),
  years_in_luxury INTEGER CHECK (years_in_luxury >= 0),
  current_employer TEXT,
  current_location TEXT,
  
  -- Divisions (array)
  divisions_expertise TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  
  -- Career Preferences (JSONB)
  career_preferences JSONB DEFAULT '{
    "target_role_levels": [],
    "target_store_tiers": [],
    "target_divisions": [],
    "target_locations": [],
    "target_brands": [],
    "mobility": "local",
    "timeline": "passive"
  }',
  
  -- Compensation (never exposed)
  compensation_profile JSONB DEFAULT '{
    "current_base": null,
    "current_variable": null,
    "currency": "EUR",
    "expectations": null
  }',
  
  -- 6D Assessment Summary
  assessment_summary JSONB DEFAULT '{
    "product_knowledge": null,
    "clienteling": null,
    "cultural_fluency": null,
    "sales_performance": null,
    "leadership": null,
    "operations": null,
    "overall_level": null,
    "completed_at": null
  }',
  
  -- Profile Status
  profile_completion_pct INTEGER DEFAULT 0 CHECK (
    profile_completion_pct >= 0 AND profile_completion_pct <= 100
  ),
  
  -- Admin Validation Status (from V6)
  status TEXT DEFAULT 'onboarding' CHECK (
    status IN ('onboarding', 'pending_review', 'approved', 'rejected', 'suspended')
  ),
  eligibility_score INTEGER,
  eligibility_decision TEXT,
  eligibility_reasons JSONB DEFAULT '[]',
  eligibility_flags JSONB DEFAULT '[]',
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  resubmit_count INTEGER DEFAULT 0,
  
  -- Internal Mobility (from V6)
  visible_to_current_brand BOOLEAN DEFAULT FALSE,
  internal_mobility_interest BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_talents_profile_id ON talents(profile_id);
CREATE INDEX idx_talents_role_level ON talents(current_role_level);
CREATE INDEX idx_talents_location ON talents(current_location);
CREATE INDEX idx_talents_status ON talents(status);
CREATE INDEX idx_talents_employer ON talents(current_employer);

CREATE TRIGGER set_talents_updated_at
  BEFORE UPDATE ON talents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 5: EXPERIENCE BLOCKS (with V6 store context)
-- ============================================================================
CREATE TABLE experience_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  
  -- Block Type
  block_type TEXT NOT NULL CHECK (block_type IN (
    'foh', 'boh', 'leadership', 'clienteling', 'operations', 'business'
  )),
  
  -- Position Details
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  brand_segment TEXT CHECK (brand_segment IN (
    'ultra_luxury', 'luxury', 'premium', 'accessible_luxury'
  )),
  division TEXT CHECK (division IN (
    'fashion', 'leather_goods', 'shoes', 'beauty', 'fragrance',
    'watches', 'high_jewelry', 'eyewear', 'accessories'
  )),
  role_level TEXT CHECK (role_level IN ('L1','L2','L3','L4','L5','L6','L7','L8')),
  store_tier TEXT CHECK (store_tier IN ('T1','T2','T3','T4','T5')),
  location TEXT,
  
  -- Store Context (10 dimensions from V6)
  store_context JSONB DEFAULT NULL,
  -- Structure: { format, surface, team_size, daily_traffic, revenue_scale,
  --              product_complexity, sku_depth, client_profile, operating_hours, org_model }
  
  -- Position Scope (from V6)
  position_scope JSONB DEFAULT NULL,
  -- Structure: { management_span, foh_boh_split, responsibilities, reports_to }
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  
  -- Details
  responsibilities TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  skills_demonstrated TEXT[] DEFAULT '{}',
  team_size INTEGER CHECK (team_size >= 0),
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_experience_blocks_talent_id ON experience_blocks(talent_id);
CREATE INDEX idx_experience_blocks_type ON experience_blocks(block_type);
CREATE INDEX idx_experience_blocks_company ON experience_blocks(company);

CREATE TRIGGER set_experience_blocks_updated_at
  BEFORE UPDATE ON experience_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 6: ASSESSMENTS (6D - individual columns for better querying)
-- ============================================================================
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  
  version TEXT NOT NULL DEFAULT 'v7',
  
  -- 6D Scores (0-100)
  product_knowledge_score INTEGER CHECK (product_knowledge_score >= 0 AND product_knowledge_score <= 100),
  clienteling_score INTEGER CHECK (clienteling_score >= 0 AND clienteling_score <= 100),
  cultural_fluency_score INTEGER CHECK (cultural_fluency_score >= 0 AND cultural_fluency_score <= 100),
  sales_performance_score INTEGER CHECK (sales_performance_score >= 0 AND sales_performance_score <= 100),
  leadership_score INTEGER CHECK (leadership_score >= 0 AND leadership_score <= 100),
  operations_score INTEGER CHECK (operations_score >= 0 AND operations_score <= 100),
  
  -- JSONB for dimension breakdown (backwards compatible)
  dimension_scores JSONB DEFAULT '{}',
  
  -- Overall
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  overall_level TEXT CHECK (overall_level IN ('developing', 'proficient', 'advanced', 'expert')),
  
  -- Raw responses
  responses JSONB,
  insights JSONB DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')),
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_talent_id ON assessments(talent_id);
CREATE INDEX idx_assessments_status ON assessments(status);

CREATE TRIGGER set_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 7: BRANDS
-- ============================================================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Identity
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  segment TEXT CHECK (segment IN ('ultra_luxury', 'luxury', 'premium', 'accessible_luxury')),
  parent_group TEXT,
  
  -- Divisions
  primary_division TEXT CHECK (primary_division IN (
    'fashion', 'leather_goods', 'shoes', 'beauty', 'fragrance',
    'watches', 'high_jewelry', 'eyewear', 'accessories'
  )),
  divisions TEXT[] DEFAULT '{}',
  
  -- Contact
  headquarters_location TEXT,
  contact_name TEXT,
  contact_role TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- White-label branding (from V6)
  branding JSONB DEFAULT '{
    "logo_url": null,
    "primary_color": "#B8A068",
    "secondary_color": "#9A8052",
    "font_family": null,
    "background_style": "default",
    "custom_domain": null,
    "hide_ts_branding": false
  }',
  
  verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_profile_id ON brands(profile_id);
CREATE INDEX idx_brands_segment ON brands(segment);
CREATE INDEX idx_brands_name ON brands(name);

CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 8: STORES (with context fingerprint from V6)
-- ============================================================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  code TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('T1','T2','T3','T4','T5')),
  
  -- Location
  address TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT CHECK (region IN ('EMEA', 'Americas', 'APAC', 'Middle_East')),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Details
  store_size_sqm INTEGER CHECK (store_size_sqm > 0),
  team_size INTEGER CHECK (team_size > 0),
  divisions TEXT[] DEFAULT '{}',
  
  -- Context Fingerprint (10 dimensions from V6)
  context_fingerprint JSONB DEFAULT NULL,
  -- Structure: { format, surface, team_size, daily_traffic, revenue_scale,
  --              product_complexity, sku_depth, client_profile, operating_hours, org_model }
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'opening_soon', 'inactive')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stores_brand_id ON stores(brand_id);
CREATE INDEX idx_stores_tier ON stores(tier);
CREATE INDEX idx_stores_region ON stores(region);
CREATE INDEX idx_stores_city ON stores(city);

CREATE TRIGGER set_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 9: BRAND ASSESSMENTS
-- ============================================================================
CREATE TABLE brand_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  estimated_duration_minutes INTEGER DEFAULT 15,
  is_mandatory BOOLEAN DEFAULT FALSE,
  passing_score INTEGER DEFAULT 60,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brand_assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES brand_assessments(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('mcq', 'scale', 'situational', 'open')),
  options JSONB,
  max_score INTEGER DEFAULT 10,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE talent_brand_assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES brand_assessments(id) ON DELETE CASCADE,
  
  score INTEGER,
  max_possible_score INTEGER,
  passed BOOLEAN,
  responses JSONB,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(talent_id, assessment_id)
);

-- ============================================================================
-- PART 10: OPPORTUNITIES (with capability requirements)
-- ============================================================================
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  role_level TEXT NOT NULL CHECK (role_level IN ('L1','L2','L3','L4','L5','L6','L7','L8')),
  division TEXT CHECK (division IN (
    'fashion', 'leather_goods', 'shoes', 'beauty', 'fragrance',
    'watches', 'high_jewelry', 'eyewear', 'accessories'
  )),
  
  -- Requirements
  required_experience_years INTEGER CHECK (required_experience_years >= 0),
  required_languages TEXT[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',
  
  -- 6D Capability Requirements (from V6)
  capability_requirements JSONB DEFAULT '{
    "product_knowledge": {"minimum": null, "importance": 3},
    "clienteling": {"minimum": null, "importance": 3},
    "cultural_fluency": {"minimum": null, "importance": 3},
    "sales_performance": {"minimum": null, "importance": 3},
    "leadership": {"minimum": null, "importance": 3},
    "operations": {"minimum": null, "importance": 3}
  }',
  
  -- Description
  description TEXT,
  responsibilities TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  
  -- Compensation (never exposed)
  compensation_range JSONB DEFAULT '{
    "min_base": null,
    "max_base": null,
    "variable_pct": null,
    "currency": "EUR"
  }',
  
  -- Brand Assessment
  brand_assessment_id UUID REFERENCES brand_assessments(id),
  brand_assessment_required BOOLEAN DEFAULT FALSE,
  
  -- Matching Criteria
  matching_criteria JSONB DEFAULT '{
    "preferred_maisons": [],
    "preferred_divisions": [],
    "weight_overrides": {}
  }',
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'filled', 'cancelled')),
  published_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_brand_id ON opportunities(brand_id);
CREATE INDEX idx_opportunities_store_id ON opportunities(store_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_role_level ON opportunities(role_level);

CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 11: MATCHES (8D scoring)
-- ============================================================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  
  -- 8D Score
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  
  -- 8D Breakdown
  score_breakdown JSONB DEFAULT '{
    "role_fit": 0,
    "division_fit": 0,
    "store_context": 0,
    "capability_fit": 0,
    "geography": 0,
    "experience_block": 0,
    "preference": 0,
    "brand_assessment": 0
  }',
  
  -- Compensation alignment
  compensation_alignment TEXT CHECK (compensation_alignment IN ('within_range', 'above_range', 'below_range', 'unknown')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'matched' CHECK (status IN (
    'matched', 'interested', 'screening', 'interviewing', 
    'offer', 'hired', 'declined', 'expired'
  )),
  
  -- Actions
  talent_action TEXT CHECK (talent_action IN ('interested', 'declined')),
  talent_action_at TIMESTAMPTZ,
  brand_action TEXT CHECK (brand_action IN ('interested', 'declined')),
  brand_action_at TIMESTAMPTZ,
  
  brand_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(talent_id, opportunity_id)
);

CREATE INDEX idx_matches_talent_id ON matches(talent_id);
CREATE INDEX idx_matches_opportunity_id ON matches(opportunity_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_score ON matches(match_score DESC);

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 12: BRAND TEAM MANAGEMENT
-- ============================================================================
CREATE TABLE brand_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'recruiter', 'viewer')),
  
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'deactivated')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(brand_id, profile_id)
);

CREATE TABLE brand_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'recruiter', 'viewer')),
  
  invited_by UUID REFERENCES profiles(id),
  token TEXT UNIQUE,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 13: MESSAGING
-- ============================================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  
  title TEXT,
  
  last_message_at TIMESTAMPTZ,
  talent_unread_count INTEGER DEFAULT 0,
  brand_unread_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(talent_id, brand_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  sender_type TEXT NOT NULL CHECK (sender_type IN ('talent', 'brand')),
  sender_id UUID NOT NULL,
  
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
  metadata JSONB DEFAULT '{}',
  
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_talent_id ON conversations(talent_id);
CREATE INDEX idx_conversations_brand_id ON conversations(brand_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 14: NETWORKING
-- ============================================================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  connected_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  UNIQUE(talent_id, connected_id),
  CHECK (talent_id != connected_id)
);

CREATE TABLE endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  endorser_id UUID REFERENCES talents(id) ON DELETE SET NULL,
  
  skill TEXT NOT NULL,
  message TEXT,
  
  -- External endorsement (if endorser is not on platform)
  endorser_name TEXT,
  endorser_email TEXT,
  endorser_relationship TEXT,
  
  verification_token TEXT UNIQUE,
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE talent_visibility_settings (
  talent_id UUID PRIMARY KEY REFERENCES talents(id) ON DELETE CASCADE,
  
  visible_to_same_maison BOOLEAN DEFAULT FALSE,
  visible_to_same_group BOOLEAN DEFAULT FALSE,
  share_full_name BOOLEAN DEFAULT TRUE,
  share_current_role BOOLEAN DEFAULT TRUE,
  share_location BOOLEAN DEFAULT TRUE,
  share_divisions BOOLEAN DEFAULT TRUE,
  share_years_experience BOOLEAN DEFAULT FALSE,
  accept_connection_requests BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 15: NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  
  read_at TIMESTAMPTZ,
  sent_email BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- ============================================================================
-- PART 16: LEARNING
-- ============================================================================
CREATE TABLE learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'product_knowledge', 'clienteling', 'cultural_fluency',
    'sales_performance', 'leadership', 'operations'
  )),
  
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'article', 'exercise', 'quiz')),
  content_url TEXT,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  
  target_role_levels TEXT[] DEFAULT '{}',
  target_gaps TEXT[] DEFAULT '{}',
  
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  
  completed_modules INTEGER DEFAULT 0,
  minutes_spent INTEGER DEFAULT 0,
  
  quiz_score INTEGER CHECK (quiz_score >= 0 AND quiz_score <= 100),
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(talent_id, module_id)
);

CREATE INDEX idx_learning_modules_category ON learning_modules(category);
CREATE INDEX idx_learning_progress_talent_id ON learning_progress(talent_id);

-- ============================================================================
-- PART 17: LUXURY GROUPS (Seed Data)
-- ============================================================================
CREATE TABLE luxury_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  maisons TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO luxury_groups (name, maisons) VALUES
('LVMH', ARRAY['Louis Vuitton', 'Dior', 'Fendi', 'Celine', 'Loewe', 'Givenchy', 'Kenzo', 'Berluti', 'Loro Piana', 'Rimowa', 'Tiffany & Co.', 'Bulgari', 'TAG Heuer', 'Zenith', 'Hublot', 'Sephora', 'Le Bon Marché']),
('Kering', ARRAY['Gucci', 'Saint Laurent', 'Bottega Veneta', 'Balenciaga', 'Alexander McQueen', 'Brioni', 'Boucheron', 'Pomellato', 'Qeelin']),
('Richemont', ARRAY['Cartier', 'Van Cleef & Arpels', 'Piaget', 'Vacheron Constantin', 'Jaeger-LeCoultre', 'IWC', 'Panerai', 'Montblanc', 'Chloé', 'Dunhill', 'Alaïa']),
('Hermès', ARRAY['Hermès']),
('Chanel', ARRAY['Chanel']),
('Prada Group', ARRAY['Prada', 'Miu Miu', 'Church''s', 'Car Shoe']),
('Capri Holdings', ARRAY['Versace', 'Jimmy Choo', 'Michael Kors']),
('Tapestry', ARRAY['Coach', 'Kate Spade', 'Stuart Weitzman']);

-- ============================================================================
-- PART 18: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE talents ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_brand_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_visibility_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE luxury_groups ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "System can insert profile" ON profiles FOR INSERT WITH CHECK (true);

-- Talents: Own record management
CREATE POLICY "Talents view own" ON talents FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Talents update own" ON talents FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Talents insert own" ON talents FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Brands: Owner management
CREATE POLICY "Brand owner view" ON brands FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Brand owner update" ON brands FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Brand owner insert" ON brands FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Experience blocks: Talent ownership
CREATE POLICY "Talent owns experience" ON experience_blocks FOR ALL USING (
  EXISTS (SELECT 1 FROM talents WHERE talents.id = experience_blocks.talent_id AND talents.profile_id = auth.uid())
);

-- Assessments: Talent ownership
CREATE POLICY "Talent owns assessment" ON assessments FOR ALL USING (
  EXISTS (SELECT 1 FROM talents WHERE talents.id = assessments.talent_id AND talents.profile_id = auth.uid())
);

-- Stores: Brand ownership
CREATE POLICY "Brand owns stores" ON stores FOR ALL USING (
  EXISTS (SELECT 1 FROM brands WHERE brands.id = stores.brand_id AND brands.profile_id = auth.uid())
);

-- Opportunities: Active visible, brand manages
CREATE POLICY "Active opportunities visible" ON opportunities FOR SELECT USING (status = 'active');
CREATE POLICY "Brand manages opportunities" ON opportunities FOR ALL USING (
  EXISTS (SELECT 1 FROM brands WHERE brands.id = opportunities.brand_id AND brands.profile_id = auth.uid())
);

-- Matches: Both parties can view
CREATE POLICY "Talent views matches" ON matches FOR SELECT USING (
  EXISTS (SELECT 1 FROM talents WHERE talents.id = matches.talent_id AND talents.profile_id = auth.uid())
);
CREATE POLICY "Brand views matches" ON matches FOR SELECT USING (
  EXISTS (SELECT 1 FROM opportunities o JOIN brands b ON o.brand_id = b.id 
          WHERE o.id = matches.opportunity_id AND b.profile_id = auth.uid())
);

-- Notifications: Own only
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Learning modules: Public read
CREATE POLICY "Learning modules public" ON learning_modules FOR SELECT USING (true);

-- Luxury groups: Public read
CREATE POLICY "Luxury groups public" ON luxury_groups FOR SELECT USING (true);

-- ============================================================================
-- END OF V7 UNIFIED SCHEMA
-- ============================================================================
