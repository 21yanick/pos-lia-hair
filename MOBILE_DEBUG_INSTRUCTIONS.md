# 📱 Mobile Debug Instructions

## Was ist das Problem?
Nach PDF öffnen mit `window.location.href` auf Android Chrome bleibt die App bei "Organisation wird geladen..." hängen.

## 🔍 Debug System aktiviert

### Wie debuggen:

1. **App auf echtem Android Chrome öffnen**
2. **Rechts unten**: Blauen "🔍 Debug" Button antippen 
3. **Debug Panel öffnet sich** - alle Logs werden live angezeigt

### Was zu testen:

1. **PDF Button drücken** → Logs zeigen:
   - `PDFManager → DIRECT_NAVIGATION_START`
   - `PDFManager → ORG_BACKUP_SAVED`
   - `PDFManager → NAVIGATE_TO_PDF`

2. **PDF öffnet sich** → Android zeigt PDF

3. **Zurück-Swipe** → App kehrt zurück → Logs zeigen:
   - `OrganizationProvider → MOUNT`
   - `OrganizationProvider → PDF_RETURN_CHECK`
   - `OrganizationRoute → LOADING_SCREEN` ← **Hier bleibt es hängen!**

### Quick Tests im Debug Panel:

- **"Test PDF (Data)"** - Test mit Data URL (kein Netzwerk)
- **"Test PDF (URL)"** - Test mit öffentlicher URL  
- **"Show State"** - Aktueller App State

### Was die Logs zeigen werden:

**Bei "Organisation wird geladen..." hängen:**
```
OrganizationRoute → LOADING_SCREEN
{
  authLoading: false,
  orgLoading: true,
  userOrganizations: false,
  reason: "org"
}
```

**Das zeigt uns:**
- **Auth funktioniert** (authLoading: false)  
- **Aber Organizations laden nicht** (orgLoading: true, userOrganizations: false)
- **React Query Problem** oder **Auth Token Issue**

## 🎯 Was wir rausfinden müssen:

1. **Kommt PDF Return richtig an?** (`PDF_RETURN_CHECK` Logs)
2. **Wird Organization State restauriert?** (`PDF_RESTORE_SUCCESS` Logs) 
3. **Warum bleibt orgLoading = true?** (React Query Issue?)
4. **Auth Token noch gültig?** (Supabase Session Issue?)

## Deploy & Test:

1. **Deploy** diese Version
2. **Android Chrome** öffnen
3. **Debug Panel** aktivieren  
4. **PDF testen** → **Logs screenshotten** → **Berichten** was passiert

**Das wird uns endlich zeigen wo das echte Problem liegt!** 🕵️