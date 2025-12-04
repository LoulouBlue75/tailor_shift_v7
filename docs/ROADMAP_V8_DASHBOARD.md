# Roadmap V8 - Dashboard UX/UI Redesign

## Overview

The talent dashboard needs a comprehensive UX/UI redesign in V8 to improve user engagement and provide better insights.

## Current Issues (as of V7.3)

1. **Love Brands Section**: Dream brands selected during onboarding should be prominently displayed
2. **Empty State**: Dashboard shows empty states too frequently
3. **Visual Appeal**: Needs more colors and visual interest
4. **Information Architecture**: Better organization of key metrics

## Planned Improvements

### 1. Dashboard Layout Redesign
- Hero section with personalized greeting and quick stats
- Prominent "Love Brands" showcase with rich visuals
- Activity feed showing recent matches and interactions
- Progress tracker for career goals

### 2. Love Brands Enhancement
- Brand logos display (where available)
- Status indicators (actively hiring, mutual interest, etc.)
- Quick actions (view opportunities, set alerts)
- Match percentage with each brand

### 3. Visual Improvements
- Brand-specific color coding (segment-based)
- Animated progress indicators
- Rich iconography
- Dark mode support

### 4. Data Visualization
- Match history charts
- Profile view analytics
- Market insights (anonymized)

## Technical Notes

- Current data flow: `target_brands` is stored in `career_preferences.target_brands` JSONB column
- Dashboard reads from: `talent?.career_preferences?.target_brands`
- Ensure onboarding saves correctly to this path

## Priority

**Deferred to V8** - Focus V7 on core functionality

## Dependencies

- Design system updates
- Brand logo assets
- Analytics integration