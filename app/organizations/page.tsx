'use client'

import { ProtectedRoute } from '@/shared/components/auth'
import { OrganizationSelector } from '@/shared/components/auth/OrganizationSelector'

export default function OrganizationsPage() {
  return (
    <ProtectedRoute>
      <OrganizationSelector
        title="Organisation auswählen"
        description="Wähle eine Organisation aus, um zum Dashboard zu gelangen."
        showCreateButton={true}
      />
    </ProtectedRoute>
  )
}