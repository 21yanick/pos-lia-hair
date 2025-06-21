import { format } from 'date-fns'
import { de } from 'date-fns/locale'

// Schweizer Zeitzone
const SWISS_TIMEZONE = 'Europe/Zurich'

/**
 * Erstellt ein Datum in Schweizer Zeitzone
 */
export function createSwissDate(dateInput?: Date | string): Date {
  const date = dateInput ? new Date(dateInput) : new Date()
  
  // Für die meisten Anwendungen: Gib das originale Datum zurück
  // Die Zeitzone-Konvertierung erfolgt in den spezifischen Format-Funktionen
  return date
}

/**
 * Formatiert Datum für API-Anfragen (YYYY-MM-DD) in Schweizer Zeit
 */
export function formatDateForAPI(date: Date | string): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  
  // Verwende Intl.DateTimeFormat für korrekte Schweizer Zeitzone
  const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gibt YYYY-MM-DD Format
    timeZone: SWISS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  return formatter.format(inputDate)
}

/**
 * Formatiert Datum für Anzeige (DD.MM.YYYY) in Schweizer Zeit
 */
export function formatDateForDisplay(date: Date | string): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  
  // Verwende Intl.DateTimeFormat für korrekte Schweizer Zeitzone
  const formatter = new Intl.DateTimeFormat('de-CH', {
    timeZone: SWISS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  return formatter.format(inputDate)
}

/**
 * Parst deutsches Datumsformat (DD.MM.YYYY) zu Date object
 * Gegenstück zu formatDateForDisplay()
 */
// Cache für häufig geparste Daten (Session-basiert)
const parseDateCache = new Map<string, Date>()

export function parseDateFromDisplay(germanDateString: string): Date {
  // Cache-Lookup zuerst (O(1) Zugriff)
  const cached = parseDateCache.get(germanDateString)
  if (cached) {
    return new Date(cached.getTime()) // Return copy to avoid mutation
  }
  
  // Format: "15.01.2025" → Date object
  const parts = germanDateString.trim().split('.')
  if (parts.length !== 3) {
    // console.warn('Invalid German date format:', germanDateString)
    return new Date() // Fallback zu heute
  }
  
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // JavaScript months are 0-based
  const year = parseInt(parts[2], 10)
  
  // Validierung
  if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 0 || month > 11 || year < 1900) {
    // console.warn('Invalid date components:', { day, month: month + 1, year })
    return new Date() // Fallback zu heute
  }
  
  const result = new Date(year, month, day)
  
  // Cache das Ergebnis für zukünftige Verwendung
  parseDateCache.set(germanDateString, result)
  
  return result
}

/**
 * Formatiert Datum und Zeit für Anzeige in Schweizer Zeit
 */
export function formatDateTimeForDisplay(date: Date | string): string {
  const swissDate = createSwissDate(date)
  return format(swissDate, 'dd.MM.yyyy HH:mm', { locale: de })
}

/**
 * Formatiert nur die Zeit für Anzeige in Schweizer Zeit
 */
export function formatTimeForDisplay(date: Date | string): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date
  return inputDate.toLocaleTimeString('de-CH', {
    timeZone: SWISS_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Aktuelles Schweizer Datum (ohne Zeit)
 */
export function getTodaySwiss(): Date {
  return createSwissDate()
}

/**
 * Schweizer Datum als YYYY-MM-DD String für heute
 */
export function getTodaySwissString(): string {
  return formatDateForAPI(new Date())
}

/**
 * Start und Ende eines Tages in UTC für Datenbankabfragen
 * Input: Schweizer Datum (z.B. 25.05.2025)
 * Output: UTC Zeitbereich für diesen Tag
 */
export function getSwissDayRange(swissDate: Date): { start: string, end: string } {
  // WICHTIG: Das Input-Datum kann sowohl für "heute" als auch für spezifische Tage verwendet werden
  // Wenn es ein spezifisches Datum ist (z.B. von einem Datepicker), verwende das direkt
  // Wenn es "heute" ist, verwende das aktuelle Schweizer Datum
  
  // Schweizer Datum als YYYY-MM-DD String - das ist der Tag für den wir suchen
  const dateStr = formatDateForAPI(swissDate)
  
  // Dynamische Zeitzone-Erkennung (Sommerzeit vs. Winterzeit)
  // Erstelle ein Beispieldatum für diesen Tag in Schweizer Zeit
  const testDate = new Date(`${dateStr}T12:00:00`)
  const offsetHours = getSwissTimezoneOffset(testDate)
  const offsetString = offsetHours >= 0 ? `+${offsetHours.toString().padStart(2, '0')}:00` : `-${Math.abs(offsetHours).toString().padStart(2, '0')}:00`
  
  // Start und Ende des Tages in Schweizer Zeit
  const startISO = `${dateStr}T00:00:00.000${offsetString}` // 00:00 Schweizer Zeit
  const endISO = `${dateStr}T23:59:59.999${offsetString}`   // 23:59 Schweizer Zeit
  
  // Browser konvertiert automatisch zu UTC
  const startUTC = new Date(startISO)
  const endUTC = new Date(endISO)
  
  
  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString()
  }
}

/**
 * Berechnet den Zeitzone-Offset für die Schweiz (1h im Winter, 2h im Sommer)
 */
function getSwissTimezoneOffset(date: Date): number {
  // Einfacher Weg: Verwende Intl.DateTimeFormat für genaue Zeitzone-Info
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: SWISS_TIMEZONE,
    timeZoneName: 'longOffset'
  })
  
  const parts = formatter.formatToParts(date)
  const offsetPart = parts.find(part => part.type === 'timeZoneName')
  
  if (offsetPart) {
    const offsetString = offsetPart.value // z.B. "GMT+2" oder "GMT+1"
    const match = offsetString.match(/GMT([+-])(\d+)/)
    if (match) {
      const sign = match[1] === '+' ? 1 : -1
      const hours = parseInt(match[2])
      return sign * hours
    }
  }
  
  // Fallback: 2 für Sommerzeit (Mai ist Sommerzeit)
  return 2
}

