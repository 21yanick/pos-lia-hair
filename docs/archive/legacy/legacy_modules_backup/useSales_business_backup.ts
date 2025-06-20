'use client'

import { useState } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { useCashMovements } from '@/shared/hooks/core/useCashMovements'
import { useOrganization } from '@/shared/contexts/OrganizationContext'
// Entfernt: useDocumentGeneration Hook (direkte react-pdf Integration)

// Typen für Verkäufe (ersetzt Transaktionen)
export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleInsert = Omit<Database['public']['Tables']['sales']['Insert'], 'id' | 'created_at'>
export type SaleUpdate = Partial<Omit<Database['public']['Tables']['sales']['Update'], 'id' | 'created_at'>> & { id: string }

// Typen für Verkaufsposten (ersetzt Transaktionsposten)
export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type SaleItemInsert = Omit<Database['public']['Tables']['sale_items']['Insert'], 'id'>

// Typ für den Warenkorb (bleibt gleich)
export type CartItem = {
  id: string        // Item ID aus der Datenbank
  name: string      // Name des Items
  price: number     // Preis pro Stück (kann vom Standard-Preis abweichen)
  quantity: number  // Menge
  total: number     // Gesamtpreis (Preis × Menge)
}

// Typ für die Erstellung einer kompletten Verkaufstransaktion
export type CreateSaleData = {
  total_amount: number
  payment_method: 'cash' | 'twint' | 'sumup'
  notes?: string | null
  items: CartItem[]
  received_amount?: number  // Nur für Bargeld-Zahlungen: Erhaltener Betrag
}

