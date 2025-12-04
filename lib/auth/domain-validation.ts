// ============================================================================
// DOMAIN VALIDATION SYSTEM FOR BRAND ACCOUNTS
// ============================================================================

// Domaines personnels à rejeter automatiquement lors de l'inscription brand
export const PERSONAL_DOMAINS = new Set([
  // Français courants
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'wanadoo.fr', 'bbox.fr',
  'aliceadsl.fr', 'aol.com', 'me.com', 'mac.com', 'live.com', 'msn.com',

  // Internationaux
  'protonmail.com', 'zoho.com', 'yandex.com', 'mail.ru', 'gmx.com',
  'web.de', 't-online.de', 'mail.com', 'email.com', 'comcast.net',
  'verizon.net', 'att.net', 'cox.net', 'earthlink.net', 'bellsouth.net',

  // Espagnol
  'hotmail.es', 'yahoo.es', 'gmail.es',

  // Italien
  'libero.it', 'virgilio.it', 'tiscali.it',

  // Allemand
  't-online.de', 'web.de', 'gmx.de',

  // Autres
  'rediffmail.com', 'rocketmail.com', 'inbox.com', 'mailinator.com'
])

// Domaines des marques de luxe pour validation automatique
export const LUXURY_BRAND_DOMAINS = new Set([
  // LVMH
  'lvmh.com', 'louisvuitton.com', 'dior.com', 'fendi.com', 'celine.com',
  'loewe.com', 'givenchy.com', 'kenzo.com', 'berluti.com', 'rimowa.com',
  'tiffany.com', 'bulgari.com', 'tagheuer.com', 'zenith.com', 'hublot.com',

  // Kering
  'kering.com', 'gucci.com', 'ysl.com', 'bottegaveneta.com', 'balenciaga.com',
  'alexandermcqueen.com', 'brioni.com', 'boucheron.com', 'qeelin.com',

  // Richemont
  'richemont.com', 'cartier.com', 'vancleefarpels.com', 'piaget.com',
  'vacheron-constantin.com', 'jaeger-lecoultre.com', 'iwc.com', 'panerai.com',
  'montblanc.com', 'chloe.com', 'dunhill.com', 'alaia.com',

  // Hermès, Chanel
  'hermes.com', 'chanel.com',

  // Autres maisons
  'prada.com', 'miumiu.com', 'churchs.com', 'carshoe.com', 'maxmara.com',
  'moncler.com', 'canadagoose.com', 'brunellocucinelli.com', 'lanaganscia.com'
])

export interface DomainValidationResult {
  isValid: boolean
  domainType: 'luxury_brand' | 'corporate' | 'personal' | 'unknown'
  confidence: 'high' | 'medium' | 'low'
  requiresManualReview: boolean
  message?: string
}

/**
 * Valide un email professionnel pour les comptes brands
 * @param email Email à valider
 * @returns Résultat de validation avec niveau de confiance
 */
export function validateBrandEmail(email: string): DomainValidationResult {
  // Validation basique du format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      domainType: 'unknown',
      confidence: 'high',
      requiresManualReview: false,
      message: 'Format d\'email invalide'
    }
  }

  const domain = email.split('@')[1]?.toLowerCase()

  if (!domain) {
    return {
      isValid: false,
      domainType: 'unknown',
      confidence: 'high',
      requiresManualReview: false,
      message: 'Domaine manquant'
    }
  }

  // 1. Vérification domaines personnels = REJET AUTOMATIQUE
  if (PERSONAL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      domainType: 'personal',
      confidence: 'high',
      requiresManualReview: false,
      message: 'Les domaines personnels ne sont pas acceptés pour les comptes marques'
    }
  }

  // 2. Vérification domaines luxury = VALIDATION AUTOMATIQUE
  if (LUXURY_BRAND_DOMAINS.has(domain)) {
    return {
      isValid: true,
      domainType: 'luxury_brand',
      confidence: 'high',
      requiresManualReview: false,
      message: 'Domaine de marque de luxe reconnu - validation automatique'
    }
  }

  // 3. Domaines corporate inconnus = VALIDATION MANUELLE REQUISE
  // Vérifications supplémentaires pour éviter les faux positifs
  const suspiciousPatterns = [
    /\d{4,}/, // Trop de chiffres
    /^[a-z]{1,3}\./, // Sous-domaines suspects
    /temp|test|fake|spam/i // Mots-clés suspects
  ]

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(domain))

  if (isSuspicious) {
    return {
      isValid: false,
      domainType: 'corporate',
      confidence: 'low',
      requiresManualReview: false,
      message: 'Domaine suspect détecté'
    }
  }

  // Domaine corporate standard = validation manuelle
  return {
    isValid: true,
    domainType: 'corporate',
    confidence: 'medium',
    requiresManualReview: true,
    message: 'Domaine professionnel détecté - validation manuelle requise'
  }
}

/**
 * Vérifie si un domaine appartient à une marque de luxe
 * @param domain Domaine à vérifier
 * @returns true si domaine luxury
 */
export function isLuxuryBrandDomain(domain: string): boolean {
  return LUXURY_BRAND_DOMAINS.has(domain.toLowerCase())
}

/**
 * Vérifie si un domaine est personnel (à rejeter)
 * @param domain Domaine à vérifier
 * @returns true si domaine personnel
 */
export function isPersonalDomain(domain: string): boolean {
  return PERSONAL_DOMAINS.has(domain.toLowerCase())
}

/**
 * Extrait le domaine d'un email
 * @param email Email complet
 * @returns Domaine en minuscules ou null
 */
export function extractDomain(email: string): string | null {
  const parts = email.split('@')
  return parts.length === 2 ? parts[1].toLowerCase() : null
}

/**
 * Liste des domaines luxury pour référence
 * @returns Array des domaines luxury
 */
export function getLuxuryBrandDomains(): string[] {
  return Array.from(LUXURY_BRAND_DOMAINS).sort()
}

/**
 * Liste des domaines personnels pour référence
 * @returns Array des domaines personnels
 */
export function getPersonalDomains(): string[] {
  return Array.from(PERSONAL_DOMAINS).sort()
}