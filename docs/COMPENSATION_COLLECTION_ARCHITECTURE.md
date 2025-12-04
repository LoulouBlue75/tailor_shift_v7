# Structure de Rémunération Retail Luxe : Architecture de Collecte

## Vue d'ensemble

Cette documentation décrit la matrice de collecte de données de rémunération pour la plateforme TailorShift, optimisée pour le matching entre talents et marques de luxe.

## Objectifs de Conception

| Critère | Cible |
|---------|-------|
| Temps de complétion | < 90 secondes |
| Taux de complétion | > 70% |
| Champs principaux | 7 champs couvrant 80% des variations |
| UX | Simple, progressif, benchmarks contextuels |

## Les 7 Champs Principaux

| # | Champ | Format | Obligatoire | Notes |
|---|-------|--------|-------------|-------|
| 1 | **Fixe annuel brut** | Montant € | ✓ Oui | Temps plein équivalent |
| 2 | **Variable total (% du fixe)** | Pourcentage | ✓ Oui | 15-60% selon niveau/segment |
| 3 | **Commission individuelle** | Oui/Non + % | Non | 60-70% des maisons |
| 4 | **Avantages en nature** | Multi-sélection | ✓ Oui | 8 catégories principales |
| 5 | **Type de contrat** | Liste | ✓ Oui | CDI, CDD, Intérim, Freelance |
| 6 | **Segment de marque** | Liste | ✓ Oui | Ultra Luxury → Accessible Luxury |
| 7 | **Région** | Liste | ✓ Oui | 7 zones géographiques |

## Implémentation Technique

### Interface TypeScript

```typescript
interface OnboardingData {
  // Step 5: Compensation (7 key fields for luxury retail)
  contract_type: string          // CDI, CDD, Intérim, Freelance
  brand_segment: string          // ultra_luxury, luxury, premium, accessible_luxury
  compensation_region: string    // france_paris, france_province, suisse, uae_dubai, etc.
  current_base: number | null    // Annual base salary (gross)
  variable_percentage: number | null  // Variable as % of base (15-60% typical)
  has_commission: boolean        // Individual sales commission Y/N
  commission_rate: number | null // Commission rate (1-10%)
  current_benefits: string[]     // Multi-select benefits
  currency: string
  expectations: number | null
  salary_flexibility: 'flexible' | 'firm'
  hide_exact_figures: boolean
}
```

### Stockage JSONB (Supabase)

```sql
-- talents.compensation_profile JSONB structure:
{
  "contract_type": "cdi",
  "brand_segment": "luxury",
  "compensation_region": "france_paris",
  "current_base": 45000,
  "variable_percentage": 25,
  "has_commission": true,
  "commission_rate": 2.5,
  "current_benefits": ["staff_discount", "tickets_restaurant", "mutuelle"],
  "currency": "EUR",
  "expectations": 55000,
  "salary_flexibility": "flexible",
  "hide_exact_figures": true
}
```

## Benchmarks Salariaux par Niveau et Segment

### Fourchettes France 2024 (en EUR)

| Niveau | Ultra Luxury | Luxury | Premium | Accessible Luxury |
|--------|--------------|--------|---------|-------------------|
| **L1** Sales Associate | 28-35K (32K avg) | 26-32K (29K avg) | 25-30K (27.5K avg) | 24-28K (26K avg) |
| **L2** Senior SA | 32-40K (36K avg) | 30-38K (34K avg) | 28-35K (31.5K avg) | 26-32K (29K avg) |
| **L3** Team Lead | 38-48K (43K avg) | 35-45K (40K avg) | 32-42K (37K avg) | 30-38K (34K avg) |
| **L4** Asst Manager | 45-55K (50K avg) | 42-52K (47K avg) | 38-48K (43K avg) | 35-45K (40K avg) |
| **L5** Store Manager | 60-90K (75K avg) | 50-80K (65K avg) | 45-70K (57.5K avg) | 40-60K (50K avg) |
| **L6** Area Manager | 80-120K (100K avg) | 70-100K (85K avg) | 60-90K (75K avg) | 55-80K (67.5K avg) |
| **L7** Regional Dir | 120-180K (150K avg) | 100-150K (125K avg) | 90-130K (110K avg) | 80-120K (100K avg) |
| **L8** VP/Country Mgr | 180-300K (240K avg) | 150-250K (200K avg) | 120-200K (160K avg) | 100-180K (140K avg) |

### Ratios Variable/Fixe par Niveau

| Niveau | Min % | Max % |
|--------|-------|-------|
| L1 Sales Associate | 15% | 25% |
| L2 Senior SA | 18% | 28% |
| L3 Team Lead | 20% | 32% |
| L4 Assistant Manager | 22% | 35% |
| L5 Store Manager | 25% | 40% |
| L6 Area Manager | 35% | 50% |
| L7 Regional Director | 40% | 60% |
| L8 VP/Country Manager | 50% | 70% |

