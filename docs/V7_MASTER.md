# Tailor Shift V7 — Master Specification

> **Version:** 7.0  
> **Date:** December 2025  
> **Status:** Pre-Development  
> **Stack:** Next.js 15 + Supabase + Vercel

---

## TABLE OF CONTENTS

1. [Vision & Scope](#1-vision--scope)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [Routes & Pages](#4-routes--pages)
5. [Design System](#5-design-system)
6. [Engines](#6-engines)
7. [Server Actions](#7-server-actions)
8. [Features Detail](#8-features-detail)
9. [MCS Constants](#9-mcs-constants)
10. [Development Slices](#10-development-slices)

---

## 1. VISION & SCOPE

### 1.1 Mission
Connect luxury retail professionals with premium maisons through intelligent matching, personalized development, and professional networking.

### 1.2 Core Principles
1. **Privacy by Design** — Compensation never exposed, data minimization
2. **Deterministic Intelligence** — Explainable scoring, no black boxes
3. **Quiet Luxury UX** — Minimal, spacious, refined (Smythson/Moynat inspired)
4. **Server-First** — Server Components + Actions, minimal client state
5. **Validation Continue** — Each page tested before moving to next

### 1.3 V7 Feature Set (Full Scope)

| Domain | Features |
|--------|----------|
| **Auth** | Email/Password, Google, LinkedIn, Type selection |
| **Talent Core** | Onboarding 7 steps, Dashboard, Profile, Experience blocks |
| **Brand Core** | Onboarding 4 steps, Dashboard, Stores, Opportunities |
| **Assessment** | 6D Talent Assessment, Brand Custom Assessments |
| **Matching** | 8D Engine, Match display, Interest expression |
| **Pipeline** | Talent pipeline stages (Saved → Hired) |
| **Team** | Brand multi-user collaboration |
| **Networking** | Talent connections, Visibility settings, Luxury groups |
| **Messaging** | Conversations after mutual interest |
| **Notifications** | In-app + Email notifications |
| **Learning** | Module recommendations, Progress tracking |
| **Endorsements** | Skill validation by peers |
| **Maps** | Interactive store/opportunity maps |
| **i18n** | English (default) + French |

---

## 2. TECH STACK

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 15 (App Router) | Server Components, Server Actions |
| Auth | Supabase Auth | RLS integration, OAuth |
| Database | Supabase PostgreSQL | Managed, RLS, Realtime |
| Realtime | Supabase Realtime | For messaging |
| Storage | Supabase Storage | Avatars, logos, files |
| Email | Resend | Transactional emails |
| Maps | react-simple-maps | SVG world map |
| Hosting | Vercel | Git-to-deploy |
| Styling | Tailwind CSS | Design tokens |
| i18n | next-intl | Server-first |

### 2.1 Project Structure

```
tailor_shift_v7/
├── app/
│   ├── [locale]/              # i18n routing
│   │   ├── (public)/          # Landing, auth, legal
│   │   ├── (talent)/          # Talent protected routes
│   │   └── (brand)/           # Brand protected routes
│   ├── api/                   # Webhooks only
│   └── auth/                  # Auth callbacks
├── components/
│   ├── ui/                    # Design system primitives
│   ├── layout/                # Header, Footer, Sidebar
│   ├── auth/                  # Auth components
│   ├── talent/                # Talent domain
│   ├── brand/                 # Brand domain
│   ├── matching/              # Match display
│   ├── messaging/             # Chat components
│   ├── network/               # Connection components
│   └── maps/                  # Interactive maps
├── lib/
│   ├── supabase/              # Client configs
│   ├── engines/               # Business logic
│   ├── hooks/                 # React hooks
│   └── utils/                 # Helpers
├── data/
│   ├── mcs/                   # Classification constants
│   ├── assessment/            # Questions bank
│   ├── learning/              # Modules
│   └── templates/             # Opportunity templates
├── dictionaries/              # i18n translations
│   ├── en.json
│   └── fr.json
├── docs/
│   ├── V7_MASTER.md
│   ├── DATABASE.md
│   ├── wireframes/
│   └── stories/
└── supabase/migrations/
```

---

## 3. DATABASE SCHEMA

### 3.1 Tables Overview (18 tables)

```
┌─────────────────────────────────────────────────────────────────┐
│                      CORE USER SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│ profiles ←────── talents ←────── experience_blocks              │
│     │               │                                           │
│     │               ├──────────── assessments                   │
│     │               ├──────────── talent_learning_progress      │
│     │               ├──────────── skill_endorsements            │
│     │               ├──────────── talent_connections            │
│     │               └──────────── talent_visibility_settings    │
│     │                                                           │
│     └────────── brands ←──────── brand_members                  │
│                    │                                            │
│                    ├──────────── stores                         │
│                    ├──────────── opportunities                  │
│                    ├──────────── brand_assessments              │
│                    │               └── brand_assessment_questions│
│                    └──────────── talent_pipeline                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      MATCHING & COMMS                           │
├─────────────────────────────────────────────────────────────────┤
│ matches ←─────── conversations ←─────── messages                │
│                                                                 │
│ talent_brand_assessment_results                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      REFERENCE DATA                             │
├─────────────────────────────────────────────────────────────────┤
│ learning_modules                                                │
│ luxury_groups                                                   │
│ notifications + notification_preferences                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Table Details

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT CHECK (user_type IN ('talent', 'brand')),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'en',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### talents
```sql
CREATE TABLE talents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Identity
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  
  -- Professional
  current_role_level TEXT CHECK (current_role_level IN ('L1','L2','L3','L4','L5','L6','L7','L8')),
  current_store_tier TEXT CHECK (current_store_tier IN ('T1','T2','T3','T4','T5')),
  years_in_luxury INTEGER,
  current_maison TEXT,
  current_location TEXT,
  divisions_expertise TEXT[] DEFAULT '{}',
  
  -- Preferences
  career_preferences JSONB DEFAULT '{}',
  compensation_profile JSONB DEFAULT '{}', -- Never exposed
  
  -- 6D Assessment Summary
  assessment_summary JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'onboarding' CHECK (status IN ('onboarding','pending_review','approved','suspended')),
  profile_completion_pct INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### brands
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  segment TEXT CHECK (segment IN ('ultra_luxury','luxury','premium','accessible_luxury')),
  divisions TEXT[] DEFAULT '{}',
  headquarters_location TEXT,
  
  contact_name TEXT,
  contact_role TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- White-label customization
  branding JSONB DEFAULT '{}',
  
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### stores
```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  code TEXT,
  tier TEXT CHECK (tier IN ('T1','T2','T3','T4','T5')),
  
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT CHECK (region IN ('EMEA','Americas','APAC','Middle_East')),
  address TEXT,
  
  -- Map coordinates
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  divisions TEXT[] DEFAULT '{}',
  team_size INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','opening_soon','inactive')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### opportunities
```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  role_level TEXT NOT NULL CHECK (role_level IN ('L1','L2','L3','L4','L5','L6','L7','L8')),
  division TEXT,
  
  required_experience_years INTEGER,
  required_languages TEXT[] DEFAULT '{}',
  required_capabilities JSONB DEFAULT '{}', -- 6D requirements
  
  compensation_range JSONB DEFAULT '{}', -- Never exposed
  
  description TEXT,
  responsibilities TEXT[] DEFAULT '{}',
  
  -- Brand assessment requirement
  brand_assessment_id UUID REFERENCES brand_assessments(id),
  brand_assessment_required BOOLEAN DEFAULT FALSE,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','paused','filled','cancelled')),
  published_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### matches
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  
  -- 8D Scoring
  score_total INTEGER CHECK (score_total >= 0 AND score_total <= 100),
  score_breakdown JSONB DEFAULT '{}',
  
  compensation_alignment TEXT CHECK (compensation_alignment IN ('within_range','above_range','below_range','unknown')),
  
  -- Status & Actions
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested','talent_interested','brand_interested','mutual','declined_talent','declined_brand','archived')),
  
  talent_action_at TIMESTAMPTZ,
  brand_action_at TIMESTAMPTZ,
  brand_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(talent_id, opportunity_id)
);
```

#### assessments (6D Talent)
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  
  version TEXT DEFAULT 'v1',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  
  scores JSONB DEFAULT '{}', -- 6D scores
  insights JSONB DEFAULT '{}',
  level TEXT CHECK (level IN ('developing','proficient','advanced','expert')),
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### brand_assessments
```sql
CREATE TABLE brand_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  estimated_duration_minutes INTEGER DEFAULT 15,
  is_mandatory BOOLEAN DEFAULT FALSE,
  passing_score INTEGER DEFAULT 60,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brand_assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES brand_assessments(id) ON DELETE CASCADE,
  
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('mcq','scale','situational','open')),
  options JSONB, -- [{value, label, score}]
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
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(talent_id, assessment_id)
);
```

#### talent_pipeline
```sql
CREATE TABLE talent_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  
  stage TEXT DEFAULT 'saved' CHECK (stage IN ('saved','contacted','screening','interviewing','offer','hired','rejected','withdrawn')),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  added_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(brand_id, talent_id, opportunity_id)
);
```

#### brand_members
```sql
CREATE TABLE brand_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('owner','admin','recruiter','viewer')),
  
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','deactivated')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(brand_id, profile_id)
);
```

#### talent_connections
```sql
CREATE TABLE talent_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','blocked')),
  message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
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

CREATE TABLE luxury_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- LVMH, Kering, Richemont
  maisons TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### messaging
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  last_message_at TIMESTAMPTZ,
  talent_unread_count INTEGER DEFAULT 0,
  brand_unread_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','archived','blocked')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(talent_id, brand_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  sender_type TEXT NOT NULL CHECK (sender_type IN ('talent','brand')),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','system','file')),
  metadata JSONB DEFAULT '{}',
  
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- new_match, mutual_interest, new_message, etc.
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  
  read_at TIMESTAMPTZ,
  sent_email BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  email_new_match BOOLEAN DEFAULT TRUE,
  email_mutual_interest BOOLEAN DEFAULT TRUE,
  email_new_message BOOLEAN DEFAULT TRUE,
  email_weekly_digest BOOLEAN DEFAULT TRUE,
  
  in_app_enabled BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### learning
