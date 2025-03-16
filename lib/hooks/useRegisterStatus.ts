'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

// Typen für den Kassenstatus
export type RegisterStatus = {
  id: string
  date: string
  status: 'open' | 'closed'
  starting_amount: number
  ending_amount: number | null
  opened_at: string
  closed_at: string | null
  notes: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export type RegisterStatusInsert = Omit<RegisterStatus, 'id' | 'created_at' | 'updated_at'>

export function useRegisterStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRegisterStatus, setCurrentRegisterStatus] = useState<RegisterStatus | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Aktuellen Kassenstatus laden
  useEffect(() => {
    const loadCurrentRegisterStatus = async () => {
      try {
        setLoading(true)
        
        // Heutiges Datum im Format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0]
        
        // Kassenstatus für den heutigen Tag abfragen
        const { data, error } = await supabase
          .from('register_status')
          .select('*')
          .eq('date', today)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle() // Verwenden statt single()
        
        if (error) {
          console.error('Fehler beim Laden des Kassenstatus:', error)
          setError(`Fehler beim Laden des Kassenstatus: ${error.message}`)
          return
        }
        
        if (data) {
          // Wenn ein Eintrag für heute existiert
          setCurrentRegisterStatus(data as RegisterStatus)
          setIsOpen(data.status === 'open')
        } else {
          // Wenn kein Eintrag für heute existiert, lädt den letzten geschlossenen Eintrag
          const { data: lastClosed, error: lastError } = await supabase
            .from('register_status')
            .select('*')
            .eq('status', 'closed')
            .lt('date', today)
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle()
            
          if (lastError) {
            console.error('Fehler beim Laden des letzten Kassenstatus:', lastError)
          } else if (lastClosed) {
            // Speichere den letzten geschlossenen Kassenstatus, aber setze isOpen auf false
            setCurrentRegisterStatus(lastClosed as RegisterStatus)
            setIsOpen(false)
          } else {
            // Kein Eintrag für heute und kein letzter geschlossener Eintrag
            setIsOpen(false)
            setCurrentRegisterStatus(null)
          }
        }
      } catch (err: any) {
        console.error('Fehler:', err)
        setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten')
      } finally {
        setLoading(false)
      }
    }
    
    loadCurrentRegisterStatus()
  }, [])
  
  // Kasse öffnen
  const openRegister = async (startingAmount: number, notes?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      
      // Heutiges Datum im Format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0]
      
      // Prüfen, ob die Kasse bereits geöffnet ist
      const { data: existingRegister, error: checkError } = await supabase
        .from('register_status')
        .select('*')
        .eq('date', today)
        .eq('status', 'open')
        .maybeSingle()
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      if (existingRegister) {
        throw new Error('Die Kasse ist für heute bereits geöffnet.')
      }
      
      // Neuen Kassenstatus erstellen
      const registerData = {
        date: today,
        status: 'open' as const,
        starting_amount: startingAmount,
        ending_amount: null,
        opened_at: new Date().toISOString(),
        closed_at: null,
        notes: notes || null,
        user_id: userData.user.id
      }
      
      const { data, error } = await supabase
        .from('register_status')
        .insert(registerData)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      // Status aktualisieren
      setCurrentRegisterStatus(data as RegisterStatus)
      setIsOpen(true)
      
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Öffnen der Kasse:', err)
      setError(err.message || 'Fehler beim Öffnen der Kasse')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }
  
  // Kasse schließen und Tagesbericht erstellen
  const closeRegister = async (endingAmount: number, notes?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      if (!currentRegisterStatus) {
        throw new Error('Keine geöffnete Kasse gefunden.')
      }
      
      if (currentRegisterStatus.status === 'closed') {
        throw new Error('Die Kasse ist bereits geschlossen.')
      }

      // Benutzer-ID abrufen
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        throw new Error('Nicht angemeldet. Bitte melden Sie sich an.')
      }
      
      // Kassenstatus aktualisieren
      const { data, error } = await supabase
        .from('register_status')
        .update({
          status: 'closed',
          ending_amount: endingAmount,
          closed_at: new Date().toISOString(),
          notes: notes ? (currentRegisterStatus.notes ? `${currentRegisterStatus.notes}\n${notes}` : notes) : currentRegisterStatus.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentRegisterStatus.id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      // Datum im Format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0]
      
      // Berechnen der Tagessummen nach Zahlungsart
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
      
      if (transactionsError) {
        console.error('Fehler beim Abrufen der Transaktionen:', transactionsError)
        // Hier keine Exception werfen, wir setzen die Werte auf 0
      }
      
      // Summen nach Zahlungsart berechnen
      let cashTotal = 0
      let twintTotal = 0
      let sumupTotal = 0
      
      transactions?.forEach(transaction => {
        if (transaction.payment_method === 'cash') {
          cashTotal += transaction.total_amount
        } else if (transaction.payment_method === 'twint') {
          twintTotal += transaction.total_amount
        } else if (transaction.payment_method === 'sumup') {
          sumupTotal += transaction.total_amount
        }
      })
      
      // Automatisch einen Tagesbericht erstellen oder aktualisieren
      try {
        console.log("Überprüfe, ob bereits ein Tagesbericht für das Datum existiert:", today);
        // Prüfen, ob bereits ein Tagesbericht für heute existiert
        const { data: existingReport, error: reportCheckError } = await supabase
          .from('daily_reports')
          .select('*')
          .eq('date', today)
          .maybeSingle()
        
        if (reportCheckError && reportCheckError.code !== 'PGRST116') {
          console.error('Fehler beim Prüfen des Tagesberichts:', reportCheckError)
        }
        
        console.log("Bestehender Tagesbericht:", existingReport);
        
        if (existingReport) {
          // Bestehenden Bericht aktualisieren
          console.log("Aktualisiere bestehenden Tagesbericht:", existingReport.id);
          const { data: updatedReport, error: updateReportError } = await supabase
            .from('daily_reports')
            .update({
              cash_total: cashTotal,
              twint_total: twintTotal,
              sumup_total: sumupTotal,
              ending_cash: endingAmount,
              status: 'closed',
              notes: notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingReport.id)
            .select()
          
          if (updateReportError) {
            console.error('Fehler beim Aktualisieren des Tagesberichts:', updateReportError)
          } else {
            console.log("Tagesbericht erfolgreich aktualisiert:", updatedReport);
          }
        } else {
          // Neuen Tagesbericht erstellen
          console.log("Erstelle neuen Tagesbericht für Datum:", today);
          console.log("Daten für neuen Tagesbericht:", {
            date: today,
            cash_total: cashTotal,
            twint_total: twintTotal,
            sumup_total: sumupTotal,
            starting_cash: currentRegisterStatus.starting_amount,
            ending_cash: endingAmount,
            status: 'closed',
            notes: notes,
            user_id: userData.user.id
          });
          
          const { data: newReport, error: createReportError } = await supabase
            .from('daily_reports')
            .insert({
              date: today,
              cash_total: cashTotal,
              twint_total: twintTotal,
              sumup_total: sumupTotal,
              starting_cash: currentRegisterStatus.starting_amount,
              ending_cash: endingAmount,
              status: 'closed',
              notes: notes,
              user_id: userData.user.id
            })
            .select()
          
          if (createReportError) {
            console.error('Fehler beim Erstellen des Tagesberichts:', createReportError)
          } else {
            console.log("Tagesbericht erfolgreich erstellt:", newReport);
            
            if (newReport && newReport.length > 0) {
              const createdReport = newReport[0];
              console.log("Verknüpfe Transaktionen und Kassenbucheinträge mit dem Tagesbericht:", createdReport.id);
              
              // Alle Transaktionen für diesen Tag mit dem Bericht verknüpfen
              const { error: updateTransactionsError } = await supabase
                .from('transactions')
                .update({ daily_report_id: createdReport.id })
                .eq('status', 'completed')
                .gte('created_at', `${today}T00:00:00`)
                .lte('created_at', `${today}T23:59:59`)
              
              if (updateTransactionsError) {
                console.error('Fehler beim Verknüpfen der Transaktionen:', updateTransactionsError)
              } else {
                console.log("Transaktionen erfolgreich verknüpft.");
              }
              
              // Auch alle Kassenbucheinträge für diesen Tag mit dem Bericht verknüpfen
              const { error: updateRegisterError } = await supabase
                .from('cash_register')
                .update({ daily_report_id: createdReport.id })
                .eq('date', today)
              
              if (updateRegisterError) {
                console.error('Fehler beim Verknüpfen der Kassenbucheinträge:', updateRegisterError)
              } else {
                console.log("Kassenbucheinträge erfolgreich verknüpft.");
              }
            } else {
              console.error("Tagesbericht wurde erstellt, aber keine Daten zurückgegeben.");
            }
          }
        }
      } catch (reportErr) {
        console.error('Fehler bei der Tagesberichterstellung:', reportErr)
        // Hier keine Exception werfen, da das Schließen der Kasse selbst erfolgreich war
      }
      
      // Status aktualisieren
      setCurrentRegisterStatus(data as RegisterStatus)
      setIsOpen(false)
      
      return { success: true, data }
    } catch (err: any) {
      console.error('Fehler beim Schließen der Kasse:', err)
      setError(err.message || 'Fehler beim Schließen der Kasse')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }
  
  // Kassenstatus für ein bestimmtes Datum abrufen
  const getRegisterStatusForDate = async (date: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('register_status')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      if (error) {
        throw error
      }
      
      return { success: true, data }
    } catch (err: any) {
      console.error(`Fehler beim Laden des Kassenstatus für ${date}:`, err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }
  
  // Aktuellen Kassenbestand berechnen (Startbetrag + Einnahmen - Ausgaben)
  const calculateCurrentBalance = async () => {
    try {
      if (!currentRegisterStatus) {
        return { success: false, error: 'Keine geöffnete Kasse gefunden' }
      }
      
      // Heutiges Datum im Format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0]
      
      // Alle Kassenbucheinträge für heute abrufen
      const { data: registerEntries, error: entriesError } = await supabase
        .from('cash_register')
        .select('*')
        .eq('date', today)
      
      if (entriesError) {
        throw entriesError
      }
      
      // Berechnung des aktuellen Kassenbestands
      let currentBalance = currentRegisterStatus.starting_amount
      
      registerEntries?.forEach(entry => {
        if (entry.type === 'income') {
          currentBalance += entry.amount
        } else if (entry.type === 'expense') {
          currentBalance -= entry.amount
        }
      })
      
      return {
        success: true,
        balance: currentBalance,
        transactions: {
          income: registerEntries?.filter(e => e.type === 'income')?.reduce((sum, e) => sum + e.amount, 0) || 0,
          expense: registerEntries?.filter(e => e.type === 'expense')?.reduce((sum, e) => sum + e.amount, 0) || 0
        }
      }
    } catch (err: any) {
      console.error('Fehler beim Berechnen des Kassenbestands:', err)
      return { success: false, error: err.message }
    }
  }
  
  return {
    loading,
    error,
    isOpen,
    currentRegisterStatus,
    openRegister,
    closeRegister,
    getRegisterStatusForDate,
    calculateCurrentBalance
  }
}