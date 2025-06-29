/**
 * Sales Service Functions
 * 
 * Pure business logic functions for sales operations
 * Extracted from useSales hook for React Query migration
 * 
 * Features:
 * - Multi-tenant security (organization-scoped)
 * - Comprehensive error handling
 * - Transaction safety
 * - PDF generation
 * - Cash movement integration
 */

'use client'

import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/supabase'

// ========================================
// Types
// ========================================

export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleInsert = Omit<Database['public']['Tables']['sales']['Insert'], 'id' | 'created_at'>
export type SaleUpdate = Partial<Omit<Database['public']['Tables']['sales']['Update'], 'id' | 'created_at'>> & { id: string }

export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type SaleItemInsert = Omit<Database['public']['Tables']['sale_items']['Insert'], 'id'>

export type CartItem = {
  id: string        // Item ID aus der Datenbank
  name: string      // Name des Items
  price: number     // Preis pro Stück (kann vom Standard-Preis abweichen)
  quantity: number  // Menge
  total: number     // Gesamtpreis (Preis × Menge)
}

export type CreateSaleData = {
  total_amount: number
  payment_method: 'cash' | 'twint' | 'sumup'
  notes?: string | null
  items: CartItem[]
  received_amount?: number  // Nur für Bargeld-Zahlungen: Erhaltener Betrag
  customer_id?: string | null  // 🆕 Customer Integration
  customer_name?: string | null  // 🆕 Fallback für neue Kunden
}

export type CreateSaleResult = {
  success: true
  sale: Sale
  receiptUrl?: string
  change: number
} | {
  success: false
  error: string
}

// ========================================
// Security & Validation
// ========================================

/**
 * Get current user ID with validation
 */
export async function getCurrentUserId(): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
  }
  return userData.user.id
}

/**
 * Validate organization ID
 */
export function validateOrganizationId(organizationId: string | undefined): string {
  if (!organizationId) {
    throw new Error('Keine Organization ausgewählt. Multi-Tenant Sicherheit verletzt.')
  }
  return organizationId
}

// ========================================
// Core Sales Operations
// ========================================

/**
 * Create a complete sale with items, PDF receipt, and cash movement
 */