### Ratios Variable par Segment de Marque

| Segment | Variable Ratio | Commission | Staff Discount |
|---------|---------------|------------|----------------|
| Ultra Luxury (Hermès, Chanel) | 10-20% | Rare/absente | 40-50% |
| Luxury (LVMH, Kering) | 20-35% | 1-3% | 25-35% |
| Premium (Ralph Lauren, Coach) | 30-45% | 3-5% | 30-40% |
| Accessible Luxury (ba&sh, Maje) | 35-50% | 3-7% | 30-35% |

## Variations Géographiques

| Région | Premium vs France Province | Notes |
|--------|---------------------------|-------|
| France - Paris | +15-25% | Intra-muros, zones touristiques |
| France - Province | Baseline | Réference |
| Suisse | +20-30% | Genève, Zurich (coût vie +40%) |
| UAE / Dubaï | +40-60% | Tax-free, packages nets |
| Reste EMEA | Variable | Selon pays |
| Asie | +30-50% | HK, Singapore (logement rarement inclus) |
| Amériques | Variable | US, Canada, Latam |

## Types de Variable Détaillés

### 1. Commission Individuelle (60-70% des maisons)
- **Ultra Luxury**: 0.5-1.5% (faible, focus service)
- **Luxury**: 1-3% (LVMH, Kering)
- **Premium/Accessible**: 3-7% (motivation commerciale forte)
- **Joaillerie/Horlogerie**: 3-5% (cycles de vente longs)

### 2. Prime sur Objectifs Quantitatifs
- Bonus mensuel/trimestriel basé sur CA vs budget
- Poids: 10-20% (SA), 20-30% (Store Manager)
- Seuils: 80% → 100% → 120%

### 3. Prime sur Objectifs Qualitatifs
- NPS/Client satisfaction: 2-5%
- Mystery shopping: 1-3%
- CRM data quality: 1-2%
- Prévalence: 80% Ultra Luxury/Luxury

### 4. Bonus Pool Maison
- Enveloppe: 2-5% masse salariale magasin
- Distribution: Performance collective + ancienneté
- Exemple Hermès: 17 mois de salaire total

### 5. 13ème Mois
- Obligatoire CCN Commerce en France
- 100% France, 80% Europe, rare hors UE

### 6. Participation / Intéressement
- Obligatoire si > 50 employés
- Montants: 1-6 mois selon résultats

## Avantages en Nature

| ID | Avantage | Valeur Estimée |
|----|----------|----------------|
| `staff_discount` | Staff Discount | 20-50% |
| `uniform` | Uniforme / Allowance | €300-800/an |
| `tickets_restaurant` | Tickets Restaurant | €1,200-2,000/an |
| `mutuelle` | Mutuelle | €1,000-3,000/an (employeur) |
| `phone_transport` | Phone / Transport | €600-1,800/an |
| `private_sales` | Private Sales Access | -30 à -50% |
| `thirteenth_month` | 13ème Mois | 1 mois salaire |
| `participation` | Participation/Intéressement | 1-6 mois |

## Utilisation dans le Matching

### Calcul d'Alignement Compensation

```typescript
function calculateCompensationAlignment(
  talentProfile: CompensationProfile,
  opportunity: OpportunityCompensation
): 'within_range' | 'above_range' | 'below_range' | 'unknown' {
  
  const talentTotal = calculateTotalPackage(talentProfile)
  const oppRange = opportunity.compensation_range
  
  if (!oppRange.min_base || !oppRange.max_base) return 'unknown'
  
  const oppMin = oppRange.min_base * (1 + (oppRange.variable_pct || 0) / 100)
  const oppMax = oppRange.max_base * (1 + (oppRange.variable_pct || 0) / 100)
  
  if (talentTotal >= oppMin && talentTotal <= oppMax) return 'within_range'
  if (talentTotal > oppMax) return 'above_range'
  return 'below_range'
}
```

### Benchmark Intelligence

Le système utilise automatiquement les benchmarks pour:
1. **Validation des données** - Alerter si valeurs hors fourchettes typiques
2. **Estimation manquantes** - Compléter les champs optionnels via benchmarks
3. **Score de matching** - Pondérer l'alignement compensation dans le score global

## Confidentialité

- **hide_exact_figures = true** (par défaut): Les marques voient uniquement l'alignement ('within_range', 'above_range', 'below_range')
- **hide_exact_figures = false**: Les marques peuvent voir les fourchettes exactes après mutual match

## Sources de Référence

- Mercer Luxury and Lifestyle Retail Compensation Survey 2024
- Études sectorielles INSEEC/EMLV
- Données Indeed/LinkedIn actualisées trimestriellement

---

*Document créé le {{ date }} - TailorShift V7*