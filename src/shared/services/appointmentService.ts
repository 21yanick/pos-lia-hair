/**
 * Appointment Service Functions
 * 
 * Pure business logic functions for appointment operations
 * Following existing patterns from itemsService.ts
 * 
 * Features:
 * - Multi-tenant security (organization-scoped)
 * - Comprehensive error handling
 * - CRUD operations for appointments
 * - Type safety with Database types
 * - Simple conflict checking
 * - Optimized for React Query caching
 */

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { formatDateForAPI } from '@/shared/utils/dateUtils'

// ========================================
// Types (using generated Database types)
// ========================================

export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentInsert = Omit<Database['public']['Tables']['appointments']['Insert'], 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
export type AppointmentUpdate = Partial<Omit<Database['public']['Tables']['appointments']['Update'], 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>> & { id: string }

export type AppointmentQueryResult = {
  success: true
  data: Appointment[]
} | {
  success: false
  error: string
}

export type AppointmentMutationResult = {
  success: true
  data: Appointment
} | {
  success: false
  error: string
}

export type AppointmentDeleteResult = {
  success: true
} | {
  success: false
  error: string
}

// ========================================
// Security & Validation
// ========================================

/**
 * Validate organization ID is provided
 * Reusing the pattern from itemsService.ts
 */
export function validateOrganizationId(organizationId: string | undefined): string {
  if (!organizationId) {
    throw new Error('Keine Organization ausgewählt. Multi-Tenant Sicherheit verletzt.')
  }
  return organizationId
}

/**
 * Validate appointment data
 */
export function validateAppointmentData(appointmentData: AppointmentInsert | AppointmentUpdate): void {
  // Validate time format (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  
  if ('start_time' in appointmentData && appointmentData.start_time) {
    if (!timeRegex.test(appointmentData.start_time)) {
      throw new Error('Start-Zeit muss im Format HH:mm sein.')
    }
  }
  
  if ('end_time' in appointmentData && appointmentData.end_time) {
    if (!timeRegex.test(appointmentData.end_time)) {
      throw new Error('End-Zeit muss im Format HH:mm sein.')
    }
  }
  
  // Validate date format (YYYY-MM-DD)
  if ('appointment_date' in appointmentData && appointmentData.appointment_date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(appointmentData.appointment_date)) {
      throw new Error('Datum muss im Format YYYY-MM-DD sein.')
    }
    
    // Check if date is valid
    const date = new Date(appointmentData.appointment_date)
    if (isNaN(date.getTime())) {
      throw new Error('Ungültiges Datum.')
    }
  }
  
  // Validate time range
  if ('start_time' in appointmentData && 'end_time' in appointmentData 
      && appointmentData.start_time && appointmentData.end_time) {
    if (appointmentData.start_time >= appointmentData.end_time) {
      throw new Error('End-Zeit muss nach Start-Zeit liegen.')
    }
  }
  
  // Validate customer data (either customer_id or customer_name required)
  if ('customer_id' in appointmentData || 'customer_name' in appointmentData) {
    if (!appointmentData.customer_id && !appointmentData.customer_name) {
      throw new Error('Kunde muss ausgewählt oder Name eingegeben werden.')
    }
  }
  
  // Validate estimated price
  if ('estimated_price' in appointmentData && appointmentData.estimated_price !== undefined) {
    if (appointmentData.estimated_price < 0) {
      throw new Error('Geschätzter Preis darf nicht negativ sein.')
    }
  }
}

/**
 * Get current user ID with validation
 * Reusing the pattern from itemsService.ts
 */
export async function getCurrentUserId(): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
  }
  return userData.user.id
}

// ========================================
// Core Appointment Operations
// ========================================

/**
 * Get appointments for a specific date
 */
export async function getAppointments(
  organizationId: string, 
  date: Date
): Promise<Appointment[]> {
  const validOrgId = validateOrganizationId(organizationId)
  
  // Format date consistently with Hook Query Key (Swiss timezone)
  const dateStr = formatDateForAPI(date)
  
  // Debug: Check for date formatting issues
  const utcDateStr = date.toISOString().split('T')[0]
  console.log('🐛 getAppointments Debug:', {
    inputDate: date,
    swissDateStr: dateStr,
    utcDateStr: utcDateStr,
    dateMatch: dateStr === utcDateStr,
    organizationId: validOrgId
  })
  
  // Use the new appointments_with_services view for easier querying
  const { data, error } = await supabase
    .from('appointments_with_services')
    .select(`
      *,
      customer:customers(id, name, phone, email)
    `)
    .eq('organization_id', validOrgId)
    .eq('appointment_date', dateStr)
    .order('start_time')
  
  console.log('🐛 Query Result:', {
    hasData: !!data,
    dataLength: data?.length || 0,
    hasError: !!error,
    error: error,
    queryParams: { organizationId: validOrgId, appointment_date: dateStr }
  })
  
  if (error) {
    console.error('Error loading appointments:', error)
    throw new Error('Fehler beim Laden der Termine')
  }
  
  return data || []
}

/**
 * Get appointments for a date range
 */
