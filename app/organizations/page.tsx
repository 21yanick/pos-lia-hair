'use client'

import { ProtectedRoute } from '@/shared/components/auth'
import { OrganizationSelector } from '@/shared/components/auth/OrganizationSelector'

export default function OrganizationsPage() {
  return (
    <ProtectedRoute>
      <OrganizationSelector
        title="Organisation auswählen"
        description="Wählen Sie eine Organisation aus, um mit der Arbeit zu beginnen."
        showCreateButton={true}
      />
    </ProtectedRoute>
  )
}