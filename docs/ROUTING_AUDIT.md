# TailorShift V7 - Audit des Routes et Architecture de Navigation

## 1. Comment me demander un audit des routes

### Prompts efficaces :

**Pour un audit complet :**
> "Fais un audit de toutes les routes de l'application : liste chaque page existante, vérifie que tous les liens internes pointent vers des pages existantes, identifie les 404 potentielles."

**Pour vérifier la cohérence navigation :**
> "Vérifie la cohérence de la navigation : pour chaque interface (public, talent, brand, admin), cartographie les liens dans les headers/sidebars et vérifie qu'ils pointent vers des pages existantes."

**Pour un audit spécifique :**
> "Audite les routes côté Brand : vérifie que tous les liens du dashboard et du header mènent à des pages fonctionnelles."

**Format de réponse attendu :**
> "Pour chaque lien trouvé dans le code, indique : Source (fichier:ligne) → Destination (route) → Status (✅ existe / ❌ 404 / ⚠️ manquante)"

---

## 2. État actuel des routes (Audit du 04/12/2024)

### 2.1 Routes Publiques (Non authentifié)

| Route | Page | Status | Remarques |
|-------|------|--------|-----------|
| `/` | `app/page.tsx` | ✅ | Landing page |
| `/login` | `app/login/page.tsx` | ✅ | Connexion |
| `/signup` | `app/signup/page.tsx` | ✅ | Inscription |
| `/forgot-password` | `app/forgot-password/page.tsx` | ✅ | Mot de passe oublié |
| `/reset-password` | `app/reset-password/page.tsx` | ✅ | Réinitialisation |

### 2.2 Routes Auth/Callback

| Route | Page | Status | Type |
|-------|------|--------|------|
| `/auth/callback` | `app/auth/callback/route.ts` | ✅ | API Route |
| `/auth/complete-signup` | `app/auth/complete-signup/page.tsx` | ✅ | Page |
| `/auth/signout` | `app/auth/signout/route.ts` | ✅ | API Route |

### 2.3 Routes Talent (Authentifié + user_type=talent)

| Route | Page | Status | Remarques |
|-------|------|--------|-----------|
| `/talent/dashboard` | `app/talent/dashboard/page.tsx` | ✅ | Dashboard principal |
| `/talent/onboarding` | `app/talent/onboarding/page.tsx` | ✅ | Wizard 5 étapes |
| `/talent/profile` | `app/talent/profile/page.tsx` | ✅ | Profil utilisateur |
| `/talent/opportunities` | `app/talent/opportunities/page.tsx` | ✅ | Liste des opportunités |
| `/talent/opportunities/[id]` | ❌ MANQUANT | ❌ | **Page détail opportunité** |
| `/talent/assessment` | `app/talent/assessment/page.tsx` | ✅ | 6D Assessment |
| `/talent/assessment/results` | `app/talent/assessment/results/page.tsx` | ✅ | Résultats |
| `/talent/experience/new` | `app/talent/experience/new/page.tsx` | ✅ | Ajouter expérience |
| `/talent/network` | `app/talent/network/page.tsx` | ✅ | Réseau |
| `/talent/learn` | `app/talent/learn/page.tsx` | ✅ | Learning modules |
| `/talent/matches` | ❌ MANQUANT | ❌ | **Lien dans header nav** |

### 2.4 Routes Brand (Authentifié + user_type=brand)

