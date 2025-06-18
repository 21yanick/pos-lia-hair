'use client'

import { OrganizationSelector } from '@/shared/components/auth/OrganizationSelector'

export default function OrganizationsPage() {
  return (
    <OrganizationSelector
      title="Organisation auswählen"
      description="Wählen Sie eine Organisation aus, um mit der Arbeit zu beginnen."
      showCreateButton={true}
    />
  )
}