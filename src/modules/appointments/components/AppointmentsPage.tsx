'use client'

/**
 * AppointmentsPage - Clean redesign with MonthGrid + DayTimeline
 * Mobile-first appointment system with touch optimization
 */

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar as CalendarIcon, Settings } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { formatDateForDisplay, formatDateForAPI } from '@/shared/utils/dateUtils'
import { useAppointmentsByDate, useDeleteAppointment } from '../hooks/useAppointments'
import type { AppointmentBlock } from '../types/timeline'
import { cn } from '@/shared/utils'
import { 
  MonthGrid, 
  DayTimeline, 
  DayTimelineSkeleton,
  useAppointmentCalendar 
} from './calendar'
import { QuickBookingDialog } from './dialogs'
import { AppointmentDetailDialog } from './AppointmentDetailDialog'
import { EditAppointmentDialog } from './EditAppointmentDialog'

export function AppointmentsPage() {
  const { currentOrganization } = useCurrentOrganization()
  const {
    selectedDate,
    currentMonth,
    selectDate,
    goToNextMonth,
    goToPrevMonth,
    goToMonth,
    goToToday,
    handleSlotClick,
    handleAppointmentClick,
    isBookingDialogOpen,
    selectedSlot,
    selectedAppointment,
    closeDialogs,
    isToday,
    formatDateKey,
    isExceptionAppointment
  } = useAppointmentCalendar()

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentBlock | null>(null)
  
  // Delete appointment hook
  const deleteAppointment = useDeleteAppointment(currentOrganization?.id || '')



  // Load appointments for selected date to get real stats
  const { data: dayAppointments = [] } = useAppointmentsByDate(
    currentOrganization?.id || '', 
    selectedDate
  )
  
  // Calculate real appointment stats for selected date
  const appointmentStats = useMemo(() => {
    const stats = {
      total: dayAppointments.length,
      scheduled: 0,
      completed: 0,
      cancelled: 0
    }
    
    dayAppointments.forEach(apt => {
      switch (apt.status) {
        case 'scheduled':
        case 'confirmed':
          stats.scheduled++
          break
        case 'completed':
          stats.completed++
          break
        case 'cancelled':
          stats.cancelled++
          break
      }
    })
    
    return stats
  }, [dayAppointments])

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Lade Organisation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Termine</h1>
              <p className="text-sm text-muted-foreground">
                {appointmentStats.total} Termin{appointmentStats.total !== 1 ? 'e' : ''} am {formatDateForDisplay(selectedDate)}
              </p>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-2">
            
            {/* Quick Actions */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToToday}
              className={cn(
                "hidden sm:flex",
                isToday(selectedDate) && "bg-primary/10 text-primary border-primary/20"
              )}
            >
              Heute
            </Button>
            
            {/* Settings */}
            <Button asChild variant="ghost" size="sm">
              <Link href={`/org/${currentOrganization.slug}/appointments/settings`}>
                <Settings className="h-4 w-4" />
                <span className="sr-only">Einstellungen</span>
              </Link>
            </Button>
            
          </div>
        </div>
      </div>

      {/* Calendar Layout */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop: Side-by-side layout */}
        <div className="hidden lg:grid lg:grid-cols-5 h-full">
          {/* Month Grid Sidebar */}
          <div className="col-span-2 border-r border-border p-4 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="shrink-0 mb-4">
                <h2 className="text-lg font-semibold mb-2">Kalender</h2>
              </div>
              <div className="flex-1 overflow-auto">
                <MonthGrid
                  currentDate={currentMonth}
                  onDayClick={selectDate}
                  onMonthChange={goToMonth}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Timeline Main */}
          <div className="col-span-3 overflow-hidden">
            <Suspense fallback={<DayTimelineSkeleton className="h-full" />}>
              <DayTimeline
                selectedDate={selectedDate}
                onSlotClick={handleSlotClick}
                onAppointmentClick={handleAppointmentClick}
                className="h-full"
              />
            </Suspense>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="lg:hidden flex flex-col h-full">
          {/* Month Grid */}
          <div className="shrink-0 p-4 border-b border-border">
            <MonthGrid
              currentDate={currentMonth}
              onDayClick={selectDate}
              onMonthChange={goToMonth}
              className="w-full"
            />
          </div>
          
          {/* Timeline */}
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={<DayTimelineSkeleton className="h-full" />}>
              <DayTimeline
                selectedDate={selectedDate}
                onSlotClick={handleSlotClick}
                onAppointmentClick={handleAppointmentClick}
                className="h-full"
              />
            </Suspense>
          </div>
        </div>
      </div>


      {/* Quick Booking Dialog (for slot clicks) */}
      <QuickBookingDialog
        isOpen={isBookingDialogOpen && !!selectedSlot}
        onClose={closeDialogs}
        onSuccess={() => {
          closeDialogs()
          // React Query will refetch data automatically
        }}
        initialTimeSlot={selectedSlot ? {
          start: selectedSlot.time,
          end: selectedSlot.time, // Will be calculated in dialog
          date: selectedSlot.date
        } : undefined}
        initialDate={selectedDate}
        isExceptionAppointment={isExceptionAppointment}
      />
      
      {/* Appointment Detail Dialog (for appointment clicks) */}
      <AppointmentDetailDialog
        isOpen={isBookingDialogOpen && !!selectedAppointment}
        onClose={closeDialogs}
        appointment={selectedAppointment}
        onEdit={(appointmentBlock) => {
          setAppointmentToEdit(appointmentBlock)
          setIsEditDialogOpen(true)
          closeDialogs() // Close detail dialog
        }}
        onDelete={async (appointmentId) => {
          try {
            await deleteAppointment.mutateAsync(appointmentId)
            // Close the appointment detail dialog after successful delete
            closeDialogs()
            // React Query will automatically refetch and update the UI
          } catch (error) {
            // Error is already handled in the dialog component
            throw error
          }
        }}
      />

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setAppointmentToEdit(null)
        }}
        onSuccess={() => {
          setIsEditDialogOpen(false)
          setAppointmentToEdit(null)
          // React Query will refetch data automatically
        }}
        appointment={appointmentToEdit}
      />
    </div>
  )
}