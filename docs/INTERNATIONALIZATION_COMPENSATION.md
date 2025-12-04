# Compensation Form Internationalization

## Overview

The talent onboarding compensation step has been internationalized to support TailorShift's global platform. This document outlines all changes made from French-specific terminology to universally understood global equivalents.

## Changes Made

### 1. Contract Types

| Old (French) | New (Global) | ID |
|--------------|--------------|-----|
| CDI | **Permanent** | `permanent` |
| CDD | **Fixed-Term** | `fixed_term` |
| Intérim | **Temporary / Agency** | `temporary` |
| Freelance | **Freelance / Contractor** | `freelance` |

### 2. Brand Segments

Updated with more examples and ellipsis ("...") to indicate additional brands:

| Segment | Examples |
|---------|----------|
| Ultra Luxury | Hermès, Chanel, Brunello Cucinelli... |
| Luxury | Louis Vuitton, Dior, Gucci, Prada... |
| Premium | Ralph Lauren, Coach, Michael Kors... |
| Accessible Luxury | ba&sh, Maje, Sandro, Zadig & Voltaire... |

### 3. Location Selection (Country → City)

**Old System:**
- Flat region dropdown with French-centric options (`france_paris`, `france_province`, `suisse`, etc.)

**New System:**
- 2-step hierarchical selection:
  1. **Country** (required) - Grouped by region with search
  2. **City** (optional) - Shows salary premium indicators

**Features:**
- 📍 Popular countries shown first (France, UAE, UK, Switzerland, Hong Kong)
- 🔍 Searchable dropdown
- 🌍 Grouped by region (Europe, Middle East, Asia Pacific, Americas)
- 💰 Salary premium displayed on city chips (e.g., "+15-25%", "tax-free")

### 4. Benefits

| Old (French) | New (Global) | ID |
|--------------|--------------|-----|
| Staff Discount | Staff Discount | `staff_discount` |
| Uniform / Allowance | **Clothing Allowance** | `clothing_allowance` |
| Tickets Restaurant | **Meal Benefits** | `meal_benefits` |
| Mutuelle | **Health Insurance** | `health_insurance` |
| Phone / Transport | **Commute Support** | `commute_support` |
| Private Sales Access | Private Sales Access | `private_sales` |
| 13th Month | **Annual Bonus** | `annual_bonus` |
| Participation / Intéressement | **Profit Sharing** | `profit_sharing` |
| *(new)* | **Wellness Benefits** | `wellness_benefits` |
| *(new)* | **Retirement Plan** | `retirement_plan` |
| *(new)* | **Relocation Support** | `relocation_support` |

## Files Modified

| File | Changes |
|------|---------|
| [`lib/data/locations.ts`](../lib/data/locations.ts) | **NEW** - Countries/cities data with 60+ countries |
| [`app/talent/onboarding/steps/step-compensation.tsx`](../app/talent/onboarding/steps/step-compensation.tsx) | Updated constants, new location selector UI |
| [`app/talent/onboarding/page.tsx`](../app/talent/onboarding/page.tsx) | Added `compensation_country`, `compensation_city` to interface |
| [`supabase/migrations/005_internationalize_compensation.sql`](../supabase/migrations/005_internationalize_compensation.sql) | **NEW** - Migration for existing data |

## Database Migration

The migration (`005_internationalize_compensation.sql`) handles:

1. **Contract type migration**: Automatically converts `cdi`→`permanent`, `cdd`→`fixed_term`, etc.
2. **Region to Country/City**: Maps old `compensation_region` to new `compensation_country` + `compensation_city`
3. **Benefits renaming**: Updates benefit IDs to global equivalents

### Run Migration

```sql
-- The migration runs automatically, but can also be run manually:
SELECT migrate_compensation_data(compensation_profile) 
FROM talents 
WHERE compensation_profile IS NOT NULL;
```

## UX Considerations

### Form Completion Time Target: < 90 seconds

The new location selector is optimized for speed:
- Popular countries shown first
- Search functionality for quick access
- City selection is **optional** (only refines benchmark)
- Salary premium indicators help users decide

### Country → City Flow

```
┌─────────────────────────────────────────────────┐
│  Country  [🇫🇷 France ▾]                        │
│                                                 │
│  City (optional)                                │
│  ┌────────┐ ┌────────┐ ┌──────────────────┐    │
│  │ Paris  │ │ Lyon   │ │ Nice/Côte d'Azur │    │
│  │+15-25% │ │Baseline│ │ +5-10%           │    │
│  └────────┘ └────────┘ └──────────────────────┘ │
│                                                 │
│  💡 Major cities often have +15-60% premium    │
└─────────────────────────────────────────────────┘
```

## Coverage

### Countries by Region

| Region | Countries |
|--------|-----------|
| Europe | France, UK, Switzerland, Italy, Germany, Spain, Netherlands, Belgium, Austria, Monaco, Portugal, Greece, Sweden, Denmark, Norway, Ireland, Russia, Turkey |
| Middle East | UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Israel |
| Asia Pacific | Hong Kong, Singapore, Japan, China, South Korea, Taiwan, Macau, Australia, New Zealand, Thailand, Malaysia, Indonesia, Vietnam, Philippines, India |
| Americas | USA, Canada, Mexico, Brazil, Argentina, Chile, Colombia, Caribbean |

### Total Coverage
- **40+ countries** with cities
- **150+ cities** with salary premium data
- **Major luxury retail hubs** prioritized

## Backwards Compatibility

- Legacy `compensation_region` field is preserved
- Old contract types (`cdi`, `cdd`, etc.) are auto-migrated
- Old benefit IDs are auto-migrated
- Existing data is not lost during migration