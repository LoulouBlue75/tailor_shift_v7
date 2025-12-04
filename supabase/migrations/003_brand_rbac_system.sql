-- ============================================================================
-- BRAND RBAC SYSTEM - PHASE 1
-- Migration: 003_brand_rbac_system.sql
--
-- Adds Role-Based Access Control for brand team members
-- Extends brand_team_members with scopes and permissions
-- ============================================================================

-- Add status column to brands table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'brands' AND column_name = 'status') THEN
        ALTER TABLE brands ADD COLUMN status VARCHAR(30) DEFAULT 'onboarding';
    END IF;
END $$;

-- Add verification timestamps to brands table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'brands' AND column_name = 'verified_at') THEN
        ALTER TABLE brands ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'brands' AND column_name = 'verified_by') THEN
        ALTER TABLE brands ADD COLUMN verified_by UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Extend brand_team_members with RBAC fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'brand_team_members' AND column_name = 'role_scope') THEN
        ALTER TABLE brand_team_members ADD COLUMN role_scope JSONB DEFAULT '{
          "geographic": "global",
          "brands": ["all"],
          "permissions": ["read"]
        }';
    END IF;
END $$;

-- Update role constraint to include new roles
ALTER TABLE brand_team_members DROP CONSTRAINT IF EXISTS brand_team_members_role_check;
ALTER TABLE brand_team_members ADD CONSTRAINT brand_team_members_role_check
CHECK (role IN ('owner', 'admin_global', 'admin_brand', 'hr_global', 'hr_regional', 'recruiter', 'manager_store', 'viewer'));

-- Add indexes for RBAC queries
CREATE INDEX IF NOT EXISTS idx_brand_team_scope ON brand_team_members USING GIN (role_scope);
CREATE INDEX IF NOT EXISTS idx_brand_team_role ON brand_team_members(role);
CREATE INDEX IF NOT EXISTS idx_brands_status ON brands(status);

-- Extend brand_invitations with scope
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'brand_invitations' AND column_name = 'role_scope') THEN
        ALTER TABLE brand_invitations ADD COLUMN role_scope JSONB DEFAULT '{
          "geographic": "global",
          "brands": ["all"],
          "permissions": ["read"]
        }';
    END IF;
END $$;

-- Create table for brand contracts (for future monetization)
CREATE TABLE IF NOT EXISTS brand_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  contract_type VARCHAR(50) DEFAULT 'trial', -- 'trial', 'monthly', 'annual', 'pay_per_hire'
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  amount_cents INTEGER,
  currency VARCHAR(3) DEFAULT 'EUR',
  billing_frequency VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annually'
  payment_method VARCHAR(50), -- 'stripe', 'sepa', 'wire_transfer'
  stripe_subscription_id VARCHAR(255),
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by UUID REFERENCES profiles(id),
  document_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, cancelled, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add current_contract_id to brands
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'brands' AND column_name = 'current_contract_id') THEN
        ALTER TABLE brands ADD COLUMN current_contract_id UUID REFERENCES brand_contracts(id);
    END IF;
END $$;

-- Create table for brand invoices
CREATE TABLE IF NOT EXISTS brand_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES brand_contracts(id),
  invoice_number VARCHAR(50) UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
  stripe_invoice_id VARCHAR(255),
  pdf_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for brand_contracts and brand_invoices
ALTER TABLE brand_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_invoices ENABLE ROW LEVEL SECURITY;

-- Brand owners can see their contracts
CREATE POLICY "Brand owners access contracts" ON brand_contracts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_contracts.brand_id
      AND brands.profile_id = auth.uid()
    )
  );

-- Brand owners can see their invoices
CREATE POLICY "Brand owners access invoices" ON brand_invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = brand_invoices.brand_id
      AND brands.profile_id = auth.uid()
    )
  );

-- Add updated_at triggers
CREATE TRIGGER set_brand_contracts_updated_at
  BEFORE UPDATE ON brand_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_contracts_brand_id ON brand_contracts(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_contracts_status ON brand_contracts(status);
CREATE INDEX IF NOT EXISTS idx_brand_invoices_brand_id ON brand_invoices(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_invoices_status ON brand_invoices(status);
CREATE INDEX IF NOT EXISTS idx_brand_invoices_due_date ON brand_invoices(due_date);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================