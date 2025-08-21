'use client'

import {
  Briefcase,
  CalendarDays,
  CalendarIcon,
  Coffee,
  Edit,
  Plane,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Textarea } from '@/shared/components/ui/textarea'
import { useBusinessSettingsQuery } from '@/shared/hooks/business/useBusinessSettingsQuery'
import type { VacationPeriod } from '@/shared/types/businessSettings'
import { cn } from '@/shared/utils'
import { formatDateForDisplay, swissLocale } from '@/shared/utils/dateUtils'

interface VacationManagerProps {
  className?: string
}

const VACATION_ICONS = {
  Urlaub: Plane,
  Ferien: Plane,
  Feiertag: Coffee,
  Geschäftsreise: Briefcase,
  Fortbildung: Briefcase,
  Krankheit: Coffee,
  Sonstiges: CalendarDays,
}

const getVacationIcon = (reason: string) => {
  const key = Object.keys(VACATION_ICONS).find((k) =>
    reason.toLowerCase().includes(k.toLowerCase())
  )
  return key ? VACATION_ICONS[key as keyof typeof VACATION_ICONS] : CalendarDays
}

const getVacationVariant = (
  reason: string
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (reason.toLowerCase().includes('urlaub') || reason.toLowerCase().includes('ferien')) {
    return 'default'
  }
  if (reason.toLowerCase().includes('feiertag')) {
    return 'secondary'
  }
  if (reason.toLowerCase().includes('krankheit')) {
    return 'destructive'
  }
  return 'outline'
}

const calculateDays = (start: string, end: string): number => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end day
}