```sql
CREATE TABLE learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('service_excellence','leadership','image_brand','operations','business_development','learning_agility')),
  
  duration_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  content_type TEXT CHECK (content_type IN ('article','video','quiz','exercise')),
  content_url TEXT,
  
  target_role_levels TEXT[] DEFAULT '{}',
  target_gaps TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE talent_learning_progress (
  talent_id UUID REFERENCES talents(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  progress_pct INTEGER DEFAULT 0,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  PRIMARY KEY (talent_id, module_id)
);

CREATE TABLE skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  
  skill_category TEXT NOT NULL,
  endorser_name TEXT NOT NULL,
  endorser_email TEXT NOT NULL,
  endorser_relationship TEXT,
  endorsement_text TEXT,
  
  verification_token TEXT UNIQUE,
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','verified','expired')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE experience_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  
  block_type TEXT NOT NULL CHECK (block_type IN ('foh','boh','leadership','clienteling','operations','business')),
  title TEXT NOT NULL,
  maison TEXT,
  location TEXT,
  
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  
  role_level TEXT CHECK (role_level IN ('L1','L2','L3','L4','L5','L6','L7','L8')),
  store_tier TEXT CHECK (store_tier IN ('T1','T2','T3','T4','T5')),
  divisions_handled TEXT[] DEFAULT '{}',
  
  description TEXT,
  achievements TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. ROUTES & PAGES

### 4.1 Public Routes (9)
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/professionals` | Talent value proposition |
| `/brands` | Brand value proposition |
| `/login` | Sign in |
| `/signup` | Registration + type selection |
| `/forgot-password` | Password reset request |
| `/auth/callback` | OAuth callback |
| `/terms` | Terms of service |
| `/privacy` | Privacy policy |

