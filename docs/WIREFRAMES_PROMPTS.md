# Wireframes Prompts V7 — Visily

> **Instructions:** Copiez chaque prompt dans Visily pour générer les wireframes.  
> **Limite Visily:** ~4000 caractères par prompt.  
> **Style:** Quiet Luxury (Smythson/Moynat inspired)

---

## DESIGN CONTEXT (À inclure dans chaque prompt)

```
STYLE GLOBAL:
- Fond: blanc #FFFFFF
- Texte: charcoal #1A1A1A
- Accent: or #B8A068 (rare, max 5%)
- Typo titres: Cormorant Garamond light
- Typo corps: Inter 15px
- Spacing généreux, 70%+ white space
- Cards: bordure 1px #E5E5E5, pas d'ombre
- Boutons: outline préféré, filled rare
```

---

## PUBLIC PAGES (9 pages)

### 01. Landing Page (/)

```
PAGE: Landing Homepage
TYPE: Marketing public

HEADER: Fixe, fond blanc semi-transparent avec blur
- Gauche: Logo "Tailor Shift" (texte)
- Centre: Nav (Professionals, Brands)
- Droite: "Sign In" (text link) | "Get Started" (bouton outline)

HERO (plein écran moins header):
- Titre centré: "Where luxury meets opportunity" (Cormorant 72px light)
- Sous-titre: "The refined platform for luxury retail careers" (Inter 18px grey)
- 2 boutons centrés côte à côte:
  - "I'm a Professional" (outline)
  - "I'm a Brand" (outline)
- Très minimaliste, fond blanc pur

SECTION VALUE PROPS:
- Titre: "Why Tailor Shift" (Cormorant 36px)
- 3 cards en ligne (desktop), empilées (mobile)
  - Card 1: "Intelligent Matching" + icône + description courte
  - Card 2: "Confidential" + icône + description
  - Card 3: "Luxury Focused" + icône + description
- Cards avec bordure fine, pas d'ombre

SECTION HOW IT WORKS:
- Titre: "How it works"
- 4 étapes numérotées (01, 02, 03, 04)
- Layout horizontal desktop, vertical mobile
- Chaque étape: numéro or + titre + description

CTA SECTION:
- Fond ivory #FAF8F4
- Titre: "Ready to start?"
- Bouton "Create Your Profile" (filled noir)

FOOTER:
- Logo + "An Irbis Partners company"
- Links: Terms, Privacy
- Copyright 2025
```

### 02. For Professionals (/professionals)

```
PAGE: Talent Value Proposition
TYPE: Marketing public

HEADER: Identique landing

HERO:
- Titre: "Shape your career in luxury retail" (Cormorant 48px)
- Sous-titre: "Connect with maisons that value your expertise"
- CTA: "Create Your Profile" (filled)
- Image/illustration thread doré décoratif côté

SECTION 1: Value Props (3 colonnes)
- "6D Assessment" — Understand your strengths across 6 dimensions
- "8D Matching" — Find opportunities that truly fit
- "Confidential" — Your data, your control

SECTION 2: How Assessment Works
- Titre: "Retail Excellence Scan"
- Preview radar chart 6 dimensions (mock)
- Liste: Service Excellence, Leadership, Image & Brand, Operations, Business Dev, Learning Agility
- "15-20 minutes to complete"

SECTION 3: Career Growth
- Titre: "See your path forward"
- Illustration timeline L1 → L8
- "Personalized learning recommendations"

SECTION 4: Testimonial (placeholder)
- Quote placeholder
- "Senior Advisor, Paris"

CTA FINAL:
- "Start your journey"
- Bouton "Sign Up" (filled)

FOOTER: Identique
```

### 03. For Brands (/brands)

