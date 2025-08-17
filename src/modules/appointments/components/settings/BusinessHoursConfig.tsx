'use client'

import { Clock, Plus, RotateCcw, Save, X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Separator } from '@/shared/components/ui/separator'
import { Switch } from '@/shared/components/ui/switch'
import { useBusinessSettingsQuery } from '@/shared/hooks/business/useBusinessSettingsQuery'
import type { DayWorkingHours, WeekDay, WorkingHours } from '@/shared/types/businessSettings'
import { DEFAULT_WORKING_HOURS } from '@/shared/types/businessSettings'
import { cn } from '@/shared/utils'

const WEEKDAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: 'monday', label: 'Montag', short: 'Mo' },
  { key: 'tuesday', label: 'Dienstag', short: 'Di' },
  { key: 'wednesday', label: 'Mittwoch', short: 'Mi' },
  { key: 'thursday', label: 'Donnerstag', short: 'Do' },
  { key: 'friday', label: 'Freitag', short: 'Fr' },
  { key: 'saturday', label: 'Samstag', short: 'Sa' },
  { key: 'sunday', label: 'Sonntag', short: 'So' },
]

interface BusinessHoursConfigProps {
  className?: string
}

export function BusinessHoursConfig({ className }: BusinessHoursConfigProps) {
  const { settings, loading, saving, updateWorkingHours } = useBusinessSettingsQuery()
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    settings?.working_hours || DEFAULT_WORKING_HOURS
  )
  const [hasChanges, setHasChanges] = useState(false)

  // Update local state when settings load
  if (
    settings?.working_hours &&
    !hasChanges &&
    JSON.stringify(workingHours) !== JSON.stringify(settings.working_hours)
  ) {
    setWorkingHours(settings.working_hours)
  }

  const updateDayHours = (day: WeekDay, updates: Partial<DayWorkingHours>) => {
    const updatedHours = {
      ...workingHours,
      [day]: {
        ...workingHours[day],
        ...updates,
      },
    }
    setWorkingHours(updatedHours)
    setHasChanges(true)
  }

  const addBreak = (day: WeekDay) => {
    const dayHours = workingHours[day]
    const newBreak = { start: '12:00', end: '13:00' }
    updateDayHours(day, {
      breaks: [...dayHours.breaks, newBreak],
    })
  }

  const removeBreak = (day: WeekDay, breakIndex: number) => {
    const dayHours = workingHours[day]
    updateDayHours(day, {
      breaks: dayHours.breaks.filter((_, index) => index !== breakIndex),
    })
  }

  const updateBreak = (day: WeekDay, breakIndex: number, field: 'start' | 'end', value: string) => {
    const dayHours = workingHours[day]
    const updatedBreaks = dayHours.breaks.map((breakTime, index) =>
      index === breakIndex ? { ...breakTime, [field]: value } : breakTime
    )
    updateDayHours(day, { breaks: updatedBreaks })
  }

  const handleSave = async () => {
    try {
      await updateWorkingHours(workingHours)
      setHasChanges(false)
    } catch (error) {
      // Error handling delegated to UI layer
    }
  }

  const handleReset = () => {
    setWorkingHours(settings?.working_hours || DEFAULT_WORKING_HOURS)
    setHasChanges(false)
  }

  const copyFromDay = (sourceDay: WeekDay, targetDay: WeekDay) => {
    updateDayHours(targetDay, { ...workingHours[sourceDay] })
  }

  if (loading && !settings) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Arbeitszeiten</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
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
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Arbeitszeiten</CardTitle>
              <CardDescription>
                Konfigurieren Sie Ihre Geschäftszeiten für jeden Wochentag
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

      <CardContent className="space-y-6">
        {WEEKDAYS.map((weekday) => {
          const dayHours = workingHours[weekday.key]

          return (
            <div key={weekday.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 text-center">
                    {weekday.short}
                  </Badge>
                  <Label className="font-medium">{weekday.label}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Geschlossen</Label>
                  <Switch
                    checked={dayHours.closed}
                    onCheckedChange={(closed) => updateDayHours(weekday.key, { closed })}
                  />
                </div>
              </div>

              {!dayHours.closed && (
                <div className="ml-11 space-y-4">
                  {/* Opening Hours */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Öffnungszeit</Label>
                      <Input
                        type="time"
                        value={dayHours.start}
                        onChange={(e) => updateDayHours(weekday.key, { start: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Schließzeit</Label>
                      <Input
                        type="time"
                        value={dayHours.end}
                        onChange={(e) => updateDayHours(weekday.key, { end: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  {/* Breaks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Pausen</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBreak(weekday.key)}
                        className="h-7 px-2"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Pause hinzufügen
                      </Button>
                    </div>

                    {dayHours.breaks.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Keine Pausen konfiguriert
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dayHours.breaks.map((breakTime, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="grid grid-cols-2 gap-2 flex-1">
                              <Input
                                type="time"
                                value={breakTime.start}
                                onChange={(e) =>
                                  updateBreak(weekday.key, index, 'start', e.target.value)
                                }
                                className="font-mono text-sm"
                                placeholder="Von"
                              />
                              <Input
                                type="time"
                                value={breakTime.end}
                                onChange={(e) =>
                                  updateBreak(weekday.key, index, 'end', e.target.value)
                                }
                                className="font-mono text-sm"
                                placeholder="Bis"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBreak(weekday.key, index)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Copy Actions */}
                  <div className="pt-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">Schnellkopie:</Label>
                    <div className="flex flex-wrap gap-1">
                      {WEEKDAYS.filter((d) => d.key !== weekday.key).map((otherDay) => (
                        <Button
                          key={otherDay.key}
                          variant="outline"
                          size="sm"
                          onClick={() => copyFromDay(otherDay.key, weekday.key)}
                          className="h-6 px-2 text-xs"
                        >
                          von {otherDay.short}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Visual separator except for last item */}
              {weekday.key !== 'sunday' && <Separator />}
            </div>
          )
        })}

        {/* Summary Section */}
        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Zusammenfassung
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {WEEKDAYS.map((weekday) => {
              const dayHours = workingHours[weekday.key]
              return (
                <div key={weekday.key} className="flex justify-between">
                  <span className="font-medium">{weekday.label}:</span>
                  <span
                    className={cn(
                      'font-mono',
                      dayHours.closed ? 'text-muted-foreground' : 'text-foreground'
                    )}
                  >
                    {dayHours.closed ? 'Geschlossen' : `${dayHours.start} - ${dayHours.end}`}
                    {!dayHours.closed && dayHours.breaks.length > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({dayHours.breaks.length} Pause{dayHours.breaks.length !== 1 ? 'n' : ''})
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