### 4.2 Talent Routes (20)
| Route | Purpose |
|-------|---------|
| `/talent/onboarding` | Welcome/redirect |
| `/talent/onboarding/identity` | Step 2: Name, phone |
| `/talent/onboarding/professional` | Step 3: Role, tier, years |
| `/talent/onboarding/divisions` | Step 4: Divisions expertise |
| `/talent/onboarding/preferences` | Step 5: Career goals |
| `/talent/onboarding/experience` | Step 6: First block |
| `/talent/onboarding/assessment-intro` | Step 7: Assessment intro |
| `/talent/dashboard` | Main hub |
| `/talent/profile` | View profile |
| `/talent/profile/edit` | Edit profile |
| `/talent/profile/experience` | Manage blocks |
| `/talent/profile/experience/new` | Add block |
| `/talent/assessment` | Take assessment |
| `/talent/assessment/results` | View scores |
| `/talent/opportunities` | Browse matches |
| `/talent/opportunities/[id]` | View opportunity |
| `/talent/map` | Interactive map |
| `/talent/learning` | Modules |
| `/talent/network` | Connections |
| `/talent/messages` | Conversations |
| `/talent/notifications` | Notification center |
| `/talent/settings` | Account settings |

### 4.3 Brand Routes (16)
| Route | Purpose |
|-------|---------|
| `/brand/onboarding` | Welcome/redirect |
| `/brand/onboarding/identity` | Brand info |
| `/brand/onboarding/contact` | Contact info |
| `/brand/onboarding/store` | First store |
| `/brand/dashboard` | Main hub |
| `/brand/stores` | Manage stores |
| `/brand/stores/new` | Add store |
| `/brand/stores/[id]` | Store detail |
| `/brand/map` | Interactive store map |
| `/brand/opportunities` | Manage opportunities |
| `/brand/opportunities/new` | Create opportunity |
| `/brand/opportunities/[id]` | Opportunity detail |
| `/brand/opportunities/[id]/matches` | View matches |
| `/brand/pipeline` | Talent pipeline |
| `/brand/assessments` | Custom assessments |
| `/brand/team` | Team members |
| `/brand/messages` | Conversations |
| `/brand/notifications` | Notifications |
| `/brand/analytics` | Analytics dashboard |
| `/brand/settings` | Account + branding |

