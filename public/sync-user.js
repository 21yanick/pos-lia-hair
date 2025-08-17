// Dieses Skript kann in der Browser-Konsole ausgeführt werden, um Benutzer zu synchronisieren
;(async () => {
  try {
    // Wir greifen auf das globale Supabase-Objekt zu
    const supabase = window.supabase

    if (!supabase) {
      console.error('Supabase-Client ist nicht global verfügbar')
      return
    }

    console.log('🔄 Beginne Benutzer-Synchronisierung...')

    // Auth-Benutzer abrufen
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('❌ Fehler beim Abrufen des Auth-Benutzers:', authError)
      return
    }

    if (!user) {
      console.error('❌ Kein authentifizierter Benutzer gefunden')
      return
    }

    console.log('✓ Auth-Benutzer gefunden:', user.email)

    // Prüfen, ob der Benutzer in users-Tabelle existiert
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single()

    // Not found error hat den Code PGRST116
    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Fehler beim Prüfen des Benutzers:', userError)
      return
    }

    if (existingUser) {
      console.log('✓ Benutzer existiert bereits in der Datenbank:', existingUser)
      return
    }

    console.log('⚠️ Benutzer nicht in der Datenbank gefunden, erstelle neuen Eintrag...')

    // Neuen Benutzer in users-Tabelle erstellen
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        name: user.user_metadata?.name || 'Admin Benutzer',
        username: user.email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 8),
        email: user.email,
        role: 'admin',
        active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Fehler beim Erstellen des Benutzers:', insertError)
      return
    }

    console.log('✅ Benutzer erfolgreich erstellt:', newUser)
    console.log('🔄 Bitte Seite neu laden, um die Änderungen zu sehen')
  } catch (error) {
    console.error('❌ Unerwarteter Fehler:', error)
  }
})()
