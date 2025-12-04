-- ============================================================================
-- ACCOUNT VALIDATION SYSTEM
-- Migration: 006_account_validation_system.sql
--
-- Adds:
-- 1. Group-level team management (group_team_members)
-- 2. Brand team join requests (brand_team_requests)
-- 3. Profile account status tracking
-- 4. Brand-to-Group linking
-- ============================================================================

-- ============================================================================
-- 1. LUXURY GROUP EXTENSIONS
-- ============================================================================

-- Add status to luxury_groups for active/inactive management
ALTER TABLE luxury_groups ADD COLUMN IF NOT EXISTS 
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add group_id to brands for linking brands to luxury groups
ALTER TABLE brands ADD COLUMN IF NOT EXISTS 
  group_id UUID REFERENCES luxury_groups(id);

-- Add flag for brands that require group-level approval for new owners
ALTER TABLE brands ADD COLUMN IF NOT EXISTS 
  requires_group_approval BOOLEAN DEFAULT false;

-- Index for querying brands by group
CREATE INDEX IF NOT EXISTS idx_brands_group ON brands(group_id);

-- ============================================================================
-- 2. GROUP TEAM MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES luxury_groups(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Role hierarchy: group_owner > group_admin > group_hr > group_viewer
  role VARCHAR(30) NOT NULL CHECK (role IN (
    'group_owner',    -- Supreme authority over all brands in group
    'group_admin',    -- Can validate brand owners, cross-brand management
    'group_hr',       -- Cross-brand recruitment visibility
    'group_viewer'    -- Read-only across all brands
  )),
  
  -- Scope: which brands/regions this role applies to
  role_scope JSONB DEFAULT '{"brands": ["all"], "permissions": ["view"]}',
  
  -- Invitation tracking
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'deactivated')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One membership per user per group
  UNIQUE(group_id, profile_id)
);

-- Indexes for group member queries
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_team_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_profile ON group_team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_team_members(status) WHERE status = 'active';

-- RLS for group_team_members
ALTER TABLE group_team_members ENABLE ROW LEVEL SECURITY;

-- Group members can see their own group's members
CREATE POLICY "Group members view own group" ON group_team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_team_members gtm
      WHERE gtm.group_id = group_team_members.group_id
      AND gtm.profile_id = auth.uid()
      AND gtm.status = 'active'
    )
  );

-- Only group owner/admin can manage group members
CREATE POLICY "Group admin manage members" ON group_team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM group_team_members gtm
      WHERE gtm.group_id = group_team_members.group_id
      AND gtm.profile_id = auth.uid()
      AND gtm.role IN ('group_owner', 'group_admin')
      AND gtm.status = 'active'
    )
  );

-- ============================================================================
-- 3. BRAND TEAM REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_team_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Request details
  email VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL CHECK (department IN ('direction', 'hr', 'operations', 'business')),
  requested_role VARCHAR(50) NOT NULL,
  requested_scope JSONB DEFAULT '{"geographic": "global", "divisions": ["all"]}',
  
  -- Optional context
  job_title VARCHAR(255),
  request_message TEXT,
  
  -- Review workflow
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  
  -- Who reviewed (can be brand owner/admin OR group admin)
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  reviewer_level VARCHAR(20) CHECK (reviewer_level IN ('brand', 'group')), -- Track who approved
  
  -- Assigned values (may differ from requested)
  assigned_role VARCHAR(50),
  assigned_scope JSONB,
  
  -- Group escalation (if brand requires group approval)
  requires_group_approval BOOLEAN DEFAULT false,
  group_approved_by UUID REFERENCES profiles(id),
  group_approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- One pending request per user per brand
  UNIQUE(brand_id, profile_id)
);

-- Indexes for request queries
CREATE INDEX IF NOT EXISTS idx_team_requests_brand_pending 
  ON brand_team_requests(brand_id, status) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_team_requests_profile 
  ON brand_team_requests(profile_id, status);

CREATE INDEX IF NOT EXISTS idx_team_requests_group_pending 
  ON brand_team_requests(requires_group_approval, status) 
  WHERE requires_group_approval = true AND status = 'pending';

CREATE INDEX IF NOT EXISTS idx_team_requests_expires 
  ON brand_team_requests(expires_at) 
  WHERE status = 'pending';

