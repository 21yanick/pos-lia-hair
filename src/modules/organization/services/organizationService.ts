import { supabase } from '@/shared/lib/supabase/client'
import type {
  CreateOrganizationData,
  InviteUserData,
  Organization,
  OrganizationMembership,
  UpdateOrganizationData,
} from '@/shared/types/organizations'

// Service für alle Organization CRUD Operationen
// Keine State-Verwaltung, nur pure Funktionen
export const organizationService = {
  // Erstelle neue Organisation
  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData?.user) {
      throw new Error('Authentication required')
    }

    // Transaction: Organisation + Owner Membership
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: data.name,
        slug: data.slug,
        display_name: data.display_name || data.name,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code,
        phone: data.phone,
        email: data.email,
        website: data.website,
      })
      .select()
      .single()

    if (orgError) {
      throw new Error(`Failed to create organization: ${orgError.message}`)
    }

    // Automatisch Owner-Rolle zuweisen
    const { error: memberError } = await supabase.from('organization_users').insert({
      organization_id: org.id,
      user_id: userData.user.id,
      role: 'owner',
      active: true,
    })

    if (memberError) {
      // Rollback: Organisation löschen wenn Membership fehlschlägt
      await supabase.from('organizations').delete().eq('id', org.id)
      throw new Error(`Failed to assign owner role: ${memberError.message}`)
    }

    return org
  },

  // Update Organisation
  async updateOrganization(id: string, data: UpdateOrganizationData): Promise<Organization> {
    const { data: org, error } = await supabase
      .from('organizations')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update organization: ${error.message}`)
    }

    return org
  },

  // Soft-Delete Organisation (setzt active auf false)
  async deleteOrganization(id: string): Promise<void> {
    const { error } = await supabase.from('organizations').update({ active: false }).eq('id', id)

    if (error) {
      throw new Error(`Failed to delete organization: ${error.message}`)
    }
  },

  // Lade einzelne Organisation
  async getOrganization(idOrSlug: string): Promise<Organization | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)

    const query = supabase.from('organizations').select('*').eq('active', true).single()

    const { data, error } = isUuid
      ? await query.eq('id', idOrSlug)
      : await query.eq('slug', idOrSlug)

    if (error) {
      return null
    }

    return data
  },

  // User zu Organisation einladen
  async inviteUser(data: InviteUserData): Promise<void> {
    const { error } = await supabase.functions.invoke('invite-user', {
      body: data,
    })

    if (error) {
      throw new Error(`Failed to invite user: ${error.message}`)
    }
  },

  // User aus Organisation entfernen
  async removeUser(organizationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_users')
      .update({ active: false })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to remove user: ${error.message}`)
    }
  },

  // User-Rolle in Organisation ändern
  async updateUserRole(
    organizationId: string,
    userId: string,
    role: OrganizationMembership['role']
  ): Promise<void> {
    const { error } = await supabase
      .from('organization_users')
      .update({ role })
      .eq('organization_id', organizationId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to update user role: ${error.message}`)
    }
  },
}