/**
 * Konvertiert UTC-Datum zu Schweizer Zeit (für Anzeige)
 */
export function convertUTCToSwiss(utcDate: Date | string): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  // Verwende native Browser-API für Zeitzone-Konvertierung
  const swissTimeString = date.toLocaleString("en-US", { timeZone: SWISS_TIMEZONE })
  return new Date(swissTimeString)
}

/**
 * Konvertiert Schweizer Zeit zu UTC (für Datenbank)
 */
export function convertSwissToUTC(swissDate: Date): Date {
  // Einfachste Methode: Verwende die Browser-API
  const swissTimeString = swissDate.toLocaleString('en-CA', { timeZone: SWISS_TIMEZONE })
  const utcTimeString = swissDate.toLocaleString('en-CA', { timeZone: 'UTC' })
  
  // Berechne die Differenz
  const swissTime = new Date(swissTimeString).getTime()
  const utcTime = new Date(utcTimeString).getTime()
  const diff = swissTime - utcTime
  
  // Korrigiere das ursprüngliche Datum
  return new Date(swissDate.getTime() - diff)
}

/**
 * Prüft ob ein Datum heute ist (Schweizer Zeit)
 */
export function isToday(date: Date | string): boolean {
  const inputDate = createSwissDate(date)
  const today = getTodaySwiss()
  
  return formatDateForAPI(inputDate) === formatDateForAPI(today)
}

/**
 * Berechnet Tage zwischen zwei Daten (Schweizer Zeit)
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const swiss1 = createSwissDate(date1)
  const swiss2 = createSwissDate(date2)
  
  const timeDiff = Math.abs(swiss2.getTime() - swiss1.getTime())
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

/**
 * Debug-Funktion für Zeitzone-Tests
 */
export function debugTimezone() {
  const now = new Date()
  const swissNow = createSwissDate(now)
  const todayString = getTodaySwissString()
  const range = getSwissDayRange(swissNow)
  
  // console.log('🇨🇭 Timezone Debug:')
  // console.log('UTC Now:', now.toISOString())
  // console.log('Swiss Now:', swissNow.toISOString())
  // console.log('Swiss Now Formatted:', formatDateTimeForDisplay(now))
  // console.log('Today Swiss String:', todayString)
  // console.log('Swiss Day Range (UTC):', range)
  // console.log('Swiss Offset:', getSwissTimezoneOffset(now), 'hours')
}

/**
 * Hilfsfunktion: Erstellt ein Datum für einen bestimmten Tag in Schweizer Zeit
 */
export function createSwissDateForDay(year: number, month: number, day: number): Date {
  // Erstelle das Datum in Schweizer Zeit
  const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  return createSwissDate(`${dateString}T12:00:00`) // Mittag um DST-Probleme zu vermeiden
}

/**
 * Hilfsfunktion: Erster Tag des Monats in Schweizer Zeit
 */
export function getFirstDayOfMonth(date: Date): Date {
  const swissDate = createSwissDate(date)
  return createSwissDateForDay(swissDate.getFullYear(), swissDate.getMonth() + 1, 1)
}

/**
 * Hilfsfunktion: Letzter Tag des Monats in Schweizer Zeit
 */
export function getLastDayOfMonth(date: Date): Date {
  const swissDate = createSwissDate(date)
  const year = swissDate.getFullYear()
  const month = swissDate.getMonth() + 1
  const lastDay = new Date(year, month, 0).getDate() // 0. Tag des nächsten Monats = letzter Tag des aktuellen Monats
  
  return createSwissDateForDay(year, month, lastDay)
}