-- RLS for brand_team_requests
ALTER TABLE brand_team_requests ENABLE ROW LEVEL SECURITY;

-- Requesters can see their own requests
CREATE POLICY "Users view own requests" ON brand_team_requests
  FOR SELECT USING (profile_id = auth.uid());

-- Brand owner/admin can see requests for their brand
CREATE POLICY "Brand admin view requests" ON brand_team_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brand_team_members btm
      WHERE btm.brand_id = brand_team_requests.brand_id
      AND btm.profile_id = auth.uid()
      AND btm.role IN ('owner', 'admin_global', 'admin_brand')
    )
  );

-- Group admin can see requests for brands in their group
CREATE POLICY "Group admin view requests" ON brand_team_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brands b
      JOIN group_team_members gtm ON gtm.group_id = b.group_id
      WHERE b.id = brand_team_requests.brand_id
      AND gtm.profile_id = auth.uid()
      AND gtm.role IN ('group_owner', 'group_admin')
      AND gtm.status = 'active'
    )
  );

-- Users can create their own requests
CREATE POLICY "Users create own requests" ON brand_team_requests
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Brand owner/admin can update requests for their brand
CREATE POLICY "Brand admin update requests" ON brand_team_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM brand_team_members btm
      WHERE btm.brand_id = brand_team_requests.brand_id
      AND btm.profile_id = auth.uid()
      AND btm.role IN ('owner', 'admin_global', 'admin_brand')
    )
  );

-- Group admin can update requests for brands in their group
CREATE POLICY "Group admin update requests" ON brand_team_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM brands b
      JOIN group_team_members gtm ON gtm.group_id = b.group_id
      WHERE b.id = brand_team_requests.brand_id
      AND gtm.profile_id = auth.uid()
      AND gtm.role IN ('group_owner', 'group_admin')
      AND gtm.status = 'active'
    )
  );

-- ============================================================================
-- 4. PROFILE EXTENSIONS
-- ============================================================================

-- Add account_status for unified validation tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  account_status VARCHAR(20) DEFAULT 'pending' 
  CHECK (account_status IN ('pending', 'active', 'suspended'));

-- Add pending_team_request_id for brand users awaiting approval
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  pending_team_request_id UUID REFERENCES brand_team_requests(id);

-- Add department for brand users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  department VARCHAR(50) CHECK (department IN ('direction', 'hr', 'operations', 'business', NULL));

-- Index for account status queries
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- ============================================================================
-- 5. UPDATE TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on brand_team_requests
CREATE OR REPLACE FUNCTION update_team_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_team_request_updated_at ON brand_team_requests;
CREATE TRIGGER set_team_request_updated_at
  BEFORE UPDATE ON brand_team_requests
  FOR EACH ROW EXECUTE FUNCTION update_team_request_updated_at();

-- Trigger to update updated_at on group_team_members
DROP TRIGGER IF EXISTS set_group_member_updated_at ON group_team_members;
CREATE TRIGGER set_group_member_updated_at
  BEFORE UPDATE ON group_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. AUTO-EXPIRE PENDING REQUESTS (Optional - can use pg_cron)
-- ============================================================================

-- Function to expire old pending requests
CREATE OR REPLACE FUNCTION expire_pending_team_requests()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE brand_team_requests
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
  AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. HELPER VIEWS
-- ============================================================================

-- View for pending team requests with brand and requester info
CREATE OR REPLACE VIEW pending_team_requests_view WITH (security_invoker = true) AS
SELECT 
  btr.id,
  btr.brand_id,
  btr.profile_id,
  btr.email,
  btr.department,
  btr.requested_role,
  btr.requested_scope,
  btr.job_title,
  btr.request_message,
  btr.created_at,
  btr.expires_at,
  btr.requires_group_approval,
  b.name AS brand_name,
  b.logo_url AS brand_logo,
  b.group_id,
  p.full_name AS requester_name,
  lg.name AS group_name
FROM brand_team_requests btr
JOIN brands b ON b.id = btr.brand_id
JOIN profiles p ON p.id = btr.profile_id
LEFT JOIN luxury_groups lg ON lg.id = b.group_id
WHERE btr.status = 'pending';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================