```
PAGE: Brand Value Proposition
TYPE: Marketing public

HEADER: Identique

HERO:
- Titre: "Find talent that elevates your boutiques"
- Sous-titre: "Precision matching for luxury retail"
- CTA: "Start Hiring" (filled)
- Image décorative

SECTION 1: Value Props
- "Pre-vetted Talent" — Luxury-focused professionals
- "8D Matching" — Beyond CV keywords
- "Custom Assessments" — Your criteria, your questions

SECTION 2: Interactive Map Preview
- Titre: "Manage your network"
- Mock carte monde avec pins stores
- "Track opportunities across regions"

SECTION 3: Pipeline Management
- Titre: "From match to hire"
- Kanban preview (Saved → Hired)
- "Collaborate with your team"

SECTION 4: Stats
- "500+ luxury professionals"
- "50+ maisons"
- "4 regions"

CTA FINAL:
- "Get started today"
- Bouton

FOOTER: Identique
```

### 04. Login (/login)

```
PAGE: Login
TYPE: Auth form

LAYOUT: Centré verticalement, max-width 400px

HEADER MINIMAL: Logo centré

CARD:
- Titre: "Sign in" (Cormorant 36px)
- Champ Email (underline style)
- Champ Password (underline style)
- Link "Forgot password?" (right aligned, small)
- Bouton "Sign In" (full width, filled noir)
- Divider "or"
- Bouton "Continue with Google" (outline, avec icône)
- Bouton "Continue with LinkedIn" (outline, avec icône)
- Texte bas: "Don't have an account? Sign up"

FOOTER MINIMAL: Terms | Privacy
```

### 05. Signup (/signup)

```
PAGE: Signup with Type Selection
TYPE: Auth form

LAYOUT: Centré, max-width 600px

HEADER MINIMAL: Logo centré

SECTION TYPE SELECTION:
- Titre: "Create your account" (Cormorant 36px)
- Sous-titre: "I am a..."
- 2 cards côte à côte cliquables:
  - Card "Professional" — icône personne — "Looking for opportunities"
  - Card "Brand" — icône boutique — "Looking for talent"
- Card sélectionnée: bordure or #B8A068

SECTION FORM (après sélection):
- Champ Full Name
- Champ Email
- Champ Password (avec requirements: 8+ chars)
- Bouton "Create Account" (filled)
- Divider "or"
- OAuth buttons
- Texte: "Already have an account? Sign in"

FOOTER: Terms, Privacy
```

### 06. Forgot Password (/forgot-password)

```
PAGE: Password Reset Request
TYPE: Auth form

LAYOUT: Centré, max-width 400px

CARD:
- Titre: "Reset password"
- Texte: "Enter your email and we'll send you a reset link"
- Champ Email
- Bouton "Send Reset Link"
- Link "Back to sign in"
```

### 07-09. Terms, Privacy, Auth Callback
*(Pages simples — texte légal ou redirect technique)*

---

## TALENT ONBOARDING (7 steps)

### 10. Onboarding Identity (/talent/onboarding/identity)

```
PAGE: Talent Onboarding Step 2 - Identity
TYPE: Form wizard

HEADER: Logo gauche | Progress "Step 2 of 7" | Exit X

PROGRESS BAR: [●][●][○][○][○][○][○]

CONTENT (centré, max-width 600px):
- Titre: "Tell us about yourself" (Cormorant 36px)
- Sous-titre: "Basic information to get started"

FORM:
- First Name* (underline)
- Last Name* (underline)
- Phone (underline, optional)
- LinkedIn URL (underline, optional)

NAVIGATION:
- Gauche: "Previous" (ghost, disabled car step 2)
- Droite: "Continue" (filled)
```

### 11. Onboarding Professional (/talent/onboarding/professional)

```
PAGE: Talent Onboarding Step 3 - Professional Identity
TYPE: Form wizard

PROGRESS: [●][●][●][○][○][○][○]

CONTENT:
- Titre: "Your current role"
- Sous-titre: "Help us understand your experience level"

FORM:
- Current Role Level* (dropdown L1-L8 avec labels)
- Current Store Tier* (dropdown T1-T5)
- Years in Luxury* (number)
- Current Maison (text, optional)
- Current Location (text avec autocomplete)

NAVIGATION: Previous | Continue
```

### 12. Onboarding Divisions (/talent/onboarding/divisions)