---

## 5. DESIGN SYSTEM

### 5.1 Colors
| Token | Hex | Usage |
|-------|-----|-------|
| white | #FFFFFF | Primary background |
| ivory | #FAF8F4 | Secondary background |
| charcoal | #1A1A1A | Primary text |
| gold | #B8A068 | Accent (max 5%) |
| gold-dark | #9A8052 | Hover state |
| grey-600 | #666666 | Secondary text |
| grey-400 | #999999 | Placeholder |
| grey-200 | #E5E5E5 | Borders |
| success | #4A7C59 | Positive |
| error | #A65D57 | Error |

### 5.2 Typography
| Element | Font | Weight | Size |
|---------|------|--------|------|
| Display | Cormorant Garamond | 300 | 72px |
| H1 | Cormorant Garamond | 300 | 48px |
| H2 | Cormorant Garamond | 400 | 36px |
| H3 | Inter | 500 | 20px |
| Body | Inter | 400 | 15px |
| Small | Inter | 400 | 13px |
| Caption | Inter | 500 | 11px |

### 5.3 Components
- Button (primary, secondary, text, ghost)
- Input (underline style)
- Card (border only, no shadow)
- Badge
- Modal
- Toast
- Skeleton
- EmptyState

---

## 6. ENGINES

### 6.1 Assessment Engine (6D)

| Dimension | Description |
|-----------|-------------|
| Service Excellence | Client experience delivery |
| Leadership | Team leadership & development |
| Image & Brand | Brand embodiment |
| Operations | Business management |
| Business Development | Strategy & growth |
| Learning Agility | Adaptability |

**Levels:** Developing (0-25) → Proficient (26-50) → Advanced (51-75) → Expert (76-100)

### 6.2 Matching Engine (8D)

| Dimension | Weight | Logic |
|-----------|--------|-------|
| Role Fit | 18% | Level match |
| Division Fit | 18% | Division overlap |
| Store Context | 13% | Tier match |
| Capability Fit | 13% | 6D scores vs requirements |
| Geography | 10% | Location × mobility |
| Experience Block | 10% | Relevant blocks |
| Preference | 8% | Timeline alignment |
| Brand Assessment | 10% | Custom assessment score |

### 6.3 Learning Engine
- Gap identification from 6D scores
- Module matching by category
- Progress tracking

### 6.4 Projection Engine
- Next role calculation
- Readiness assessment
- Timeline estimation

---

## 7. SERVER ACTIONS

### Auth
- signup, login, logout, resetPassword

### Talent
- saveOnboardingStep, updateProfile, createExperienceBlock, updateExperienceBlock, deleteExperienceBlock

### Assessment
- startAssessment, submitAssessment

### Brand
- saveOnboardingStep, updateBrandProfile

### Stores
- createStore, updateStore, deleteStore

### Opportunities
- createOpportunity, updateOpportunity, publishOpportunity, pauseOpportunity

### Brand Assessments
- createBrandAssessment, updateBrandAssessment, publishBrandAssessment

### Matching
- generateMatches, expressInterest

### Pipeline
- saveToPipeline, updateStage, removeFromPipeline

### Team
- inviteMember, updateMemberRole, removeMember

### Networking
- sendConnectionRequest, respondToConnection, updateVisibility

### Messaging
- sendMessage, markAsRead

### Notifications
- markRead, updatePreferences

### Learning
- startModule, completeModule

### Endorsements
- requestEndorsement, verifyEndorsement

---

## 8. FEATURES DETAIL

*(See individual feature docs for detailed specs)*

---

## 9. MCS CONSTANTS

### Role Ladder
| Level | Title | Scope |
|-------|-------|-------|
| L1 | Sales Advisor | Individual contributor |
| L2 | Senior Advisor | IC + mentoring |
| L3 | Team Lead | Small team (3-8) |
| L4 | Department Manager | Department P&L |
| L5 | Assistant Director | Boutique support |
| L6 | Boutique Director | Full P&L |
| L7 | Area Manager | Multi-store (3-10) |
| L8 | Regional Director | Region/Country |

### Store Tiers
| Tier | Description | Team Size |
|------|-------------|-----------|
| T1 | Flagship XXL | 80-200+ |
| T2 | Flagship | 40-80 |
| T3 | Full Format | 20-40 |
| T4 | Boutique | 8-20 |
| T5 | Outlet/Travel | 4-15 |

### Divisions
fashion, leather_goods, shoes, beauty, fragrance, watches, high_jewelry, eyewear, accessories

### Experience Blocks
foh, boh, leadership, clienteling, operations, business

### Regions
EMEA, Americas, APAC, Middle_East

---

## 10. DEVELOPMENT SLICES

| Slice | Focus | Validation |
|-------|-------|------------|
| 1 | Foundation (Setup, Design System, Auth) | Login/Signup E2E |
| 2 | Talent Core (Onboarding, Dashboard, Profile) | Talent journey E2E |
| 3 | Brand Core (Onboarding, Dashboard, Stores, Map) | Brand journey E2E |
| 4 | Assessment (6D Talent, Brand Custom) | Complete assessment E2E |
| 5 | Matching (8D Engine, Display, Interest) | Match visible both sides |
| 6 | Pipeline & Team | Pipeline stages, invite team |
| 7 | Networking & Endorsements | Connect talents |
| 8 | Messaging | Chat after mutual interest |
| 9 | Learning & Projection | View recommendations |
| 10 | Polish & i18n | French, responsive, analytics |

---

*End of V7 Master Specification*
