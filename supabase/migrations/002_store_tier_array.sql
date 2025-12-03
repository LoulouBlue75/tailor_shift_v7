-- ============================================================================
-- TAILOR SHIFT V7 — Store Tier Array Migration
-- Migration: 002_store_tier_array.sql
-- 
-- Adds store_tier_experience array column to support multi-select store tiers
-- ============================================================================

-- Add new array column for store tier experience
ALTER TABLE talents 
ADD COLUMN IF NOT EXISTS store_tier_experience TEXT[] DEFAULT '{}';

-- Migrate existing data from current_store_tier to the new array column
UPDATE talents 
SET store_tier_experience = ARRAY[current_store_tier]
WHERE current_store_tier IS NOT NULL 
  AND (store_tier_experience IS NULL OR store_tier_experience = '{}');

-- Add check constraint for valid tier values in the array
-- Note: This validates each element in the array
ALTER TABLE talents 
ADD CONSTRAINT chk_store_tier_experience_values 
CHECK (
  store_tier_experience <@ ARRAY['T1', 'T2', 'T3', 'T4', 'T5']::TEXT[]
);

-- Create index for array queries
CREATE INDEX IF NOT EXISTS idx_talents_store_tier_experience 
ON talents USING GIN (store_tier_experience);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================