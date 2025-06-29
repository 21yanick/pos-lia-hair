'use client'

import { useRouter } from 'next/navigation'
import { Phone, Mail } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useCustomerLastVisit } from '../hooks/useCustomerSales'
import { getInitials, getPrimaryContact, formatRelativeDate, getAvatarColor } from '../utils/customerUtils'
import type { Customer } from '@/shared/services/customerService'

interface CustomerCardProps {
  customer: Customer
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const router = useRouter()
  const { currentOrganization } = useCurrentOrganization()
  const { data: lastVisit } = useCustomerLastVisit(customer.id, currentOrganization?.id || '')
  const primaryContact = getPrimaryContact(customer)
  const initials = getInitials(customer.name)
  const avatarColor = getAvatarColor(customer.name)

  const handleCardClick = () => {
    if (currentOrganization) {
      router.push(`/org/${currentOrganization.slug}/customers/${customer.id}`)
    }
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-border"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${avatarColor} text-white font-semibold`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate">
              {customer.name}
            </h3>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1">
          {primaryContact.type && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {primaryContact.type === 'phone' ? (
                <Phone className="h-3 w-3 flex-shrink-0" />
              ) : (
                <Mail className="h-3 w-3 flex-shrink-0" />
              )}
              <span className="truncate">{primaryContact.value}</span>
            </div>
          )}
          
          {/* Secondary contact (if both phone and email exist) */}
          {customer.phone && customer.email && primaryContact.type === 'phone' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          
          {/* No contact info */}
          {!primaryContact.type && (
            <div className="text-sm text-muted-foreground italic">
              Keine Kontaktdaten
            </div>
          )}
        </div>

        {/* Last Visit */}
        {lastVisit && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Letzter Besuch: {formatRelativeDate(lastVisit)}
            </div>
          </div>
        )}

        {/* No visits */}
        {!lastVisit && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground italic">
              Noch keine Besuche
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}