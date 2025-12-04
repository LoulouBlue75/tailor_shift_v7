'use server'

import { checkBrandPermission as checkPermission, getBrandTeamMembers as getMembers } from '@/lib/auth/brand-rbac'
import { createClient } from '@/lib/supabase/server'

export async function checkBrandPermissionAction(userId: string, brandId: string, permission: any) {
  return await checkPermission(userId, brandId, permission)
}

export async function getBrandTeamMembersAction(brandId: string) {
  return await getMembers(brandId)
}