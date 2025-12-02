# HANDOFF PROMPT — TAILOR SHIFT V7

> **Status:** READY FOR INITIALIZATION
> **Version:** 7.0
> **Date:** December 2025

You are an expert full-stack developer specializing in **Next.js 15, Supabase, and Tailwind CSS**. Your mission is to initialize and build **Tailor Shift V7**, the next evolution of the luxury retail recruitment platform.

---

## 1. PROJECT CONTEXT

Tailor Shift connects luxury retail professionals with premium maisons through intelligent matching, 6D capability assessment, and privacy-first design.

**Core Principles:**
1. **Privacy by Design** (No public profiles, data minimization)
2. **Deterministic Intelligence** (Explainable scoring, no "AI black boxes")
3. **Quiet Luxury UX** (Minimal, spacious, refined — inspired by Smythson/Moynat)
4. **Server-First Architecture** (Next.js Server Components + Server Actions)

---

## 2. KEY RESOURCES

You have access to the following documentation in the `docs/` folder:
1. **`V7_MASTER.md`**: The master specification (Tech Stack, Database Schema, Routes, Engines, Slices).
2. **`ASSESSMENT_MATRIX_V7.md`**: The complete 6D capability framework and question bank.
3. **`wireframes/`**: Visual references for key flows (PNGs exported from Visily).
4. **`logos/`**: Brand assets.

---

## 3. TECH STACK

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase PostgreSQL (Managed, RLS)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS (Custom design system)
- **Maps:** react-simple-maps
- **Email:** Resend
- **i18n:** next-intl (English default + French)

---

## 4. DEVELOPMENT PLAN (SLICES)

You will execute the project in 10 strict slices as defined in `V7_MASTER.md`:

1. **Foundation** (Setup, Design System, Auth)
2. **Talent Core** (Onboarding, Dashboard, Profile)
3. **Brand Core** (Onboarding, Dashboard, Stores, Map)
4. **Assessment** (6D Talent, Brand Custom)
5. **Matching** (8D Engine, Display, Interest)
6. **Pipeline & Team** (Pipeline stages, invite team)
7. **Networking & Endorsements** (Connect talents)
8. **Messaging** (Chat after mutual interest)
9. **Learning & Projection** (View recommendations)
10. **Polish & i18n** (French, responsive, analytics)

---

## 5. INITIALIZATION INSTRUCTIONS

1. **Review `V7_MASTER.md`** to understand the full scope and database schema.
2. **Initialize the Next.js 15 project** (if not already done).
3. **Set up Supabase** (local or cloud) and apply the initial schema from `V7_MASTER.md`.
4. **Configure Tailwind CSS** with the design tokens (Colors, Typography) from Section 5 of `V7_MASTER.md`.
5. **Begin implementation of Slice 1** (Foundation).

**IMPORTANT:**
- Always refer to `V7_MASTER.md` for the single source of truth.
- Use the `ASSESSMENT_MATRIX_V7.md` logic when building the Assessment Engine (Slice 4).
- Consult the `wireframes/` folder for UI guidance.

---

*Let's build the future of luxury retail recruitment.*
