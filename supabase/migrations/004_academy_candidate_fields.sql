-- Migration 004: Academy candidate fields for no-experience talents
-- This migration adds fields to support talents without retail experience
-- who want to join TailorShift Academy

-- ============================================================================
-- EXTEND TALENTS TABLE FOR ACADEMY CANDIDATES
-- ============================================================================

-- Flag indicating talent has no experience but wants to enter retail
ALTER TABLE talents ADD COLUMN IF NOT EXISTS 
  is_academy_candidate BOOLEAN DEFAULT FALSE;

-- When the talent declared interest in Academy
ALTER TABLE talents ADD COLUMN IF NOT EXISTS 
  academy_interest_declared_at TIMESTAMP WITH TIME ZONE;

-- Free-text motivation for wanting to work in luxury retail
ALTER TABLE talents ADD COLUMN IF NOT EXISTS 
  academy_motivation TEXT;

-- Academy pipeline status
-- Values: 'interested', 'waitlisted', 'invited', 'enrolled', 'in_progress', 'graduated', 'dropped'
ALTER TABLE talents ADD COLUMN IF NOT EXISTS 
  academy_status VARCHAR(30);

-- Areas of interest for Academy (fashion, beauty, jewelry, etc.)
ALTER TABLE talents ADD COLUMN IF NOT EXISTS 
  academy_interest_areas TEXT[] DEFAULT '{}';

-- When talent was enrolled in Academy
ALTER TABLE talents ADD COLUMN IF NOT EXISTS 
  academy_enrolled_at TIMESTAMP WITH TIME ZONE;

-- When talent graduated from Academy
ALTER TABLE talents ADD COLUMN IF NOT EXISTS 
  academy_graduation_date TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- INDEXES FOR ACADEMY QUERIES
-- ============================================================================

-- Index for finding Academy candidates
CREATE INDEX IF NOT EXISTS idx_talents_academy_candidate 
  ON talents(is_academy_candidate) 
  WHERE is_academy_candidate = TRUE;

-- Index for filtering by Academy status
CREATE INDEX IF NOT EXISTS idx_talents_academy_status 
  ON talents(academy_status) 
  WHERE academy_status IS NOT NULL;

-- Index for Academy interested talents ordered by sign-up date
CREATE INDEX IF NOT EXISTS idx_talents_academy_waitlist 
  ON talents(academy_interest_declared_at DESC) 
  WHERE is_academy_candidate = TRUE AND academy_status = 'interested';

-- ============================================================================
-- ACADEMY WAITLIST TABLE (for detailed tracking and outreach)
-- ============================================================================

CREATE TABLE IF NOT EXISTS academy_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  
  -- Interest details
  interest_areas TEXT[] DEFAULT '{}',  -- ['fashion', 'beauty', 'jewelry', etc.]
  motivation_text TEXT,
  preferred_language VARCHAR(10) DEFAULT 'fr',
  
  -- Location for future cohorts
  city VARCHAR(100),
  country VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Availability info
  available_start_date DATE,
  commitment_hours_per_week INTEGER,  -- 5, 10, 20, full-time
  
  -- Communication preferences
  notify_by_email BOOLEAN DEFAULT TRUE,
  notify_by_sms BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  -- Values: 'waitlisted', 'invited', 'accepted', 'declined', 'expired'
  status VARCHAR(30) DEFAULT 'waitlisted',
  
  -- When invited to join a cohort
  invited_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Future: link to academy_cohorts table
  cohort_id UUID,
  
  -- Marketing attribution
  source VARCHAR(50) DEFAULT 'onboarding',  -- 'onboarding', 'marketing', 'referral'
  utm_campaign VARCHAR(100),
  referral_code VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One waitlist entry per talent
  UNIQUE(talent_id)
);

-- Index for waitlist outreach queries
CREATE INDEX IF NOT EXISTS idx_academy_waitlist_status 
  ON academy_waitlist(status);

CREATE INDEX IF NOT EXISTS idx_academy_waitlist_created 
  ON academy_waitlist(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_academy_waitlist_interest_areas 
  ON academy_waitlist USING GIN(interest_areas);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN talents.is_academy_candidate IS 
  'True if talent declared no retail experience but interest in entering the field via Academy';

COMMENT ON COLUMN talents.academy_status IS 
  'Academy pipeline status: interested → waitlisted → invited → enrolled → in_progress → graduated/dropped';

COMMENT ON COLUMN talents.academy_interest_areas IS 
  'Areas of luxury retail the talent is interested in: fashion, beauty, jewelry, watches, hospitality';

COMMENT ON TABLE academy_waitlist IS 
  'Detailed waitlist tracking for Academy candidates, used for outreach and cohort management';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE academy_waitlist ENABLE ROW LEVEL SECURITY;

-- Talents can view and update their own waitlist entry
CREATE POLICY "Talents can view own waitlist entry"
  ON academy_waitlist FOR SELECT
  USING (
    talent_id IN (
      SELECT id FROM talents WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Talents can insert own waitlist entry"
  ON academy_waitlist FOR INSERT
  WITH CHECK (
    talent_id IN (
      SELECT id FROM talents WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Talents can update own waitlist entry"
  ON academy_waitlist FOR UPDATE
  USING (
    talent_id IN (
      SELECT id FROM talents WHERE profile_id = auth.uid()
    )
  );

-- Admins can view all waitlist entries (for future admin panel)
CREATE POLICY "Admins can view all waitlist entries"
  ON academy_waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update waitlist entries"
  ON academy_waitlist FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );