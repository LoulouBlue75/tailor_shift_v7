# Tailor Shift V7

> **The refined platform for luxury retail careers**  
> Connect luxury retail professionals with premium maisons through intelligent matching.

---

## 🎯 Vision

Tailor Shift is a talent platform designed specifically for the luxury retail industry. It uses a 6D Assessment and 8D Matching engine to connect professionals with maisons who value their expertise.

### Key Features

- **6D Assessment** — Service Excellence, Leadership, Image & Brand, Operations, Business Development, Learning Agility
- **8D Matching** — Multi-dimensional scoring for precise talent-opportunity fit
- **Interactive Maps** — Visualize stores and opportunities globally
- **Brand Custom Assessments** — Maisons can create their own evaluation criteria
- **Talent Pipeline** — Kanban-style hiring workflow
- **Team Collaboration** — Multi-user brand accounts
- **Networking** — Talent-to-talent connections within luxury groups
- **Messaging** — Direct communication after mutual interest

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [V7_MASTER.md](docs/V7_MASTER.md) | Complete specification |
| [WIREFRAMES_PROMPTS.md](docs/WIREFRAMES_PROMPTS.md) | Visily prompts for all 45+ pages |
| docs/wireframes/ | Exported wireframe images |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier OK)
- Vercel account (for deployment)

### 1. Clone & Install

```bash
cd tailor_shift_v7
npm install
```

### 2. Setup Environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Database

Run migrations in your Supabase project:

```bash
# Using Supabase CLI
supabase db push
```

Or apply manually in Supabase SQL Editor from `supabase/migrations/`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
tailor_shift_v7/
├── app/                    # Next.js App Router
│   ├── [locale]/           # i18n routing
│   │   ├── (public)/       # Public pages
│   │   ├── (talent)/       # Talent protected routes
│   │   └── (brand)/        # Brand protected routes
│   └── auth/               # Auth callbacks
├── components/
│   ├── ui/                 # Design system
│   └── [domain]/           # Feature components
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── engines/            # Business logic
│   └── utils/              # Helpers
├── data/                   # Constants, templates
├── dictionaries/           # i18n translations
└── supabase/migrations/    # DB migrations
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background | #FFFFFF | Primary |
| Ivory | #FAF8F4 | Secondary background |
| Charcoal | #1A1A1A | Text |
| Gold | #B8A068 | Accent (max 5%) |

**Typography:**
- Headings: Cormorant Garamond
- Body: Inter

**Principle:** 70%+ white space, minimal decoration, Smythson/Moynat inspired.

---

## 🔧 Development Slices

V7 is built in 10 vertical slices, each validated E2E before proceeding:

| # | Slice | Status |
|---|-------|--------|
| 1 | Foundation (Setup, Design System, Auth) | ⬜ |
| 2 | Talent Core (Onboarding, Dashboard, Profile) | ⬜ |
| 3 | Brand Core (Onboarding, Dashboard, Stores, Map) | ⬜ |
| 4 | Assessment (6D Talent, Brand Custom) | ⬜ |
| 5 | Matching (8D Engine, Display, Interest) | ⬜ |
| 6 | Pipeline & Team | ⬜ |
| 7 | Networking & Endorsements | ⬜ |
| 8 | Messaging | ⬜ |
| 9 | Learning & Projection | ⬜ |
| 10 | Polish & i18n | ⬜ |

---

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth & DB:** Supabase
- **Styling:** Tailwind CSS
- **Maps:** react-simple-maps
- **i18n:** next-intl
- **Hosting:** Vercel

---

## 🔐 Security

- Row Level Security (RLS) on all tables
- Compensation data never exposed to frontend
- Assessment answers deleted after scoring
- HTTPS only

---

## 📄 License

Proprietary — Irbis Partners

---

## 🏢 About

**Tailor Shift** — An Irbis Partners company  
Executive Search Boutique — Paris  
[www.irbis.fr](https://www.irbis.fr)

SIRET: 831 642 608 00010
