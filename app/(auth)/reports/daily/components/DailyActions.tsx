"use client"

import { Button } from "@/shared/components/ui/button"
import { Download, FileText, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar"
import { de } from "date-fns/locale"
import { StatusBadge } from "./StatusBadge"
import type { DailySummary, DailyActionType } from "../utils/dailyTypes"

interface DailyActionsProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  dailySummary: DailySummary | null
  hasTransactions: boolean
  onAction: (action: DailyActionType) => void
  isLoading?: boolean
}

export function DailyActions({
  selectedDate,
  onDateChange,
  dailySummary,
  hasTransactions,
  onAction,
  isLoading = false
}: DailyActionsProps) {
  const canClose = hasTransactions && dailySummary?.status !== "closed"
  const canUpdate = false // Deaktiviert - Tagesabschluss soll final sein (TODO: Korrektur-System implementieren)
  const canExportPDF = dailySummary !== null
  
  // Navigation functions
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate)
    previousDay.setDate(previousDay.getDate() - 1)
    onDateChange(previousDay)
  }

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)
    onDateChange(nextDay)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  // Check if today is selected
  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="flex items-center gap-2">
      {/* Date Navigation */}
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToPreviousDay}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={16} />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={goToNextDay}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={16} />
        </Button>
        
        {/* Jump to today button */}
        {!isToday && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={goToToday}
            className="text-xs ml-1"
          >
            Heute
          </Button>
        )}
      </div>

      {/* Datum auswählen */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar size={16} />
            Datum
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateChange(date)
              }
            }}
            locale={de}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Status Badge */}
      {dailySummary && (
        <StatusBadge status={dailySummary.status} />
      )}

      {/* PDF Export Button */}
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        disabled={!canExportPDF || isLoading}
        onClick={() => onAction('export_pdf')}
      >
        <Download size={16} />
        PDF
      </Button>

      {/* Abschließen/Aktualisieren Button */}
      {(canClose || canUpdate) && (
        <Button 
          className="flex items-center gap-2" 
          disabled={isLoading}
          onClick={() => canUpdate ? onAction('update') : onAction('close')}
        >
          <FileText size={16} />
          {canUpdate ? "Aktualisieren" : "Abschließen"}
        </Button>
      )}
    </div>
  )
}