```
PAGE: Talent Onboarding Step 4 - Divisions
TYPE: Multi-select

PROGRESS: [●][●][●][●][○][○][○]

CONTENT:
- Titre: "Your expertise"
- Sous-titre: "Select 1-5 divisions you specialize in"

GRID CHECKBOXES (3 colonnes):
- Fashion
- Leather Goods
- Shoes
- Beauty
- Fragrance
- Watches
- High Jewelry
- Eyewear
- Accessories

Chaque case: checkbox + label, style card mini

NAVIGATION: Previous | Continue
```

### 13. Onboarding Preferences (/talent/onboarding/preferences)

```
PAGE: Talent Onboarding Step 5 - Career Preferences
TYPE: Form wizard

PROGRESS: [●][●][●][●][●][○][○]

CONTENT:
- Titre: "Your career goals"

FORM:
- Target Role Levels (multi-select chips)
- Target Store Tiers (multi-select)
- Target Locations (multi-input avec tags)
- Mobility (radio: Local, Regional, National, International)
- Timeline (radio: Active, Passive, Not Looking)

NAVIGATION: Previous | Continue
```

### 14. Onboarding Experience (/talent/onboarding/experience)

```
PAGE: Talent Onboarding Step 6 - First Experience
TYPE: Form wizard

PROGRESS: [●][●][●][●][●][●][○]

CONTENT:
- Titre: "Add your experience"
- Sous-titre: "Start with your most recent role"

FORM (2 colonnes desktop):
- Block Type* (dropdown: FOH, BOH, Leadership...)
- Title* (text)
- Maison (text)
- Location (text)
- Start Date* (date picker)
- End Date (date) ou checkbox "Current position"
- Role Level (dropdown)
- Store Tier (dropdown)
- Divisions Handled (multi-select)
- Description (textarea)
- Achievements (dynamic list, + Add)

NAVIGATION: Previous | Continue
```

### 15. Onboarding Assessment Intro (/talent/onboarding/assessment-intro)

```
PAGE: Talent Onboarding Step 7 - Assessment Intro
TYPE: Info + CTA

PROGRESS: [●][●][●][●][●][●][●]

CONTENT (centré):
- Titre: "Unlock Your Retail Excellence Profile" (Cormorant 48px)
- Sous-titre: "Complete a 15-minute assessment to understand your strengths"

VISUAL:
- Radar chart preview (6 dimensions, mock data)

BENEFITS LIST:
- ✓ Better opportunity matches
- ✓ Personalized learning recommendations
- ✓ Career progression insights

2 BOUTONS:
- "Start Assessment Now" (filled, primary)
- "Skip for now" (text link, grey)
```

---

## TALENT MAIN PAGES

### 16. Talent Dashboard (/talent/dashboard)

```
PAGE: Talent Dashboard
TYPE: Dashboard

LAYOUT: Sidebar gauche + main content

SIDEBAR:
- Logo
- Nav items (icône + label):
  - Dashboard (active)
  - Opportunities
  - Assessment
  - Learning
  - Network
  - Messages
  - Settings
- User menu bas (avatar + nom)

MAIN:
Header: "Welcome back, [First Name]" + date

GRID 2 colonnes:

ROW 1:
- Card "Profile Completion"
  - Progress bar (65%)
  - Liste actions manquantes
  - "Complete Profile" CTA
- Card "Assessment Status"
  - Si non fait: CTA "Start Assessment"
  - Si fait: 6 scores mini bars + "View Results"

ROW 2 (full width):
- Card "Opportunities for You"
  - Liste 3-5 matches (titre, location, score badge, alignment badge)
  - "View All" link

ROW 3:
- Card "Recommended Learning" (3 modules)
- Card "Career Path" (current → next, readiness badge)
```

### 17-25. Autres pages Talent
*(Assessment flow, Opportunities list/detail, Learning, Network, Messages, Settings — prompts similaires)*

---

## BRAND ONBOARDING (4 steps)

### 26. Brand Onboarding Identity

```
PAGE: Brand Onboarding Step 2 - Brand Identity
TYPE: Form wizard

PROGRESS: [●][●][○][○]

CONTENT:
- Titre: "About your brand"

FORM:
- Brand Name*
- Logo Upload (drag & drop zone)
- Website (URL)
- Segment* (dropdown: Ultra Luxury, Luxury, Premium, Accessible Luxury)
- Divisions (multi-select)
- Headquarters Location

NAVIGATION: Previous | Continue
```

