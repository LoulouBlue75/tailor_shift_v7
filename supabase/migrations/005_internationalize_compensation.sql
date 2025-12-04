-- ============================================================================
-- Migration: Internationalize Compensation Data
-- Version: 005
-- Date: 2025-12-04
-- Description: Updates compensation structure for global platform
--              - Adds compensation_country and compensation_city columns
--              - Migrates legacy contract_type values (CDI→permanent, CDD→fixed_term, etc.)
--              - Migrates legacy benefit IDs to global equivalents
--              - Maps old compensation_region to new country/city structure
-- ============================================================================

-- ============================================================================
-- STEP 1: Add new columns to talents table for location
-- ============================================================================

-- Note: compensation data is stored in JSONB compensation_profile column
-- No new columns needed for SQL - the JSONB structure is flexible
-- This migration documents the schema change and provides migration helpers

-- ============================================================================
-- STEP 2: Create helper function to migrate compensation data
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_compensation_data(profile_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
  old_contract_type TEXT;
  old_region TEXT;
  new_contract_type TEXT;
  new_country TEXT;
  new_city TEXT;
  old_benefits TEXT[];
  new_benefits TEXT[];
  benefit TEXT;
BEGIN
  -- Start with existing data
  result := COALESCE(profile_data, '{}'::JSONB);
  
  -- ========================================================================
  -- Migrate contract_type: French → Global terminology
  -- ========================================================================
  old_contract_type := result->>'contract_type';
  
  IF old_contract_type IS NOT NULL THEN
    new_contract_type := CASE old_contract_type
      WHEN 'cdi' THEN 'permanent'
      WHEN 'cdd' THEN 'fixed_term'
      WHEN 'interim' THEN 'temporary'
      WHEN 'freelance' THEN 'freelance'  -- Already global
      ELSE old_contract_type  -- Keep as-is if already migrated or unknown
    END;
    
    result := jsonb_set(result, '{contract_type}', to_jsonb(new_contract_type));
  END IF;
  
  -- ========================================================================
  -- Migrate compensation_region → compensation_country + compensation_city
  -- ========================================================================
  old_region := result->>'compensation_region';
  
  IF old_region IS NOT NULL AND (result->>'compensation_country') IS NULL THEN
    -- Map old region IDs to new country/city
    CASE old_region
      WHEN 'france_paris' THEN
        new_country := 'france';
        new_city := 'paris';
      WHEN 'france_province' THEN
        new_country := 'france';
        new_city := NULL;
      WHEN 'suisse' THEN
        new_country := 'switzerland';
        new_city := NULL;
      WHEN 'uae_dubai' THEN
        new_country := 'uae';
        new_city := 'dubai';
      WHEN 'emea_other' THEN
        new_country := 'other_europe';
        new_city := NULL;
      WHEN 'asia' THEN
        new_country := 'other_asia_pacific';
        new_city := NULL;
      WHEN 'americas' THEN
        new_country := 'other_americas';
        new_city := NULL;
      ELSE
        -- Unknown region, try to parse as country
        new_country := old_region;
        new_city := NULL;
    END CASE;
    
    result := jsonb_set(result, '{compensation_country}', to_jsonb(new_country));
    IF new_city IS NOT NULL THEN
      result := jsonb_set(result, '{compensation_city}', to_jsonb(new_city));
    END IF;
  END IF;
  
  -- ========================================================================
  -- Migrate benefits: French → Global terminology
  -- ========================================================================
  IF result->'current_benefits' IS NOT NULL THEN
    SELECT ARRAY(
      SELECT CASE benefit_item
        -- Luxury retail specific (keep as-is)
        WHEN 'staff_discount' THEN 'staff_discount'
        WHEN 'private_sales' THEN 'private_sales'
        -- Renamed benefits
        WHEN 'uniform' THEN 'clothing_allowance'
        WHEN 'tickets_restaurant' THEN 'meal_benefits'
        WHEN 'mutuelle' THEN 'health_insurance'
        WHEN 'phone_transport' THEN 'commute_support'
        WHEN 'thirteenth_month' THEN 'annual_bonus'
        WHEN 'participation' THEN 'profit_sharing'
        -- Already global (keep as-is)
        ELSE benefit_item
      END
      FROM jsonb_array_elements_text(result->'current_benefits') AS benefit_item
    ) INTO new_benefits;
    
    result := jsonb_set(result, '{current_benefits}', to_jsonb(new_benefits));
  END IF;
  
  RETURN result;
END;
$$;

-- ============================================================================
-- STEP 3: Run migration on existing data
-- ============================================================================

-- Migrate all existing compensation profiles
UPDATE talents
SET compensation_profile = migrate_compensation_data(compensation_profile)
WHERE compensation_profile IS NOT NULL;

-- ============================================================================
-- STEP 4: Create view for compensation analytics
-- ============================================================================

CREATE OR REPLACE VIEW talent_compensation_summary AS
SELECT 
  t.id AS talent_id,
  t.first_name,
  t.last_name,
  t.current_role_level,
  -- Compensation fields
  t.compensation_profile->>'contract_type' AS contract_type,
  t.compensation_profile->>'brand_segment' AS brand_segment,
  t.compensation_profile->>'compensation_country' AS country,
  t.compensation_profile->>'compensation_city' AS city,
  t.compensation_profile->>'compensation_region' AS legacy_region,
  (t.compensation_profile->>'current_base')::INTEGER AS current_base,
  (t.compensation_profile->>'variable_percentage')::INTEGER AS variable_pct,
  (t.compensation_profile->>'has_commission')::BOOLEAN AS has_commission,
  t.compensation_profile->>'currency' AS currency,
  (t.compensation_profile->>'expectations')::INTEGER AS expectations,
  t.compensation_profile->'current_benefits' AS benefits
FROM talents t
WHERE t.compensation_profile IS NOT NULL;

-- ============================================================================
-- STEP 5: Add comments for documentation
-- ============================================================================

COMMENT ON FUNCTION migrate_compensation_data IS 
'Migrates compensation profile data from French-specific to internationalized format.
Handles: contract_type (CDI→permanent, etc.), region→country/city, benefits renaming.';

COMMENT ON VIEW talent_compensation_summary IS 
'Summary view of talent compensation for analytics and matching.
Extracts key fields from JSONB compensation_profile for easier querying.';

-- ============================================================================
-- REFERENCE: Contract Type Mapping
-- ============================================================================
-- Old (French)    | New (Global)
-- ----------------|----------------
-- cdi             | permanent
-- cdd             | fixed_term
-- interim         | temporary
-- freelance       | freelance

-- ============================================================================
-- REFERENCE: Region → Country/City Mapping
-- ============================================================================
-- Old Region       | New Country         | New City
-- -----------------|---------------------|------------
-- france_paris     | france              | paris
-- france_province  | france              | (null)
-- suisse           | switzerland         | (null)
-- uae_dubai        | uae                 | dubai
-- emea_other       | other_europe        | (null)
-- asia             | other_asia_pacific  | (null)
-- americas         | other_americas      | (null)

-- ============================================================================
-- REFERENCE: Benefits Mapping
-- ============================================================================
-- Old (French)              | New (Global)
-- --------------------------|--------------------
-- uniform                   | clothing_allowance
-- tickets_restaurant        | meal_benefits
-- mutuelle                  | health_insurance
-- phone_transport           | commute_support
-- thirteenth_month          | annual_bonus
-- participation             | profit_sharing
-- staff_discount            | staff_discount (unchanged)
-- private_sales             | private_sales (unchanged)

-- Note: New global benefits available:
-- - wellness_benefits (gym, mental health, etc.)
-- - retirement_plan (pension contributions)
-- - relocation_support (moving assistance)