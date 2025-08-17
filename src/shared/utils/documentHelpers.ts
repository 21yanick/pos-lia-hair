// Document Helper Utilities für Business Logic
// Vereinfachte Version ohne UI-Dependencies

export type DocumentDisplayInfo = {
  displayName: string
  description: string
}

// Einfache Dokumentnamen generieren (ohne date-fns dependency)
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
  const formattedDate = date.toLocaleDateString('de-CH')
  const formattedTime = date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })

  switch (type) {
    case 'receipt':
      return {
        displayName: `Quittung_${formattedDate}_${formattedTime}${amount ? `_${amount.toFixed(2)}_CHF` : ''}${paymentMethod ? `_${paymentMethod.toUpperCase()}` : ''}`,
        description: `Kundenquittung vom ${formattedDate} um ${formattedTime}${amount ? ` über ${amount.toFixed(2)} CHF` : ''}${paymentMethod ? ` (${getPaymentMethodName(paymentMethod)})` : ''}`,
      }

    case 'daily_report': {
      const reportDateFormatted = reportDate
        ? new Date(reportDate).toLocaleDateString('de-CH')
        : formattedDate
      return {
        displayName: `Tagesabschluss_${reportDateFormatted}${status ? `_${status.toUpperCase()}` : ''}`,
        description: `Tagesabschluss vom ${reportDateFormatted}${status ? ` (${getStatusName(status)})` : ''}`,
      }
    }

    case 'monthly_report': {
      const monthYear = date.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' })
      return {
        displayName: `Monatsabschluss_${monthYear.replace(' ', '_')}${status ? `_${status.toUpperCase()}` : ''}`,
        description: `Monatsabschluss für ${monthYear}${status ? ` (${getStatusName(status)})` : ''}`,
      }
    }

    case 'expense_receipt':
      return {
        displayName: `Ausgabe_${formattedDate}${amount ? `_${amount.toFixed(2)}_CHF` : ''}${referenceId ? `_${referenceId}` : ''}`,
        description: `Ausgabenbeleg vom ${formattedDate}${amount ? ` über ${amount.toFixed(2)} CHF` : ''}`,
      }

    default:
      return {
        displayName: `Dokument_${formattedDate}_${formattedTime}`,
        description: `Dokument vom ${formattedDate} um ${formattedTime}`,
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

// Dateigröße formatieren
export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unbekannt'

  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}

// Datum formatieren (Swiss style)
export function formatDisplayDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('de-CH')
  } catch (_e) {
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
