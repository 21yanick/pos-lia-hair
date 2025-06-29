'use client'

import { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Calendar } from '@/shared/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { useAppointmentsByDate, useAppointmentsByDateRange } from '../hooks/useAppointments'
import { formatDateForDisplay, getWeekRange, getWeekDays, swissLocale } from '@/shared/utils/dateUtils'
import { cn } from '@/shared/utils'
import { AgendaView } from './calendar/AgendaView'
import { SimpleWeekView } from './calendar/SimpleWeekView'
import { AppointmentDialog } from './AppointmentDialog'

type ViewMode = 'agenda' | 'week'

export function AppointmentsPage() {
  const { currentOrganization } = useCurrentOrganization()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('agenda')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Get date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      return getWeekRange(selectedDate)
    }
    return { start: selectedDate, end: selectedDate }
  }, [selectedDate, viewMode])

  // Fetch appointments based on view mode
  const { 
    data: agendaAppointments = [], 
    isLoading: isLoadingAgenda, 
    error: agendaError 
  } = useAppointmentsByDate(currentOrganization?.id || '', selectedDate)

  const { 
    data: weekAppointments = [], 
    isLoading: isLoadingWeek, 
    error: weekError 
  } = useAppointmentsByDateRange(
    currentOrganization?.id || '',
    dateRange.start,
    dateRange.end
  )

  // Select appropriate data and loading states
  const appointments = viewMode === 'agenda' ? agendaAppointments : weekAppointments
  const isLoading = viewMode === 'agenda' ? isLoadingAgenda : isLoadingWeek
  const error = viewMode === 'agenda' ? agendaError : weekError

  // Navigation handlers
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'agenda') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1))
    } else {
      // Week navigation
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7))
    }
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  // Get appointment stats for display
  const appointmentStats = useMemo(() => {
    if (viewMode === 'agenda') {
      const scheduled = agendaAppointments.filter(apt => apt.status === 'scheduled').length
      const completed = agendaAppointments.filter(apt => apt.status === 'completed').length
      const cancelled = agendaAppointments.filter(apt => apt.status === 'cancelled').length
      return { total: agendaAppointments.length, scheduled, completed, cancelled }
    } else {
      const scheduled = weekAppointments.filter(apt => apt.status === 'scheduled').length
      const completed = weekAppointments.filter(apt => apt.status === 'completed').length
      const cancelled = weekAppointments.filter(apt => apt.status === 'cancelled').length
      return { total: weekAppointments.length, scheduled, completed, cancelled }
    }
  }, [agendaAppointments, weekAppointments, viewMode])

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Organisation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Termine</h1>
            <p className="text-sm text-muted-foreground">
              {appointmentStats.total} Termin{appointmentStats.total !== 1 ? 'e' : ''} 
              {viewMode === 'agenda' 
                ? ` am ${formatDateForDisplay(selectedDate)}`
                : ` in der Woche vom ${formatDateForDisplay(dateRange.start)}`
              }
            </p>
          </div>
        </div>
        
        {/* Desktop Add Button */}
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="hidden md:flex"
        >
          <Plus className="mr-2 h-4 w-4" />
          Neuen Termin erstellen
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {viewMode === 'agenda' 
                  ? formatDateForDisplay(selectedDate)
                  : `${formatDateForDisplay(dateRange.start)} - ${formatDateForDisplay(dateRange.end)}`
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date)
                    setIsDatePickerOpen(false)
                  }
                }}
                locale={swissLocale}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Heute
          </Button>
        </div>

        {/* View Mode + Stats */}
        <div className="flex items-center gap-4">
          {/* Appointment Stats */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {appointmentStats.scheduled} Geplant
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {appointmentStats.completed} Erledigt
            </Badge>
            {appointmentStats.cancelled > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {appointmentStats.cancelled} Storniert
              </Badge>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'agenda' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('agenda')}
              className="h-8"
            >
              Tag
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="h-8 hidden md:flex"
            >
              Woche
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-destructive font-medium">Fehler beim Laden der Termine</p>
              <p className="text-sm text-muted-foreground mt-1">
                Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && appointments.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {viewMode === 'agenda' 
                  ? `Keine Termine am ${formatDateForDisplay(selectedDate)}`
                  : `Keine Termine in dieser Woche`
                }
              </h3>
              <p className="text-muted-foreground mb-6">
                Erstellen Sie einen neuen Termin, um loszulegen.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ersten Termin erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Views */}
      {!isLoading && !error && appointments.length > 0 && (
        <>
          {/* Mobile: Always show agenda view */}
          <div className="block md:hidden">
            <AgendaView 
              appointments={appointments} 
              selectedDate={selectedDate} 
              onEditAppointment={(appointment) => {
                // TODO: Open edit dialog
                console.log('Edit appointment:', appointment)
              }}
            />
          </div>
          
          {/* Desktop: Show selected view */}
          <div className="hidden md:block">
            {viewMode === 'agenda' ? (
              <AgendaView 
                appointments={appointments} 
                selectedDate={selectedDate} 
                onEditAppointment={(appointment) => {
                  // TODO: Open edit dialog
                  console.log('Edit appointment:', appointment)
                }}
              />
            ) : (
              <SimpleWeekView 
                appointments={appointments} 
                selectedDate={selectedDate} 
                onEditAppointment={(appointment) => {
                  // TODO: Open edit dialog
                  console.log('Edit appointment:', appointment)
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Mobile Floating Add Button */}
      <Button 
        onClick={() => setIsCreateDialogOpen(true)}
        className="fixed bottom-6 right-6 md:hidden rounded-full h-14 w-14 shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Appointment Dialog */}
      <AppointmentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          // Dialog will close automatically
          // React Query will refetch data automatically
        }}
        initialDate={selectedDate}
      />
    </div>
  )
}