import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Customer } from '@/shared/services/customerService'

/**
 * Generate initials from customer name for avatar
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Format customer contact information for display
 */
export const formatCustomerContact = (customer: Customer): string => {
  if (customer.phone && customer.email) {
    return `${customer.phone} • ${customer.email}`
  }
  return customer.phone || customer.email || 'Keine Kontaktdaten'
}

/**
 * Get primary contact method (phone preferred over email)
 */
export const getPrimaryContact = (
  customer: Customer
): { type: 'phone' | 'email' | null; value: string | null } => {
  if (customer.phone) {
    return { type: 'phone', value: customer.phone }
  }
  if (customer.email) {
    return { type: 'email', value: customer.email }
  }
  return { type: null, value: null }
}

/**
 * Format last visit date
 */
export const formatLastVisit = (date: string): string => {
  return format(parseISO(date), 'dd.MM.yyyy', { locale: de })
}

/**
 * Format relative date (e.g., "vor 3 Tagen")
 */
export const formatRelativeDate = (date: string): string => {
  const parsedDate = parseISO(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Heute'
  if (diffInDays === 1) return 'Gestern'
  if (diffInDays < 7) return `vor ${diffInDays} Tagen`
  if (diffInDays < 30) return `vor ${Math.floor(diffInDays / 7)} Wochen`
  if (diffInDays < 365) return `vor ${Math.floor(diffInDays / 30)} Monaten`
  return `vor ${Math.floor(diffInDays / 365)} Jahren`
}

/**
 * Check if customer search query matches customer data
 */
export const matchesSearchQuery = (customer: Customer, query: string): boolean => {
  if (!query) return true

  const searchTerm = query.toLowerCase()
  return (
    customer.name.toLowerCase().includes(searchTerm) ||
    (customer.phone?.toLowerCase().includes(searchTerm) ?? false) || // V6.1: Ensure boolean return
    (customer.email?.toLowerCase().includes(searchTerm) ?? false) // V6.1: Ensure boolean return
  )
}

/**
 * Generate customer avatar color based on name
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]

  const hash = name.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)

  return colors[hash % colors.length]
}
