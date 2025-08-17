'use client'

import { Calendar, Info, RotateCcw, Save, Settings, Shield } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { useBusinessSettingsQuery } from '@/shared/hooks/business/useBusinessSettingsQuery'
import type { BookingRules, DisplayPreferences } from '@/shared/types/businessSettings'
import { DEFAULT_BOOKING_RULES, DEFAULT_DISPLAY_PREFERENCES } from '@/shared/types/businessSettings'

interface BookingRulesConfigProps {
  className?: string
}

const SLOT_INTERVALS = [
  { value: 15, label: '15 Minuten', description: 'Sehr flexible Buchungen' },
  { value: 30, label: '30 Minuten', description: 'Standard für die meisten Salons' },
] as const

const DEFAULT_DURATIONS = [
  { value: 30, label: '30 Minuten', description: 'Kurze Services' },
  { value: 45, label: '45 Minuten', description: 'Standard Services' },
  { value: 60, label: '60 Minuten', description: 'Längere Services' },
] as const

const MAX_ADVANCE_DAYS = [
  { value: 30, label: '30 Tage', description: '1 Monat voraus' },
  { value: 60, label: '60 Tage', description: '2 Monate voraus' },
  { value: 90, label: '90 Tage', description: '3 Monate voraus' },
] as const

const MIN_ADVANCE_HOURS = [
  { value: 1, label: '1 Stunde', description: 'Last-Minute Buchungen' },
  { value: 2, label: '2 Stunden', description: 'Kurze Vorlaufzeit' },
  { value: 4, label: '4 Stunden', description: 'Halber Tag Vorlauf' },
  { value: 24, label: '24 Stunden', description: 'Ein Tag Vorlauf' },
] as const

const BUFFER_MINUTES = [
  { value: 0, label: 'Keine Puffer', description: 'Termine direkt nacheinander' },
  { value: 5, label: '5 Minuten', description: 'Kurze Pause zwischen Terminen' },
  { value: 10, label: '10 Minuten', description: 'Standard Puffer' },
] as const

const TIMELINE_HOURS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 6 // Start at 6 AM
  return {
    value: `${hour.toString().padStart(2, '0')}:00`,
    label: `${hour.toString().padStart(2, '0')}:00`,
  }
})

