// Month utility functions for Settlement Import conditional rendering
// Phase 1B: Settlement Import nur ANFANG-Monat anzeigen (User Feedback)

/**
 * Checks if current date is near end of month (last 5 days)
 * Kept for compatibility, but Settlement Import now happens at beginning of next month
 */
export function isEndOfMonth(date: Date = new Date()): boolean {
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const currentDay = date.getDate()
  
  // Last 5 days of month = Month closure time (not Settlement)
  return (lastDayOfMonth - currentDay) <= 4
}

/**
 * Checks if current date is first 10 days of month (Settlement Import time)
 * USER FEEDBACK: Settlement gehört ANFANG nächster Monat (nicht Ende)
 */
export function isBeginningOfMonth(date: Date = new Date()): boolean {
  const currentDay = date.getDate()
  
  // First 10 days of month = Settlement Import time for PREVIOUS month
  return currentDay <= 10
}

/**
 * Checks if Settlement Import should be visible
 * Phase 1B: Only beginning-of-month (for previous month settlement)
 */
export function shouldShowSettlementImport(date: Date = new Date()): boolean {
  return isBeginningOfMonth(date)
}

/**
 * Get Settlement Import visibility message
 */
export function getSettlementImportMessage(date: Date = new Date()): string {
  if (isBeginningOfMonth(date)) {
    return "Zeit für Settlement Import des Vormonats"
  }
  
  return "Settlement Import verfügbar in den ersten 10 Tagen des Monats"
}

/**
 * Format month for Settlement Import
 * Phase 1B: Settlement Import happens at beginning of month for PREVIOUS month
 */
export function getSettlementMonth(date: Date = new Date()): string {
  // Settlement Import is always for the PREVIOUS month
  let targetDate = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  
  return targetDate.toLocaleDateString('de-CH', { 
    year: 'numeric', 
    month: 'long' 
  })
}