export async function createSale(
  data: CreateSaleData, 
  organizationId: string,
  cashMovementService?: {
    createSaleCashMovement: (saleId: string, amount: number) => Promise<any>
  }
): Promise<CreateSaleResult> {
  // console.log('🔥 salesService: createSale called with data:', data)
  
  try {
    // Security validation
    const validOrgId = validateOrganizationId(organizationId)
    const userId = await getCurrentUserId()
    
    // console.log('🔍 SECURITY CHECK: organizationId:', validOrgId, 'userId:', userId)

    // Create sale record
    const saleData = {
      total_amount: data.total_amount,
      payment_method: data.payment_method,
      status: 'completed',
      notes: data.notes || null,
      user_id: userId,
      organization_id: validOrgId,
      customer_id: data.customer_id || null,  // 🆕 Customer Integration
    }
    
    // console.log('🚨 CRITICAL DEBUG: About to insert sale with data:', saleData)
    
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert(saleData)
      .select()
      .single()

    if (saleError) {
      // console.error('❌ Fehler beim Erstellen des Verkaufs:', saleError)
      throw saleError
    }

    // Create sale items
    const saleItems: SaleItemInsert[] = data.items.map(item => ({
      sale_id: sale.id,
      item_id: item.id,
      price: item.price,  // Unit price per item
      quantity: item.quantity,
      notes: null,
      user_id: userId,
      organization_id: validOrgId
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      // console.error('❌ Fehler beim Erstellen der Verkaufsposten:', itemsError)
      throw itemsError
    }
    
    // console.log('✅ Verkaufsposten erfolgreich erstellt:', saleItems.length)

    // Create cash movement for cash payments
    if (data.payment_method === 'cash' && cashMovementService) {
      try {
        await cashMovementService.createSaleCashMovement(sale.id, data.total_amount)
      } catch (cashError) {
        console.error('⚠️ Fehler beim Erstellen der Bargeld-Bewegung:', cashError)
        // Don't throw here, sale was successful
      }
    }

    // Create PDF receipt
    let receiptResult: any
    try {
      receiptResult = await createReceiptPDF(sale, data.items, validOrgId)
    } catch (docErr) {
      console.error('⚠️ Fehler bei der automatischen Quittungserstellung:', docErr)
      // Don't throw here, sale was successful
    }

    return { 
      success: true, 
      sale,
      receiptUrl: receiptResult?.publicUrl,
      change: data.payment_method === 'cash' && data.received_amount 
        ? data.received_amount - data.total_amount 
        : 0
    }

  } catch (err: any) {
    console.error('❌ Fehler beim Verkauf:', err)
    return { success: false, error: err.message || 'Ein unerwarteter Fehler ist aufgetreten' }
  }
}

/**
 * Cancel a sale and reverse cash movements
 */
export async function cancelSale(
  saleId: string, 
  organizationId: string,
  cashMovementService?: {
    reverseCashMovement: (referenceId: string, referenceType: 'sale' | 'expense') => Promise<any>
  }
): Promise<{ success: true; sale: Sale } | { success: false; error: string }> {
  try {
    // Security validation
    const validOrgId = validateOrganizationId(organizationId)

    // Update sale status to cancelled
    const { data, error } = await supabase
      .from('sales')
      .update({ 
        status: 'cancelled'
      })
      .eq('id', saleId)
      .eq('organization_id', validOrgId) // Multi-tenant security
      .select()
      .single()

    if (error) {
      throw error
    }

    // Reverse cash movement if it was a cash payment
    if (data.payment_method === 'cash' && cashMovementService) {
      try {
        await cashMovementService.reverseCashMovement(saleId, 'sale')
      } catch (cashError) {
        console.error('⚠️ Fehler beim Rückgängigmachen der Bargeld-Bewegung:', cashError)
        // Don't throw here, cancellation was successful
      }
    }

    return { success: true, sale: data }
  } catch (err: any) {
    console.error('❌ Fehler beim Stornieren des Verkaufs:', err)
    return { success: false, error: err.message || 'Fehler beim Stornieren' }
  }
}

// ========================================
// Query Operations
// ========================================

/**
 * Load sales for today
 */
export async function getTodaySales(organizationId: string): Promise<Sale[]> {
  const validOrgId = validateOrganizationId(organizationId)
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      sale_items (
        *,
        item:items (name)
      )
    `)
    .eq('organization_id', validOrgId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: false })

  if (error) {
    // console.error('❌ Fehler beim Laden der Verkäufe:', error)
    throw new Error('Fehler beim Laden der Verkäufe')
  }

  return data || []
}

/**
 * Get sales for date range
 */
export async function getSalesForDateRange(
  organizationId: string, 
  startDate: string, 
  endDate: string
): Promise<Sale[]> {
  const validOrgId = validateOrganizationId(organizationId)

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('organization_id', validOrgId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })

  if (error) {
    // console.error('❌ Fehler beim Laden der Verkäufe für Datumsbereich:', error)
    throw new Error('Fehler beim Laden der Verkäufe')
  }

  return data || []
}

// ========================================
// PDF Generation
// ========================================

/**
 * Create PDF receipt for a sale
 */
export async function createReceiptPDF(
  sale: Sale, 
  items: CartItem[], 
  organizationId: string
): Promise<{ success: true; publicUrl: string } | { success: false; error: string }> {
  try {
    const React = await import('react')
    const { ReceiptPDF } = await import('@/shared/components/pdf/ReceiptPDF')
    const { pdf } = await import('@react-pdf/renderer')
    
    // Load business settings with logo resolution
    const { getBusinessSettings, resolveLogoUrl } = await import('@/shared/services/businessSettingsService')
    const businessSettings = await getBusinessSettings()
    
    // Resolve logo URL for PDF context
    const resolvedBusinessSettings = businessSettings ? {
      ...businessSettings,
      logo_url: resolveLogoUrl(businessSettings.logo_url)
    } : null
    
    // Generate PDF
    const pdfComponent = React.createElement(ReceiptPDF, { sale, items, businessSettings: resolvedBusinessSettings }) as any
    const blob = await pdf(pdfComponent).toBlob()
    const fileName = `quittung-${sale.id}.pdf`
    const file = new File([blob], fileName, { type: 'application/pdf' })
    
    // Upload to storage with organization-based path
    const filePath = `${organizationId}/receipts/${fileName}`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      // console.error('❌ Fehler beim Hochladen der Quittung:', uploadError)
      throw uploadError
    }
    
    // Create document record
    const userId = await getCurrentUserId()
    const documentData = {
      type: 'receipt' as const,
      reference_id: sale.id,
      file_path: filePath,
      payment_method: sale.payment_method,
      document_date: new Date().toISOString().split('T')[0],
      user_id: userId,
      organization_id: organizationId
    }
    
    const { error: documentError } = await supabase
      .from('documents')
      .upsert(documentData)
    
    if (documentError) {
      // console.error('❌ Fehler beim Erstellen des Quittung Document-Eintrags:', documentError)
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)
    
    return { success: true, publicUrl: urlData.publicUrl }
    
  } catch (error: any) {
    console.error('❌ Fehler bei PDF-Erstellung:', error)
    return { success: false, error: error.message }
  }
}