### 27-29. Contact, Store, Done
*(Prompts similaires)*

---

## BRAND MAIN PAGES

### 30. Brand Dashboard

```
PAGE: Brand Dashboard
TYPE: Dashboard

SIDEBAR:
- Logo
- Dashboard
- Stores
- Map
- Opportunities
- Pipeline
- Assessments
- Team
- Messages
- Settings

MAIN:
Header: "[Brand Name] Dashboard" + logo

GRID:

ROW 1:
- Card "Active Opportunities"
  - Liste (titre, store, matches count)
  - "View All"
- Card "Top Matches"
  - Liste talents (anonymized, score)
  - "View All"

ROW 2:
- Card "Your Stores" (grid mini avec map preview)
  - "Manage Stores" link
  - "Add Store" button

ROW 3:
- Card "Quick Actions"
  - Buttons: "Post Opportunity", "Add Store", "Invite Team Member"
```

### 31. Brand Map (/brand/map)

```
PAGE: Brand Interactive Store Map
TYPE: Data visualization

HEADER: Breadcrumb "Dashboard > Stores > Map"

MAIN:
- Carte monde SVG (react-simple-maps style)
- Sidebar/overlay filters:
  - Region dropdown (EMEA, Americas, APAC, Middle East)
  - Tier filter (T1-T5)
  - Status (Active, Opening Soon)
- Pins sur la carte:
  - Couleur or pour T1
  - Gris pour T2-T5
- Clic pin → Popup avec:
  - Store name
  - City, Country
  - Tier badge
  - Active opportunities count
  - "View Store" link

LISTE (panel droit ou bas):
- Liste stores filtrés
- Scroll sync avec carte
```

### 32-45. Autres pages Brand
*(Opportunities CRUD, Pipeline Kanban, Team, Assessments builder, Messages — prompts dérivés)*

---

## PAGES SPÉCIALES

### Talent Map (/talent/map)

```
PAGE: Talent Opportunity Map
TYPE: Data visualization

HEADER: "Opportunities Near You"

MAIN:
- Carte monde
- Pins = opportunities matchées
- Couleur = score match (or > 80%, gris < 80%)
- Filters: Location, Role Level, Division, Score minimum
- Clic pin → Opportunity preview popup
- Liste synchronisée côté

MOBILE:
- Toggle carte/liste
```

### Pipeline Kanban (/brand/pipeline)

```
PAGE: Brand Talent Pipeline
TYPE: Kanban board

HEADER: "Talent Pipeline" + filters dropdown (opportunity, date)

KANBAN (6 colonnes scrollables):
- Saved (grey)
- Contacted (blue)
- Screening (yellow)
- Interviewing (purple)
- Offer (orange)
- Hired (green)

CARD TALENT:
- Avatar (ou initiales)
- Nom
- Role level badge
- Match score
- Tags
- Actions (⋮ menu: Move, Notes, Remove)

DRAG & DROP entre colonnes
```

### Messaging (/talent/messages ou /brand/messages)

```
PAGE: Messages
TYPE: Chat interface

LAYOUT: 2 panels

LEFT PANEL (conversations list):
- Search bar
- Liste conversations
- Chaque: avatar, name, last message preview, timestamp, unread badge

RIGHT PANEL (conversation):
- Header: nom + "View Profile"
- Messages bubbles
  - Talent = droite, fond ivory
  - Brand = gauche, fond white
  - Timestamps discrets
- Input bar bas: text input + Send button
```

---

## RESPONSIVE NOTES

```
MOBILE (< 768px):
- Sidebar devient bottom nav (5 icônes max)
- Cards empilées
- Map toggle liste/carte
- Formulaires single column
- Progress bar compacte

TABLET (768-1024px):
- Sidebar rétractée (icônes only)
- Grid 2 colonnes
- Cards responsive

DESKTOP (> 1024px):
- Full sidebar avec labels
- Grid 2-3 colonnes
- Map + liste côte à côte
```

---

*Fin des prompts Visily V7*
