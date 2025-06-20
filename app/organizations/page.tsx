'use client'

import { OrganizationGuard } from '@/shared/components/auth/OrganizationGuard'
import { OrganizationSelector } from '@/shared/components/auth/OrganizationSelector'

export default function OrganizationsPage() {
  return (
    <OrganizationGuard requireOrganization={false}>
      <OrganizationSelector
        title="Organisation auswählen"
        description="Wählen Sie eine Organisation aus, um mit der Arbeit zu beginnen."
        showCreateButton={true}
      />
    </OrganizationGuard>
  )
}