export async function getAppointmentsForDateRange(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> {
  const validOrgId = validateOrganizationId(organizationId)
  
  // Use consistent Swiss timezone formatting
  const startDateStr = formatDateForAPI(startDate)
  const endDateStr = formatDateForAPI(endDate)
  
  const { data, error } = await supabase
    .from('appointments_with_services')
    .select(`
      *,
      customer:customers(id, name, phone, email)
    `)
    .eq('organization_id', validOrgId)
    .gte('appointment_date', startDateStr)
    .lte('appointment_date', endDateStr)
    .order('appointment_date')
    .order('start_time')
  
  if (error) {
    console.error('Error loading appointments for date range:', error)
    throw new Error('Fehler beim Laden der Termine')
  }
  
  return data || []
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(
  appointmentId: string,
  organizationId: string
): Promise<Appointment | null> {
  const validOrgId = validateOrganizationId(organizationId)
  
  const { data, error } = await supabase
    .from('appointments_with_services')
    .select(`
      *,
      customer:customers(id, name, phone, email)
    `)
    .eq('id', appointmentId)
    .eq('organization_id', validOrgId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error loading appointment:', error)
    throw new Error('Fehler beim Laden des Termins')
  }
  
  return data
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  appointmentData: AppointmentInsert,
  organizationId: string
): Promise<AppointmentMutationResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    
    // Validate data
    validateAppointmentData(appointmentData)
    
    // Check for conflicts
    const hasConflict = await checkTimeSlotConflict(
      validOrgId,
      appointmentData.appointment_date,
      appointmentData.start_time,
      appointmentData.end_time
    )
    
    if (hasConflict) {
      return {
        success: false,
        error: 'Terminkonflikt: Der gewählte Zeitraum ist bereits belegt.'
      }
    }
    
    // Get current user
    const currentUserId = await getCurrentUserId()
    
    // Prepare data with audit fields
    const completeAppointmentData = {
      ...appointmentData,
      organization_id: validOrgId,
      status: appointmentData.status || 'scheduled',
      created_by: currentUserId,
      updated_by: currentUserId
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(completeAppointmentData)
      .select(`
        *,
        customer:customers(id, name, phone, email),
        service:items!item_id(id, name, default_price, duration_minutes)
      `)
      .single()
    
    if (error) {
      console.error('Error creating appointment:', error)
      throw error
    }
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Error in createAppointment:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Erstellen des Termins'
    }
  }
}

/**
 * Update an existing appointment
 */
export async function updateAppointment(
  appointmentUpdate: AppointmentUpdate,
  organizationId: string
): Promise<AppointmentMutationResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    const { id, ...updateData } = appointmentUpdate
    
    // Validate data
    validateAppointmentData(appointmentUpdate)
    
    // Check for conflicts (excluding current appointment)
    if (updateData.appointment_date && updateData.start_time && updateData.end_time) {
      const hasConflict = await checkTimeSlotConflict(
        validOrgId,
        updateData.appointment_date,
        updateData.start_time,
        updateData.end_time,
        id // Exclude current appointment
      )
      
      if (hasConflict) {
        return {
          success: false,
          error: 'Terminkonflikt: Der gewählte Zeitraum ist bereits belegt.'
        }
      }
    }
    
    // Get current user
    const currentUserId = await getCurrentUserId()
    
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...updateData,
        updated_by: currentUserId
      })
      .eq('id', id)
      .eq('organization_id', validOrgId) // Multi-tenant security
      .select(`
        *,
        customer:customers(id, name, phone, email),
        service:items!item_id(id, name, default_price, duration_minutes)
      `)
      .single()
    
    if (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Error in updateAppointment:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Aktualisieren des Termins'
    }
  }
}

/**
 * Cancel an appointment (sets status to cancelled)
 */
export async function cancelAppointment(
  appointmentId: string,
  organizationId: string
): Promise<AppointmentMutationResult> {
  return updateAppointment(
    { id: appointmentId, status: 'cancelled' },
    organizationId
  )
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(
  appointmentId: string,
  organizationId: string
): Promise<AppointmentDeleteResult> {
  try {
    const validOrgId = validateOrganizationId(organizationId)
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('organization_id', validOrgId) // Multi-tenant security
    
    if (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
    
    return { success: true }
  } catch (err: any) {
    console.error('Error in deleteAppointment:', err)
    return { 
      success: false, 
      error: err.message || 'Fehler beim Löschen des Termins'
    }
  }
}

// ========================================
// Scheduling Helpers
// ========================================

/**
 * Check if a time slot conflicts with existing appointments
 */
export async function checkTimeSlotConflict(
  organizationId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  const validOrgId = validateOrganizationId(organizationId)
  
  let query = supabase
    .from('appointments')
    .select('id')
    .eq('organization_id', validOrgId)
    .eq('appointment_date', date)
    .neq('status', 'cancelled')
    .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`) // Time overlap check
  
  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error checking time slot conflict:', error)
    throw new Error('Fehler bei der Konfliktprüfung')
  }
  
  return (data?.length || 0) > 0
}

/**
 * Check if time slot is available
 */
export async function checkTimeSlotAvailable(
  organizationId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  const hasConflict = await checkTimeSlotConflict(
    organizationId,
    date,
    startTime,
    endTime,
    excludeAppointmentId
  )
  
  return !hasConflict
}

/**
 * Get appointments for a specific customer
 */
export async function getCustomerAppointments(
  customerId: string,
  organizationId: string,
  limit?: number
): Promise<Appointment[]> {
  const validOrgId = validateOrganizationId(organizationId)
  
  let query = supabase
    .from('appointments')
    .select(`
      *,
      customer:customers(id, name, phone, email),
      service:items!item_id(id, name, default_price, duration_minutes)
    `)
    .eq('organization_id', validOrgId)
    .eq('customer_id', customerId)
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error loading customer appointments:', error)
    throw new Error('Fehler beim Laden der Kundentermine')
  }
  
  return data || []
}