| Route | Page | Status | Remarques |
|-------|------|--------|-----------|
| `/brand/dashboard` | `app/brand/dashboard/page.tsx` | ✅ | Dashboard principal |
| `/brand/onboarding` | `app/brand/onboarding/page.tsx` | ✅ | Wizard onboarding |
| `/brand/opportunities` | ❌ MANQUANT | ❌ | **LIEN CASSÉ dans nav header** |
| `/brand/opportunities/new` | `app/brand/opportunities/new/page.tsx` | ✅ | Créer opportunité |
| `/brand/opportunities/[id]` | ❌ MANQUANT | ❌ | **Page détail opportunité** |
| `/brand/opportunities/[id]/matches` | ❌ MANQUANT | ❌ | **Lien dans pipeline** |
| `/brand/pipeline` | `app/brand/pipeline/page.tsx` | ✅ | Pipeline candidats |
| `/brand/pipeline/[talentId]` | ❌ MANQUANT | ❌ | **Lien dans pipeline** |
| `/brand/stores` | `app/brand/stores/page.tsx` | ✅ | Liste des stores |
| `/brand/stores/new` | `app/brand/stores/new/page.tsx` | ✅ | Ajouter store |
| `/brand/team` | `app/brand/team/page.tsx` | ✅ | Gestion équipe |

### 2.5 Routes Partagées (Authentifié)

| Route | Page | Status | Remarques |
|-------|------|--------|-----------|
| `/messages` | `app/messages/page.tsx` | ✅ | Messagerie |
| `/settings` | `app/settings/page.tsx` | ✅ | Paramètres |

### 2.6 Routes Admin (Non implémentées)

| Route | Page | Status | Remarques |
|-------|------|--------|-----------|
| `/admin/dashboard` | ❌ MANQUANT | ❌ | Dashboard admin |
| `/admin/talents` | ❌ MANQUANT | ❌ | Gestion talents |
| `/admin/brands` | ❌ MANQUANT | ❌ | Gestion brands |
| `/admin/validation` | ❌ MANQUANT | ❌ | Validation profils |

---

## 3. Problèmes identifiés

### 3.1 404 confirmées

| Source | Lien | Route | Action requise |
|--------|------|-------|----------------|
| `brand/dashboard/page.tsx:88` | Header nav "Opportunities" | `/brand/opportunities` | Créer page liste |
| `talent/opportunities/page.tsx:99` | Header nav "Matches" | `/talent/matches` | Créer ou supprimer lien |
| `brand/pipeline/page.tsx:259` | Bouton "View" talent | `/brand/pipeline/[talentId]` | Créer page détail |
| `brand/pipeline/page.tsx:269` | "View all X candidates" | `/brand/opportunities/[id]/matches` | Créer page |
| `talent/opportunities/page.tsx:221` | "View" opportunity | `/talent/opportunities/[id]` | Créer page détail |

### 3.2 Liens manquants (pages existantes non liées)

- `/talent/experience/new` - Pas de lien depuis le dashboard/profile
- `/talent/learn` - Pas de lien visible dans la navigation principale

---

## 4. Architecture de navigation recommandée

### 4.1 Interface Publique

```
Landing (/)
├── Login (/login)
├── Signup (/signup)
│   └── Complete Signup (/auth/complete-signup)
├── Forgot Password (/forgot-password)
└── Reset Password (/reset-password)
```

### 4.2 Interface Talent

```
Dashboard (/talent/dashboard)
├── Header Nav
│   ├── Dashboard (/talent/dashboard) ✅
│   ├── Opportunities (/talent/opportunities) ✅
│   ├── Matches (/talent/matches) ❌ CRÉER
│   └── Network (/talent/network) ✅
├── Profile (/talent/profile)
│   └── Add Experience (/talent/experience/new)
├── Assessment (/talent/assessment)
│   └── Results (/talent/assessment/results)
├── Learn (/talent/learn)
├── Messages (/messages)
└── Settings (/settings)
```

### 4.3 Interface Brand

```
Dashboard (/brand/dashboard)
├── Header Nav
│   ├── Dashboard (/brand/dashboard) ✅
│   ├── Opportunities (/brand/opportunities) ❌ CRÉER
│   ├── Pipeline (/brand/pipeline) ✅
│   └── Stores (/brand/stores) ✅
├── Opportunities
│   ├── List (/brand/opportunities) ❌ CRÉER
│   ├── New (/brand/opportunities/new) ✅
│   └── Detail (/brand/opportunities/[id]) ❌ CRÉER
├── Pipeline
│   ├── List (/brand/pipeline) ✅
│   └── Talent Detail (/brand/pipeline/[id]) ❌ CRÉER
├── Stores
│   ├── List (/brand/stores) ✅
│   └── New (/brand/stores/new) ✅
├── Team (/brand/team) ✅
├── Messages (/messages)
└── Settings (/settings)
```

