// Report-related helper functions

// Date and month utilities
export function getCurrentYearMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  return `${year}-${month.toString().padStart(2, '0')}`
}

export function getMonthOptions() {
  const options = []
  const currentDate = new Date()

  // Die letzten 12 Monate
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const value = `${year}-${month.toString().padStart(2, '0')}`
    const label = date.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' })
    options.push({ value, label })
  }

  return options
}

export function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('de-CH', {
    month: 'long',
    year: 'numeric',
  })
}

// Report data validation
export function validateMonthFormat(month: string): boolean {
  const regex = /^\d{4}-\d{2}$/
  return regex.test(month)
}

export function getDateRangeForMonth(yearMonth: string): { startDate: Date; endDate: Date } {
  const [year, month] = yearMonth.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)
  return { startDate, endDate }
}
