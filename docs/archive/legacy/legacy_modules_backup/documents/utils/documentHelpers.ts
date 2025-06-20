import { format } from "date-fns"
import { de } from "date-fns/locale"
import { 
  Receipt, 
  Calendar, 
  BarChart, 
  FileText 
} from "lucide-react"

// Typen für bessere Dokumentnamen
export type DocumentDisplayInfo = {
  displayName: string
  description: string
  icon: any
  badgeColor: string
}

// Bessere Dokumentnamen generieren
export function generateDocumentDisplayName(
  type: string,
  createdAt: string,
  referenceId?: string,
  amount?: number,
  paymentMethod?: string,
  status?: string,
  reportDate?: string
): DocumentDisplayInfo {
  const date = new Date(createdAt)
  const formattedDate = format(date, 'dd.MM.yyyy', { locale: de })
  const formattedTime = format(date, 'HH:mm', { locale: de })

  switch (type) {
    case 'receipt':
      return {
        displayName: `Quittung_${formattedDate}_${formattedTime}${amount ? `_${amount.toFixed(2)}_CHF` : ''}${paymentMethod ? `_${paymentMethod.toUpperCase()}` : ''}`,
        description: `Kundenquittung vom ${formattedDate} um ${formattedTime}${amount ? ` über ${amount.toFixed(2)} CHF` : ''}${paymentMethod ? ` (${getPaymentMethodName(paymentMethod)})` : ''}`,
        icon: Receipt,
        badgeColor: 'blue'
      }

    case 'daily_report':
      const reportDateFormatted = reportDate ? format(new Date(reportDate), 'dd.MM.yyyy', { locale: de }) : formattedDate
      return {
        displayName: `Tagesabschluss_${reportDateFormatted}${status ? `_${status.toUpperCase()}` : ''}`,
        description: `Tagesabschluss vom ${reportDateFormatted}${status ? ` (${getStatusName(status)})` : ''}`,
        icon: Calendar,
        badgeColor: 'green'
      }

    case 'monthly_report':
      const monthYear = format(date, 'MMMM_yyyy', { locale: de })
      return {
        displayName: `Monatsabschluss_${monthYear}${status ? `_${status.toUpperCase()}` : ''}`,
        description: `Monatsabschluss für ${format(date, 'MMMM yyyy', { locale: de })}${status ? ` (${getStatusName(status)})` : ''}`,
        icon: BarChart,
        badgeColor: 'purple'
      }

    case 'expense_receipt':
      return {
        displayName: `Ausgabe_${formattedDate}${amount ? `_${amount.toFixed(2)}_CHF` : ''}${referenceId ? `_${referenceId}` : ''}`,
        description: `Ausgabenbeleg vom ${formattedDate}${amount ? ` über ${amount.toFixed(2)} CHF` : ''}`,
        icon: FileText,
        badgeColor: 'orange'
      }

    default:
      return {
        displayName: `Dokument_${formattedDate}_${formattedTime}`,
        description: `Dokument vom ${formattedDate} um ${formattedTime}`,
        icon: FileText,
        badgeColor: 'gray'
      }
  }
}

// Hilfsfunktionen für bessere Lesbarkeit
export function getDocumentTypeName(type: string): string {
  switch (type) {
    case 'receipt':
      return 'Quittung'
    case 'daily_report':
      return 'Tagesabschluss'
    case 'monthly_report':
      return 'Monatsabschluss'
    case 'expense_receipt':
      return 'Ausgabenbeleg'
    default:
      return 'Sonstiges'
  }
}

export function getPaymentMethodName(method: string): string {
  switch (method.toLowerCase()) {
    case 'cash':
      return 'Bar'
    case 'twint':
      return 'TWINT'
    case 'sumup':
      return 'SumUp'
    case 'bank':
      return 'Bank'
    default:
      return method
  }
}

export function getStatusName(status: string): string {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'Entwurf'
    case 'closed':
      return 'Abgeschlossen'
    case 'corrected':
      return 'Korrigiert'
    default:
      return status
  }
}

// Badge-Farben für UI
export function getBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case 'receipt':
      return 'default'
    case 'daily_report':
      return 'secondary'
    case 'monthly_report':
      return 'outline'
    case 'expense_receipt':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Dateigröße formatieren
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unbekannt"
  
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

// Datum formatieren
export function formatDisplayDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'dd.MM.yyyy', { locale: de })
  } catch (e) {
    return dateString
  }
}

// Betrag formatieren
export function formatAmount(amount?: number, type?: string): string {
  if (!amount) return '-'
  
  const formatted = `${amount.toFixed(2)} CHF`
  
  // Farbe basierend auf Dokumenttyp
  if (type === 'expense_receipt') {
    return `- ${formatted}` // Ausgaben als negativ
  }
  
  return formatted
}