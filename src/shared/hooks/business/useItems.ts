'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase/client'
import type { Database } from '@/types/supabase'
import { useOrganization } from '@/shared/contexts/OrganizationContext'

// Type für das Item, wie es aus der Datenbank kommt
export type Item = Database['public']['Tables']['items']['Row']

// Type für das Einfügen eines neuen Items
export type ItemInsert = Omit<Database['public']['Tables']['items']['Insert'], 'id' | 'created_at'>

// Type für das Aktualisieren eines Items
export type ItemUpdate = Partial<Omit<Database['public']['Tables']['items']['Update'], 'id' | 'created_at'>> & { id: string }

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentOrganization } = useOrganization()

  // Laden aller Items mit automatischer Synchronisierung bei Bedarf
  useEffect(() => {
    const loadItemsWithRetry = async (retryCount = 0) => {
      try {
        setLoading(true)
        setError(null) // Fehler zurücksetzen
        
        // 1. Auth-Benutzer-Info abrufen
        const { data: authData } = await supabase.auth.getUser()
        
        if (!authData?.user) {
          console.error('Kein authentifizierter Benutzer gefunden')
          setError('Nicht angemeldet. Bitte melden Sie sich an.')
          return
        }
        
        // 2. Prüfen, ob der Benutzer in der users-Tabelle existiert
        const { error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        
        // 3. Wenn kein Benutzer gefunden oder Fehler, versuche zu synchronisieren
        if (userError && userError.code === 'PGRST116') { // Not found
          console.log('Benutzer nicht in users-Tabelle gefunden, synchronisiere...')
          const syncResult = await syncAuthUser()
          
          if (!syncResult.success) {
            console.error('Automatische Synchronisierung fehlgeschlagen:', syncResult.error)
            
            // Nur bei erster Ausführung Fehler setzen
            if (retryCount === 0) {
              setError('Berechtigung fehlt. Automatische Synchronisierung fehlgeschlagen.')
            }
            
            // Erneut versuchen, wenn nicht zu oft
            if (retryCount < 2) {
              console.log(`Versuche erneut (${retryCount + 1}/2)...`)
              setLoading(false)
              return loadItemsWithRetry(retryCount + 1)
            }
          } else {
            console.log('Automatische Synchronisierung erfolgreich')
          }
        }
        
        // 4. Items laden (Multi-Tenant: nur für aktuelle Organization)
        if (!currentOrganization) {
          setError('Keine Organization ausgewählt.')
          return
        }

        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('organization_id', currentOrganization.id) // 🔒 Multi-Tenant Security
          .order('name')
        
        if (error) {
          console.error('Fehler beim Laden der Items:', error)
          throw error
        }
        
        setItems(data)
      } catch (err: any) {
        console.error('Fehler beim Laden der Items:', err)
        setError(err.message || 'Fehler beim Laden der Daten')
      } finally {
        setLoading(false)
      }
    }

    loadItemsWithRetry()
  }, [currentOrganization]) // Reload when organization changes

  // Item hinzufügen (Multi-Tenant)
  const addItem = async (newItem: ItemInsert) => {
    try {
      setLoading(true)
      
      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }
      
      // Daten für das Einfügen vorbereiten (mit organization_id)
      const itemData = {
        ...newItem,
        organization_id: currentOrganization.id // 🔒 Multi-Tenant Security
      }
      
      
      const { data, error } = await supabase
        .from('items')
        .insert(itemData)
        .select('*')
        .single()
      
      if (error) {
        console.error('Supabase-Fehler:', error)
        throw error
      }
      
      
      // Lokales State-Update
      setItems(prev => [...prev, data])
      
      return { data, error: null }
    } catch (err: any) {
      console.error('Fehler beim Hinzufügen des Items:', err)
      console.error('Fehlerdetails:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        fullError: JSON.stringify(err)
      })
      
      setError(`${err.message || 'Fehler beim Hinzufügen'} - Code: ${err.code || 'unbekannt'}`)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Item aktualisieren (Multi-Tenant)
  const updateItem = async (updatedItem: ItemUpdate) => {
    const { id, ...rest } = updatedItem
    
    try {
      setLoading(true)
      
      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }
      
      // Daten für die Aktualisierung vorbereiten
      const itemData = {
        ...rest
      }
      
      const { data, error } = await supabase
        .from('items')
        .update(itemData)
        .eq('id', id)
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Items
        .select('*')
        .single()
      
      if (error) {
        throw error
      }
      
      // Lokales State-Update
      setItems(prev => prev.map(item => item.id === id ? data : item))
      
      return { data, error: null }
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren des Items:', err)
      setError(err.message || 'Fehler bei der Aktualisierung')
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Toggle Favoriten-Status (Multi-Tenant)
  const toggleFavorite = async (id: string, currentValue: boolean) => {
    try {
      setLoading(true)
      
      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }
      
      const { data, error } = await supabase
        .from('items')
        .update({ 
          is_favorite: !currentValue
        })
        .eq('id', id)
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Items
        .select('*')
        .single()
      
      if (error) {
        throw error
      }
      
      // Lokales State-Update
      setItems(prev => prev.map(item => item.id === id ? data : item))
      
      return { data, error: null }
    } catch (err: any) {
      console.error('Fehler beim Ändern des Favoriten-Status:', err)
      setError(err.message || 'Fehler beim Aktualisieren')
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Toggle Aktiv-Status (Multi-Tenant)
  const toggleActive = async (id: string, currentValue: boolean) => {
    try {
      setLoading(true)
      
      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }
      
      const { data, error } = await supabase
        .from('items')
        .update({ 
          active: !currentValue
        })
        .eq('id', id)
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Items
        .select('*')
        .single()
      
      if (error) {
        throw error
      }
      
      // Lokales State-Update
      setItems(prev => prev.map(item => item.id === id ? data : item))
      
      return { data, error: null }
    } catch (err: any) {
      console.error('Fehler beim Ändern des Aktiv-Status:', err)
      setError(err.message || 'Fehler beim Aktualisieren')
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Item löschen (Multi-Tenant)
  const deleteItem = async (id: string) => {
    try {
      setLoading(true)
      
      // Multi-Tenant Security: Organization required
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt.')
      }
      
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .eq('organization_id', currentOrganization.id) // 🔒 Security: nur eigene Items
      
      if (error) {
        throw error
      }
      
      // Lokales State-Update
      setItems(prev => prev.filter(item => item.id !== id))
      
      return { error: null }
    } catch (err: any) {
      console.error('Fehler beim Löschen des Items:', err)
      setError(err.message || 'Fehler beim Löschen')
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Synchronize auth user with users table
  const syncAuthUser = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      const authUser = authData?.user
      
      if (!authUser) {
        console.error('Kein eingeloggter Benutzer gefunden')
        return { success: false, error: 'Kein eingeloggter Benutzer gefunden' }
      }
      
      
      // Prüfen, ob der Benutzer bereits existiert
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = Not found
        console.error('Fehler beim Suchen des Benutzers:', queryError)
        return { success: false, error: queryError.message }
      }
      
      if (existingUser) {
        return { success: true, user: existingUser }
      }
      
      // Neuen Benutzer anlegen
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          name: authUser.user_metadata?.name || 'Admin Benutzer',
          username: authUser.email?.split('@')[0] || 'admin',
          email: authUser.email || '',
          role: 'admin',
          active: true
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Fehler beim Erstellen des Benutzers:', insertError)
        return { success: false, error: insertError.message }
      }
      
      return { success: true, user: newUser }
    } catch (err: any) {
      console.error('Fehler bei der Benutzer-Synchronisierung:', err)
      return { success: false, error: err.message }
    }
  }
  
  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    toggleFavorite,
    toggleActive,
    deleteItem,
    syncAuthUser // Neue Funktion exportieren
  }
}