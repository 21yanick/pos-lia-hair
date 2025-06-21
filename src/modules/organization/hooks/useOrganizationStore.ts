'use client'

import { create } from 'zustand'
import { Organization, OrganizationRole } from '@/shared/types/organizations'

interface OrganizationStore {
  // State - nur das Nötigste
  currentOrganization: Organization | null
  userRole: OrganizationRole | null
  
  // Actions - klare, einfache API
  setOrganization: (org: Organization | null, role: OrganizationRole | null) => void
  clearOrganization: () => void
}

// Minimaler, fokussierter Store für Organisation State
export const useOrganizationStore = create<OrganizationStore>((set) => ({
  currentOrganization: null,
  userRole: null,
  
  setOrganization: (org, role) => {
    set({ currentOrganization: org, userRole: role })
  },
  
  clearOrganization: () => {
    set({ currentOrganization: null, userRole: null })
  }
}))