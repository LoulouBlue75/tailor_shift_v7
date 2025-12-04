// Dream Brand Alert Notifications
// Triggers when a brand posts an opportunity and talents have that brand in their Dream Brands

import type { SupabaseClient } from '@supabase/supabase-js'

export interface DreamBrandAlertPayload {
  talent_id: string
  talent_email: string
  talent_name: string
  brand_name: string
  opportunity_id: string
  opportunity_title: string
  opportunity_role_level: string
  opportunity_location: string
  dream_brand_rank: number  // 1-5, where 1 is most preferred
}

/**
 * Find talents who have this brand as a Dream Brand and should be notified
 * about a new opportunity.
 * 
 * PRIVACY NOTE: This function runs server-side only.
 * It returns data for creating notifications, NOT for direct exposure to brands.
 */
export async function findTalentsToNotify(
  supabase: SupabaseClient,
  brandName: string,
  opportunityId: string
): Promise<DreamBrandAlertPayload[]> {
  // Get the opportunity details
  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('id, title, role_level, city, country')
    .eq('id', opportunityId)
    .single()

  if (!opportunity) {
    console.error('Opportunity not found:', opportunityId)
    return []
  }

  // Find talents with this brand in their Dream Brands
  // Filter by career_preferences->target_brands containing brandName
  const { data: talents } = await supabase
    .from('talents')
    .select(`
      id,
      first_name,
      last_name,
      career_preferences,
      profile:profiles!talents_profile_id_fkey (
        email
      )
    `)
    .filter('career_preferences->target_brands', 'cs', `["${brandName}"]`)
    .eq('status', 'active')

  if (!talents?.length) {
    return []
  }

  // Build notification payloads
  const payloads: DreamBrandAlertPayload[] = []

  for (const talent of talents) {
    const targetBrands = (talent.career_preferences as { target_brands?: string[] })?.target_brands || []
    const rank = targetBrands.findIndex(
      (b: string) => b.toLowerCase() === brandName.toLowerCase()
    ) + 1

    if (rank > 0) {
      const profileData = talent.profile as { email?: string } | { email?: string }[] | null
      const email = Array.isArray(profileData) 
        ? profileData[0]?.email 
        : profileData?.email

      payloads.push({
        talent_id: talent.id,
        talent_email: email || '',
        talent_name: `${talent.first_name || ''} ${talent.last_name || ''}`.trim(),
        brand_name: brandName,
        opportunity_id: opportunity.id,
        opportunity_title: opportunity.title || 'New Opportunity',
        opportunity_role_level: opportunity.role_level || '',
        opportunity_location: `${opportunity.city || ''}, ${opportunity.country || ''}`.replace(', ,', ',').replace(/^, |, $/g, ''),
        dream_brand_rank: rank,
      })
    }
  }

  return payloads
}

/**
 * Create in-app notifications for talents when their Dream Brand posts an opportunity.
 * 
 * This should be called when:
 * 1. A brand creates a new active opportunity
 * 2. An opportunity status changes from draft to active
 */
export async function createDreamBrandNotifications(
  supabase: SupabaseClient,
  brandName: string,
  opportunityId: string
): Promise<{ created: number; errors: string[] }> {
  const talentsToNotify = await findTalentsToNotify(supabase, brandName, opportunityId)
  
  if (talentsToNotify.length === 0) {
    return { created: 0, errors: [] }
  }

  const errors: string[] = []
  let created = 0

  // For now, we'll create notification records
  // In a production system, this would also:
  // 1. Queue emails for sending
  // 2. Send push notifications
  // 3. Create in-app notification badges

  for (const payload of talentsToNotify) {
    try {
      // Insert notification record (requires notifications table)
      // For now, we'll just log and count - actual table can be added later
      console.log(`[Dream Brand Alert] Notifying ${payload.talent_name} about ${payload.brand_name} opportunity`)
      
      // TODO: When notifications table exists:
      // await supabase.from('notifications').insert({
      //   user_id: payload.talent_id,
      //   type: 'dream_brand_opportunity',
      //   title: `${payload.brand_name} has a new opportunity!`,
      //   body: `Your #${payload.dream_brand_rank} Dream Brand just posted: ${payload.opportunity_title}`,
      //   data: {
      //     opportunity_id: payload.opportunity_id,
      //     brand_name: payload.brand_name,
      //     dream_brand_rank: payload.dream_brand_rank,
      //   },
      //   read: false,
      // })
      
      created++
    } catch (error) {
      errors.push(`Failed to notify ${payload.talent_id}: ${error}`)
    }
  }

  return { created, errors }
}

/**
 * Get count of talents interested in a specific brand.
 * 
 * PRIVACY: Returns only aggregate count, not individual data.
 * Safe to expose to brands.
 */
export async function getDreamBrandInterestCount(
  supabase: SupabaseClient,
  brandName: string
): Promise<number> {
  const { count } = await supabase
    .from('talents')
    .select('*', { count: 'exact', head: true })
    .filter('career_preferences->target_brands', 'cs', `["${brandName}"]`)
    .eq('status', 'active')

  return count || 0
}

/**
 * Get anonymized breakdown of interested talents.
 * 
 * PRIVACY: Returns only aggregate stats by role level and region.
 * Never returns individual profile data.
 * Safe to expose to brands.
 */
export async function getDreamBrandInterestBreakdown(
  supabase: SupabaseClient,
  brandName: string
): Promise<{
  total: number
  byRoleLevel: Record<string, number>
  byRegion: Record<string, number>
  internalMobility: number
}> {
  const { data: talents } = await supabase
    .from('talents')
    .select('current_role_level, current_location, current_employer, internal_mobility_interest')
    .filter('career_preferences->target_brands', 'cs', `["${brandName}"]`)
    .eq('status', 'active')

  const byRoleLevel: Record<string, number> = {}
  const byRegion: Record<string, number> = {}
  let internalMobility = 0

  talents?.forEach((talent) => {
    // Count by role level
    const level = talent.current_role_level || 'Not specified'
    byRoleLevel[level] = (byRoleLevel[level] || 0) + 1
    
    // Count by region (extract first part of location)
    const location = talent.current_location || 'Not specified'
    const region = location.split(',')[0].trim()
    byRegion[region] = (byRegion[region] || 0) + 1
    
    // Count internal mobility
    if (talent.current_employer?.toLowerCase() === brandName.toLowerCase() && 
        talent.internal_mobility_interest) {
      internalMobility++
    }
  })

  return {
    total: talents?.length || 0,
    byRoleLevel,
    byRegion,
    internalMobility,
  }
}