export function useSales() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [currentSale, setCurrentSale] = useState<Sale | null>(null)
  const { createSaleCashMovement, reverseCashMovement } = useCashMovements()
  const { currentOrganization } = useOrganization()
  // Entfernt: generateReceipt Hook (direkte react-pdf Integration)

  // Verkauf erstellen mit allen Posten
  const createSale = async (data: CreateSaleData) => {
    console.log('🔥 ENTRY: createSale function called with data:', data)
    try {
      setLoading(true)
      setError(null)

      // 1. Organization ID abrufen (Frontend-Enforced Multi-Tenancy)
      console.log('🔍 DEBUG useSales: currentOrganization:', currentOrganization)
      console.log('🔍 DEBUG useSales: currentOrganization.id:', currentOrganization?.id)
      console.log('🔍 DEBUG useSales: typeof currentOrganization:', typeof currentOrganization)
      console.log('🔍 DEBUG useSales: currentOrganization keys:', currentOrganization ? Object.keys(currentOrganization) : 'N/A')
      
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt. Bitte wählen Sie eine Organization.')
      }
      
      if (!currentOrganization.id) {
        throw new Error(`Organization hat keine ID: ${JSON.stringify(currentOrganization)}`)
      }

      // 2. Verkauf erstellen
      const saleData = {
        total_amount: data.total_amount,
        payment_method: data.payment_method,
        status: 'completed',  // Standard-Status für neue Verkäufe
        notes: data.notes || null,
        organization_id: currentOrganization.id,
      }
      
      console.log('🚨 CRITICAL DEBUG: About to insert sale with data:', saleData)
      console.log('🚨 CRITICAL DEBUG: organization_id value:', saleData.organization_id)
      console.log('🚨 CRITICAL DEBUG: currentOrganization at insert time:', currentOrganization)
      
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single()

      if (saleError) {
        console.error('Fehler beim Erstellen des Verkaufs:', saleError)
        throw saleError
      }

      // 3. Verkaufsposten für jedes Item im Warenkorb erstellen
      const saleItems: SaleItemInsert[] = data.items.map(item => ({
        sale_id: sale.id,
        item_id: item.id,
        price: item.price,
        notes: null  // Optional: Anmerkungen zum Posten
      }))

      // 4. Alle Verkaufsposten in einer Operation einfügen
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) {
        console.error('Fehler beim Erstellen der Verkaufsposten:', itemsError)
        throw itemsError
      }
      
      console.log('Verkaufsposten erfolgreich erstellt:', saleItems.length)

      // 5. Bargeld-Bewegung erstellen, wenn es eine Barzahlung ist
      if (data.payment_method === 'cash') {
        try {
          await createSaleCashMovement(sale.id, data.total_amount)
        } catch (cashError) {
          console.error('Fehler beim Erstellen der Bargeld-Bewegung:', cashError)
          // Hier keine Exception werfen, da der Verkauf selbst erfolgreich war
        }
      }

      // 6. Aktuelle Verkauf setzen für das UI
      setCurrentSale(sale)
      
      // 7. Automatisch eine Quittung für diesen Verkauf erstellen
      let receiptResult: any
      try {
        receiptResult = await createReceiptPDF(sale, data.items)
      } catch (docErr) {
        console.error('Fehler bei der automatischen Quittungserstellung:', docErr)
        // Wir werfen hier keinen Fehler, damit der Verkauf selbst erfolgreich bleibt
      }
      
      // 8. Lokale Liste aktualisieren
      setSales(prev => [sale, ...prev])

      return { 
        success: true, 
        sale,
        receiptUrl: receiptResult?.publicUrl,
        change: data.payment_method === 'cash' && data.received_amount 
          ? data.received_amount - data.total_amount 
          : 0
      }

    } catch (err: any) {
      console.error('Fehler beim Verkauf:', err)
      setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Moderne Quittungs-PDF erstellen mit @react-pdf/renderer (direkte Integration)
  const createReceiptPDF = async (sale: Sale, items: CartItem[]) => {
    try {
      const React = await import('react')
      const { ReceiptPDF } = await import('@/shared/components/pdf/ReceiptPDF')
      const { pdf } = await import('@react-pdf/renderer')
      
      // Business Settings laden
      const { getBusinessSettings, resolveLogoUrl } = await import('@/shared/services/businessSettingsService')
      const businessSettings = await getBusinessSettings()
      
      // Logo URL für PDF-Kontext auflösen (Development: localhost -> Docker-interne URL)
      const resolvedBusinessSettings = businessSettings ? {
        ...businessSettings,
        logo_url: resolveLogoUrl(businessSettings.logo_url)
      } : null
      
      // PDF erstellen  
      const pdfComponent = React.createElement(ReceiptPDF, { sale, items, businessSettings: resolvedBusinessSettings }) as any
      const blob = await pdf(pdfComponent).toBlob()
      const fileName = `quittung-${sale.id}.pdf`
      const file = new File([blob], fileName, { type: 'application/pdf' })
      
      // Upload zu Storage
      const filePath = `documents/receipts/${fileName}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) {
        console.error('❌ Fehler beim Hochladen der Quittung:', uploadError)
        throw uploadError
      }
      
      // Document-Eintrag erstellen
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const documentData = {
          type: 'receipt' as const,
          reference_id: sale.id,
          file_path: filePath,
          payment_method: sale.payment_method,
          document_date: new Date().toISOString().split('T')[0],
          user_id: userData.user.id
        }
        
        const { error: documentError } = await supabase
          .from('documents')
          .upsert(documentData)
        
        if (documentError) {
          console.error('❌ Fehler beim Erstellen des Quittung Document-Eintrags:', documentError)
        }
      }
      
      // Public URL zurückgeben
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)
      
      return { success: true, publicUrl: urlData.publicUrl }
      
    } catch (error: any) {
      console.error('❌ Fehler bei PDF-Erstellung:', error)
      return { success: false, error: error.message }
    }
  }

  // Verkäufe für den aktuellen Tag laden (Multi-Tenant: nur für aktuelle Organization)
  const loadTodaySales = async () => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

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
        .eq('organization_id', currentOrganization.id) // 🔒 CRITICAL: Organization-scoped
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Verkäufe:', error)
        throw error
      }

      setSales(data || [])
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Verkäufe:', err)
      setError(err.message || 'Fehler beim Laden der Daten')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Verkauf stornieren (Multi-Tenant: nur eigene Organization)
  const cancelSale = async (saleId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      // Status des Verkaufs auf 'cancelled' ändern (mit Organization Security)
      const { data, error } = await supabase
        .from('sales')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', saleId)
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Sales
        .select()
        .single()

      if (error) {
        throw error
      }

      // Wenn es eine Barzahlung war, Cash Movement rückgängig machen
      if (data.payment_method === 'cash') {
        try {
          await reverseCashMovement(saleId, 'sale')
        } catch (cashError) {
          console.error('Fehler beim Rückgängigmachen der Bargeld-Bewegung:', cashError)
          // Hier keine Exception werfen, da die Stornierung selbst erfolgreich war
        }
      }

      // Lokale Liste aktualisieren
      setSales(prev => 
        prev.map(s => s.id === saleId ? data : s)
      )

      return { success: true, sale: data }
    } catch (err: any) {
      console.error('Fehler beim Stornieren des Verkaufs:', err)
      setError(err.message || 'Fehler beim Stornieren')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Verkäufe für Datumsbereich laden (Multi-Tenant: nur eigene Organization)
  const getSalesForDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Sales
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return { success: true, sales: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Verkäufe für Datumsbereich:', err)
      setError(err.message || 'Fehler beim Laden der Verkäufe')
      return { success: false, error: err.message, sales: [] }
    } finally {
      setLoading(false)
    }
  }

  // Verkäufe für Datumsbereich laden und in State setzen (Multi-Tenant)
  const loadSalesForDateRange = async (startDate: string, endDate: string) => {
    try {
      setLoading(true)
      setError(null)

      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Sales
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setSales(data || [])
      return { success: true, sales: data }
    } catch (err: any) {
      console.error('Fehler beim Laden der Verkäufe für Datumsbereich:', err)
      setError(err.message || 'Fehler beim Laden der Verkäufe')
      return { success: false, error: err.message, sales: [] }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    sales,
    currentSale,
    createSale,
    createReceiptPDF,
    loadTodaySales,
    getSalesForDateRange,
    loadSalesForDateRange,
    cancelSale
  }
}