export function VacationManager({ className }: VacationManagerProps) {
  const { settings, loading, saving, addVacationPeriod, removeVacationPeriod } =
    useBusinessSettingsQuery()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newVacation, setNewVacation] = useState<Partial<VacationPeriod>>({
    start: '',
    end: '',
    reason: '',
  })
  const [datePickerOpen, setDatePickerOpen] = useState<'start' | 'end' | null>(null)

  const vacationPeriods = settings?.vacation_periods || []

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (date) {
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      setNewVacation((prev) => ({ ...prev, [type]: dateStr }))
      setDatePickerOpen(null)
    }
  }

  const handleAddVacation = async () => {
    if (!newVacation.start || !newVacation.end || !newVacation.reason?.trim()) {
      return
    }

    if (newVacation.start > newVacation.end) {
      return // Should show error
    }

    try {
      await addVacationPeriod({
        start: newVacation.start,
        end: newVacation.end,
        reason: newVacation.reason?.trim(),
      })

      setNewVacation({ start: '', end: '', reason: '' })
      setIsAddDialogOpen(false)
    } catch (_error) {
      // Error handling delegated to UI layer
    }
  }

  const handleRemoveVacation = async (index: number) => {
    try {
      await removeVacationPeriod(index)
    } catch (_error) {
      // Error handling delegated to UI layer
    }
  }

  const isFormValid =
    newVacation.start &&
    newVacation.end &&
    newVacation.reason?.trim() &&
    newVacation.start <= newVacation.end

  if (loading && !settings) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            <CardTitle>Urlaubszeiten</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => i + 1).map((row) => (
              <div key={`skeleton-vacation-${row}`} className="animate-pulse">
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Urlaubszeiten</CardTitle>
              <CardDescription>
                Verwalten Sie mehrtägige Schließungen, Urlaub und Feiertage
              </CardDescription>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="sm:hidden">Hinzufügen</span>
                <span className="hidden sm:inline">Urlaubszeit hinzufügen</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Urlaubszeit</DialogTitle>
                <DialogDescription>
                  Legen Sie einen Zeitraum fest, in dem Ihr Geschäft geschlossen ist.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Startdatum</Label>
                    <Popover
                      open={datePickerOpen === 'start'}
                      onOpenChange={(open) => setDatePickerOpen(open ? 'start' : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newVacation.start
                            ? formatDateForDisplay(new Date(newVacation.start))
                            : 'Datum wählen'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newVacation.start ? new Date(newVacation.start) : undefined}
                          onSelect={(date) => handleDateSelect(date, 'start')}
                          locale={swissLocale}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Enddatum</Label>
                    <Popover
                      open={datePickerOpen === 'end'}
                      onOpenChange={(open) => setDatePickerOpen(open ? 'end' : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newVacation.end
                            ? formatDateForDisplay(new Date(newVacation.end))
                            : 'Datum wählen'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newVacation.end ? new Date(newVacation.end) : undefined}
                          onSelect={(date) => handleDateSelect(date, 'end')}
                          locale={swissLocale}
                          disabled={(date) => {
                            if (date < new Date()) return true
                            if (newVacation.start && date < new Date(newVacation.start)) return true
                            return false
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Duration Display */}
                {newVacation.start && newVacation.end && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">
                      Dauer:{' '}
                      <span className="font-medium text-foreground">
                        {calculateDays(newVacation.start, newVacation.end)} Tag
                        {calculateDays(newVacation.start, newVacation.end) !== 1 ? 'e' : ''}
                      </span>
                    </p>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <Label>Grund</Label>
                  <Textarea
                    value={newVacation.reason || ''}
                    onChange={(e) =>
                      setNewVacation((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    placeholder="z.B. Sommerurlaub, Weihnachtsferien, Fortbildung..."
                    rows={3}
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <Label className="text-sm">Schnellauswahl:</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Sommerurlaub', 'Weihnachtsferien', 'Fortbildung', 'Feiertag'].map(
                      (preset) => (
                        <Button
                          key={preset}
                          variant="outline"
                          size="sm"
                          onClick={() => setNewVacation((prev) => ({ ...prev, reason: preset }))}
                          className="h-7 text-xs"
                        >
                          {preset}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleAddVacation} disabled={!isFormValid || saving}>
                  {saving ? 'Hinzufügen...' : 'Hinzufügen'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {vacationPeriods.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Urlaubszeiten</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Sie haben noch keine Urlaubszeiten oder Schließungen konfiguriert. Fügen Sie eine
              hinzu, um Termine während dieser Zeit zu blockieren.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Urlaubszeit hinzufügen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {vacationPeriods.map((vacation, index) => {
              const VacationIcon = getVacationIcon(vacation.reason)
              const days = calculateDays(vacation.start, vacation.end)
              const isUpcoming = new Date(vacation.start) > new Date()
              const isCurrent =
                new Date() >= new Date(vacation.start) && new Date() <= new Date(vacation.end)

              return (
                <div
                  key={`vacation-${vacation.start}-${vacation.end}`}
                  className={cn(
                    'border rounded-lg p-4 transition-colors',
                    isCurrent && 'bg-destructive/5 border-destructive/20',
                    isUpcoming && 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                          isCurrent
                            ? 'bg-destructive/10 text-destructive'
                            : isUpcoming
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                              : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <VacationIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <h4 className="font-medium mb-1">{vacation.reason}</h4>
                          <div className="flex flex-wrap gap-1">
                            <Badge
                              variant={getVacationVariant(vacation.reason)}
                              className="text-xs"
                            >
                              {days} Tag{days !== 1 ? 'e' : ''}
                            </Badge>
                            {isCurrent && (
                              <Badge variant="destructive" className="text-xs">
                                Aktuell
                              </Badge>
                            )}
                            {isUpcoming && (
                              <Badge variant="secondary" className="text-xs">
                                Geplant
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                          <span className="font-mono">
                            {formatDateForDisplay(new Date(vacation.start))}
                          </span>
                          <span className="hidden sm:inline">bis</span>
                          <span className="font-mono">
                            {formatDateForDisplay(new Date(vacation.end))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-start">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Urlaubszeit löschen</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie "{vacation.reason}" wirklich löschen? Diese Aktion kann
                              nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveVacation(index)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
