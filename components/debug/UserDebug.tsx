"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"

export function UserDebug() {
  const [authUser, setAuthUser] = useState<any>(null)
  const [customUsers, setCustomUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Auth-Benutzer abrufen
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        
        setAuthUser(userData.user)
        
        // Custom Users abrufen
        const { data: customUsersData, error: customUsersError } = await supabase
          .from('users')
          .select('*')
        
        if (customUsersError) throw customUsersError
        
        setCustomUsers(customUsersData || [])
      } catch (err: any) {
        console.error('Fehler beim Abrufen der Benutzerdaten:', err)
        setError(err.message || 'Fehler beim Abrufen der Benutzerdaten')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const syncAuthUserToCustomTable = async () => {
    if (!authUser) return
    
    try {
      setSyncing(true)
      
      // Prüfen, ob der Benutzer bereits existiert
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = Not found
        throw queryError
      }
      
      if (existingUser) {
        // Benutzer existiert bereits
        await supabase
          .from('users')
          .update({
            email: authUser.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser.id)
      } else {
        // Neuen Benutzer anlegen
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            name: authUser.user_metadata?.name || 'Admin Benutzer',
            username: authUser.email.split('@')[0],
            email: authUser.email,
            role: 'admin',
            active: true
          })
        
        if (insertError) throw insertError
      }
      
      // Aktualisierte Daten abrufen
      const { data: updatedUsers, error: refreshError } = await supabase
        .from('users')
        .select('*')
      
      if (refreshError) throw refreshError
      
      setCustomUsers(updatedUsers || [])
    } catch (err: any) {
      console.error('Fehler beim Synchronisieren des Benutzers:', err)
      setError(err.message || 'Fehler beim Synchronisieren des Benutzers')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return <div>Lade Benutzerdaten...</div>
  
  const userMatch = customUsers.find(user => user.id === authUser?.id)
  const needsSync = !userMatch

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Benutzer-Debug-Informationen</CardTitle>
        <CardDescription>
          Informationen über den aktuellen Benutzer und Datenbankverknüpfungen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-1">Auth-Benutzer (Supabase Auth)</h3>
          <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
            <pre>{JSON.stringify(authUser, null, 2)}</pre>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-1">Benutzerdefinierte Users-Tabelle</h3>
          <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
            <pre>{JSON.stringify(customUsers, null, 2)}</pre>
          </div>
        </div>
        
        <div className="pt-2">
          <div className={`p-3 rounded-md ${needsSync ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
            {needsSync 
              ? 'Der Auth-Benutzer ist nicht mit der benutzerdefinierten Users-Tabelle verknüpft. Dies wird benötigt, um Datenbankoperationen durchzuführen.'
              : 'Der Auth-Benutzer ist mit der benutzerdefinierten Users-Tabelle verknüpft. Alles in Ordnung!'}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {needsSync && (
          <Button 
            onClick={syncAuthUserToCustomTable} 
            disabled={syncing}
            className="w-full"
          >
            {syncing ? 'Synchronisiere...' : 'Auth-Benutzer mit Users-Tabelle synchronisieren'}
          </Button>
        )}
        {error && (
          <div className="text-red-500 mt-2 text-sm">{error}</div>
        )}
      </CardFooter>
    </Card>
  )
}