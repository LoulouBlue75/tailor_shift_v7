// ============================================================================
// BRAND RBAC (Role-Based Access Control) SYSTEM
// ============================================================================

import { createClient } from '@/lib/supabase/server'

export type BrandPermission =
  | 'manage_team'           // Inviter/supprimer des membres équipe
  | 'manage_brand_profile'  // Modifier profil marque
  | 'manage_stores'         // Gérer les boutiques
  | 'create_opportunities'  // Créer des opportunités
  | 'view_candidates'       // Voir les candidats matchés
  | 'contact_candidates'    // Contacter les candidats
  | 'view_analytics'        // Voir les analytics recrutement

export type BrandRole =
  | 'owner'           // Propriétaire - tous droits
  | 'admin_global'    // Admin global - administration complète
  | 'admin_brand'     // Admin marque - gestion marque spécifique
  | 'hr_global'       // HR global - recrutement global
  | 'hr_regional'     // HR régional - recrutement régional
  | 'recruiter'       // Recruteur opérationnel
  | 'manager_store'   // Manager boutique
  | 'viewer'          // Lecture seule

export interface BrandPermissions {
  [key: string]: BrandPermission[]
}

// Définition des permissions par rôle
export const ROLE_PERMISSIONS: BrandPermissions = {
  owner: [
    'manage_team', 'manage_brand_profile', 'manage_stores',
    'create_opportunities', 'view_candidates', 'contact_candidates', 'view_analytics'
  ],
  admin_global: [
    'manage_team', 'manage_brand_profile', 'manage_stores',
    'create_opportunities', 'view_candidates', 'contact_candidates', 'view_analytics'
  ],
  admin_brand: [
    'manage_brand_profile', 'manage_stores',
    'create_opportunities', 'view_candidates', 'contact_candidates', 'view_analytics'
  ],
  hr_global: [
    'create_opportunities', 'view_candidates', 'contact_candidates', 'view_analytics'
  ],
  hr_regional: [
    'create_opportunities', 'view_candidates', 'contact_candidates'
  ],
  recruiter: [
    'create_opportunities', 'view_candidates', 'contact_candidates'
  ],
  manager_store: [
    'view_candidates', 'contact_candidates'
  ],
  viewer: [
    'view_candidates'
  ]
}

export interface BrandRoleInfo {
  role: BrandRole
  scope: {
    geographic: 'global' | 'regional' | string[]
    brands: 'all' | string[]
    permissions: BrandPermission[]
  }
}

/**
 * Vérifie si un utilisateur a une permission spécifique pour une marque
 * @param userId ID de l'utilisateur
 * @param brandId ID de la marque
 * @param permission Permission requise
 * @returns true si l'utilisateur a la permission
 */
export async function checkBrandPermission(
  userId: string,
  brandId: string,
  permission: BrandPermission
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data: membership, error } = await supabase
      .from('brand_team_members')
      .select('role, role_scope')
      .eq('profile_id', userId)
      .eq('brand_id', brandId)
      .single()

    if (error || !membership) {
      return false
    }

    // Vérifier si le rôle a cette permission
    const allowedPermissions = ROLE_PERMISSIONS[membership.role] || []
    return allowedPermissions.includes(permission)
  } catch (error) {
    console.error('Error checking brand permission:', error)
    return false
  }
}

/**
 * Récupère les informations de rôle d'un utilisateur pour une marque
 * @param userId ID de l'utilisateur
 * @param brandId ID de la marque
 * @returns Informations de rôle ou null
 */
export async function getUserBrandRole(
  userId: string,
  brandId: string
): Promise<BrandRoleInfo | null> {
  const supabase = await createClient()

  try {
    const { data: membership, error } = await supabase
      .from('brand_team_members')
      .select('role, role_scope')
      .eq('profile_id', userId)
      .eq('brand_id', brandId)
      .single()

    if (error || !membership) {
      return null
    }

    return {
      role: membership.role as BrandRole,
      scope: membership.role_scope as BrandRoleInfo['scope']
    }
  } catch (error) {
    console.error('Error getting user brand role:', error)
    return null
  }
}

/**
 * Vérifie si un utilisateur est propriétaire d'une marque
 * @param userId ID de l'utilisateur
 * @param brandId ID de la marque
 * @returns true si propriétaire
 */
export async function isBrandOwner(
  userId: string,
  brandId: string
): Promise<boolean> {
  const roleInfo = await getUserBrandRole(userId, brandId)
  return roleInfo?.role === 'owner'
}

/**
 * Liste tous les membres d'une équipe de marque
 * @param brandId ID de la marque
 * @returns Liste des membres avec leurs rôles
 */
export async function getBrandTeamMembers(brandId: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('brand_team_members')
      .select(`
        id,
        role,
        role_scope,
        invited_at,
        accepted_at,
        profiles!inner(
          id,
          email,
          full_name
        )
      `)
      .eq('brand_id', brandId)
      .order('invited_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting brand team members:', error)
    return []
  }
}

/**
 * Vérifie si un utilisateur peut accéder à une fonctionnalité
 * Wrapper pour checkBrandPermission avec gestion d'erreur
 * @param userId ID de l'utilisateur
 * @param brandId ID de la marque
 * @param requiredPermission Permission requise
 * @throws AccessDeniedError si pas de permission
 */
export async function requireBrandPermission(
  userId: string,
  brandId: string,
  requiredPermission: BrandPermission
): Promise<void> {
  const hasPermission = await checkBrandPermission(userId, brandId, requiredPermission)

  if (!hasPermission) {
    const roleInfo = await getUserBrandRole(userId, brandId)
    throw new AccessDeniedError(
      `User ${userId} with role ${roleInfo?.role || 'none'} cannot access ${requiredPermission} for brand ${brandId}`
    )
  }
}

/**
 * Erreur d'accès refusé
 */
export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccessDeniedError'
  }
}

/**
 * Middleware helper pour les API routes
 * @param requiredPermission Permission requise
 * @returns Middleware function
 */
export function withBrandPermission(requiredPermission: BrandPermission) {
  return async function brandPermissionMiddleware(
    userId: string,
    brandId: string,
    next: () => Promise<any>
  ) {
    await requireBrandPermission(userId, brandId, requiredPermission)
    return next()
  }
}

/**
 * Récupère les permissions disponibles pour un rôle
 * @param role Rôle de l'utilisateur
 * @returns Liste des permissions
 */
export function getRolePermissions(role: BrandRole): BrandPermission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Vérifie si un rôle peut effectuer une action
 * @param role Rôle à vérifier
 * @param permission Permission requise
 * @returns true si autorisé
 */
export function canRolePerform(role: BrandRole, permission: BrandPermission): boolean {
  const permissions = getRolePermissions(role)
  return permissions.includes(permission)
}