### 4.4 Interface Admin (À créer)

```
Admin Dashboard (/admin/dashboard)
├── Talents
│   ├── List (/admin/talents)
│   ├── Pending Validation (/admin/talents/pending)
│   └── Detail (/admin/talents/[id])
├── Brands
│   ├── List (/admin/brands)
│   └── Detail (/admin/brands/[id])
├── Opportunities (/admin/opportunities)
├── Matches (/admin/matches)
├── Reports (/admin/reports)
└── Settings (/admin/settings)
```

---

## 5. Fonctionnalités Admin prévues vs possibles

### 5.1 Ce qui existe dans le modèle de données

Le schéma actuel supporte déjà :

1. **Validation des talents** (`talents` table)
   - `status`: 'onboarding' | 'pending_review' | 'approved' | 'rejected' | 'suspended'
   - `eligibility_score`, `eligibility_decision`, `eligibility_reasons`
   - `review_notes`, `reviewed_at`, `reviewed_by`
   - `rejection_reason`, `resubmit_count`

2. **Vérification des brands** (`brands` table)
   - `verified`: boolean

3. **Profils admin** (`profiles` table)
   - `user_type`: 'talent' | 'brand' | **'admin'**

4. **Notifications** (`notifications` table)
   - Peut être utilisé pour alertes admin

### 5.2 Fonctionnalités Admin à implémenter

| Priorité | Fonctionnalité | Complexité | Description |
|----------|---------------|------------|-------------|
| **P1** | Dashboard Admin | Moyenne | Vue d'ensemble des KPIs |
| **P1** | Validation Talents | Moyenne | Review des profils pending |
| **P1** | Gestion Talents | Faible | CRUD + suspendre/réactiver |
| **P2** | Gestion Brands | Faible | CRUD + vérifier |
| **P2** | Gestion Opportunities | Moyenne | Modération des offres |
| **P3** | Reporting/Analytics | Haute | Dashboards, exports |
| **P3** | Configuration système | Moyenne | Settings globaux |

### 5.3 Prérequis pour l'interface Admin

1. **Middleware**: Vérifier `user_type === 'admin'` pour les routes `/admin/*`
2. **Création d'un admin**: Script SQL ou invitation manuelle
3. **UI Components**: Réutiliser les composants existants

---

## 6. Plan de correction immédiat

### Priorité 1 : Corriger les 404 bloquantes

1. ❌→✅ Créer `/brand/opportunities/page.tsx` (liste des opportunités brand)
2. ❌→✅ Corriger le lien header ou créer `/talent/matches/page.tsx`

### Priorité 2 : Pages détail manquantes

3. Créer `/brand/opportunities/[id]/page.tsx`
4. Créer `/brand/pipeline/[id]/page.tsx`
5. Créer `/talent/opportunities/[id]/page.tsx`

### Priorité 3 : Interface Admin

6. Créer structure `/admin/*` avec dashboard et validation

---

## 7. Comment me solliciter pour ces tâches

**Pour corriger la 404 Opportunities :**
> "Crée la page `/brand/opportunities/page.tsx` qui liste toutes les opportunités de la brand avec les mêmes données que dans le dashboard, mais avec plus de détails et des actions."

**Pour un audit automatisé :**
> "Écris un script qui parse tous les `Link href` et `redirect()` dans le code et vérifie que chaque destination existe."

**Pour créer l'interface Admin :**
> "Conçois l'architecture de l'interface admin avec : 1) Dashboard avec KPIs, 2) Validation des talents pending_review, 3) Gestion CRUD des brands. Commence par le plan avant le code."

---

*Document généré le 04/12/2024*
*Version: 1.0*