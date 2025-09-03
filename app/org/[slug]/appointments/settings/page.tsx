import type { Metadata } from 'next'
import { BookingRulesConfig } from '@/modules/appointments/components/settings/BookingRulesConfig'
import { BusinessHoursConfig } from '@/modules/appointments/components/settings/BusinessHoursConfig'
import { VacationManager } from '@/modules/appointments/components/settings/VacationManager'

export const metadata: Metadata = {
  title: 'Termin-Einstellungen',
  description: 'Konfigurieren Sie Ihre Geschäftszeiten, Urlaubszeiten und Buchungsregeln',
}

export default function AppointmentSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8 px-4 max-w-full overflow-x-hidden">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Konfigurieren Sie Ihre Geschäftszeiten, Urlaubszeiten und Buchungsregeln für das
          Appointment-System.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Business Hours Configuration */}
        <BusinessHoursConfig />

        {/* Vacation Manager */}
        <VacationManager />

        {/* Booking Rules Configuration */}
        <BookingRulesConfig />
      </div>
    </div>
  )
}
