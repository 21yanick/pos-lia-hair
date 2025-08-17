/**
 * Calendar Components Export
 * Clean exports for appointment calendar system
 */

// Hooks
export { useAppointmentCalendar } from '../../hooks/useAppointmentCalendar'
// Types
export type * from '../../types/calendar'
export type * from '../../types/timeline'
// Utils
export * from '../../utils/calendarUtils'
export * from '../../utils/timelineUtils'
export { DayTimeline, DayTimelineSkeleton } from './DayTimeline'
// Client Components (all calendar components are now client-side for better UX)
// Legacy compatibility exports
export { MonthGrid, MonthGrid as MonthGridWithSuspense, MonthGridSkeleton } from './MonthGrid'