export function BookingRulesConfig({ className }: BookingRulesConfigProps) {
  const { settings, loading, saving, updateBookingRules, updateDisplayPreferences } =
    useBusinessSettingsQuery()

  const [bookingRules, setBookingRules] = useState<BookingRules>(
    settings?.booking_rules || DEFAULT_BOOKING_RULES
  )
  const [displayPreferences, setDisplayPreferences] = useState<DisplayPreferences>(
    settings?.display_preferences || DEFAULT_DISPLAY_PREFERENCES
  )
  const [hasChanges, setHasChanges] = useState(false)

  // Update local state when settings load
  if (
    settings?.booking_rules &&
    !hasChanges &&
    JSON.stringify(bookingRules) !== JSON.stringify(settings.booking_rules)
  ) {
    setBookingRules(settings.booking_rules)
  }
  if (
    settings?.display_preferences &&
    !hasChanges &&
    JSON.stringify(displayPreferences) !== JSON.stringify(settings.display_preferences)
  ) {
    setDisplayPreferences(settings.display_preferences)
  }

  const updateBookingRule = <K extends keyof BookingRules>(key: K, value: BookingRules[K]) => {
    setBookingRules((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const updateDisplayPreference = <K extends keyof DisplayPreferences>(
    key: K,
    value: DisplayPreferences[K]
  ) => {
    setDisplayPreferences((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      await Promise.all([
        updateBookingRules(bookingRules),
        updateDisplayPreferences(displayPreferences),
      ])
      setHasChanges(false)
    } catch (_error) {
      // Error handling delegated to UI layer
    }
  }

  const handleReset = () => {
    setBookingRules(settings?.booking_rules || DEFAULT_BOOKING_RULES)
    setDisplayPreferences(settings?.display_preferences || DEFAULT_DISPLAY_PREFERENCES)
    setHasChanges(false)
  }

  if (loading && !settings) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Buchungsregeln</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                <div className="h-10 bg-muted rounded"></div>
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
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Buchungsregeln & Anzeige</CardTitle>
              <CardDescription>
                Konfigurieren Sie Buchungseinschränkungen und Kalender-Anzeige
              </CardDescription>
            </div>
          </div>

          {hasChanges && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex-1 sm:flex-initial"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <span className="sm:hidden">Reset</span>
                <span className="hidden sm:inline">Zurücksetzen</span>
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-initial"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Booking Rules Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Buchungsregeln</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot Interval */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Buchungsraster</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  In welchen Intervallen können Termine gebucht werden?
                </p>
              </div>
              <Select
                value={bookingRules.slotInterval.toString()}
                onValueChange={(value) =>
                  updateBookingRule('slotInterval', parseInt(value, 10) as 15 | 30)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT_INTERVALS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Duration */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Standard-Dauer</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Voreingestellte Termindauer bei neuen Buchungen
                </p>
              </div>
              <Select
                value={bookingRules.defaultDuration.toString()}
                onValueChange={(value) =>
                  updateBookingRule('defaultDuration', parseInt(value, 10) as 30 | 45 | 60)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_DURATIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Advance Days */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Buchung im Voraus</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Wie weit im Voraus können Termine gebucht werden?
                </p>
              </div>
              <Select
                value={bookingRules.maxAdvanceDays.toString()}
                onValueChange={(value) =>
                  updateBookingRule('maxAdvanceDays', parseInt(value, 10) as 30 | 60 | 90)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_ADVANCE_DAYS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Advance Hours */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Mindest-Vorlaufzeit</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Wie viel Vorlaufzeit ist für Buchungen erforderlich?
                </p>
              </div>
              <Select
                value={bookingRules.minAdvanceHours.toString()}
                onValueChange={(value) =>
                  updateBookingRule('minAdvanceHours', parseInt(value, 10) as 1 | 2 | 4 | 24)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MIN_ADVANCE_HOURS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buffer and Auto-confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Pufferzeit zwischen Terminen</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatische Pause zwischen aufeinanderfolgenden Terminen
                </p>
              </div>
              <Select
                value={bookingRules.bufferMinutes.toString()}
                onValueChange={(value) =>
                  updateBookingRule('bufferMinutes', parseInt(value, 10) as 0 | 5 | 10)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUFFER_MINUTES.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Display Preferences Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Kalender-Anzeige</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline Hours */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Timeline Startzeit</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Ab welcher Uhrzeit soll die Tagesansicht beginnen?
                </p>
              </div>
              <Select
                value={displayPreferences.timelineStart}
                onValueChange={(value) => updateDisplayPreference('timelineStart', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_HOURS.slice(0, 8).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Timeline Endzeit</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Bis zu welcher Uhrzeit soll die Tagesansicht gehen?
                </p>
              </div>
              <Select
                value={displayPreferences.timelineEnd}
                onValueChange={(value) => updateDisplayPreference('timelineEnd', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_HOURS.slice(8).map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Info className="h-4 w-4 text-primary mt-0.5" />
            <h4 className="font-medium">Aktuelle Konfiguration</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buchungsraster:</span>
                <span className="font-medium">{bookingRules.slotInterval} Min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standard-Dauer:</span>
                <span className="font-medium">{bookingRules.defaultDuration} Min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max. Vorlauf:</span>
                <span className="font-medium">{bookingRules.maxAdvanceDays} Tage</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min. Vorlauf:</span>
                <span className="font-medium">{bookingRules.minAdvanceHours} Std</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pufferzeit:</span>
                <span className="font-medium">{bookingRules.bufferMinutes} Min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timeline:</span>
                <span className="font-medium">
                  {displayPreferences.timelineStart} - {displayPreferences.timelineEnd}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
