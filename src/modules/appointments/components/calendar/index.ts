/**
 * Calendar Components Export
 * Clean exports for appointment calendar system
 */

// Client Components (all calendar components are now client-side for better UX)
export { MonthGrid, MonthGridSkeleton } from './MonthGrid'
export { DayTimeline, DayTimelineSkeleton } from './DayTimeline'

// Legacy compatibility exports
export { MonthGrid as MonthGridWithSuspense } from './MonthGrid'

// Types
export type * from '../../types/calendar'
export type * from '../../types/timeline'

// Utils
export * from '../../utils/calendarUtils'
export * from '../../utils/timelineUtils'

// Hooks
export { useAppointmentCalendar } from '../../hooks/useAppointmentCalendar'