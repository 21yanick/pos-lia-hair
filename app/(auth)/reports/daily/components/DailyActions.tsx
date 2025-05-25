"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, Calendar } from "lucide-react"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
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
  const canUpdate = dailySummary?.status === "closed"
  const canExportPDF = dailySummary !== null
  
  return (
    <div className="flex items-center gap-2">
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