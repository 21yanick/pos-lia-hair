# Organization Switching Test Plan

## **IMPLEMENTIERTE FIXES:**

### ✅ **Fix 1: Debug Logs hinzugefügt**
- **OrganizationContext.switchOrganization**: Vollständige Debug-Logs
- **useOrganizationSwitcher**: Debug-Logs für alle Operationen  
- **ProfileMenu**: Switch-Request Logs
- **OrganizationSelector**: Switch-Request Logs
- **useDebugNavigation**: URL-Change Tracking

### ✅ **Fix 2: Doppelter router.push entfernt**
- **useOrganizationSwitcher.switchToOrganization**: 
  - Verwendet nur Context's `switchOrganization` für Standard /dashboard Navigation
  - Macht nur zusätzlichen `router.push` wenn `targetPath !== '/dashboard'`

### ✅ **Fix 3: Konsistente Hook-Verwendung**
- **ProfileMenu**: Verwendet jetzt `useOrganizationSwitcher.switchToOrganization`
- **OrganizationSelector**: Verwendet weiterhin `useOrganizationSwitcher.switchToOrganization`
- **Beide verwenden denselben Code-Path**

---

## **TEST-ANWEISUNGEN:**

### **Test 1: ProfileMenu Organization Switch**
1. **App starten**: `npm run dev`
2. **Login und navigiere zu einer Organization**
3. **Browser DevTools öffnen** (F12 → Console)
4. **ProfileMenu öffnen** (Profil-Button oben rechts)
5. **"Organisation wechseln..." → Andere Organisation wählen**

**Erwartete Console-Logs:**
```
🧭 NAVIGATION DEBUG - Pathname changed: /org/current-slug/dashboard
🧭 NAVIGATION DEBUG - Current org slug: current-slug
📺 PROFILE MENU - Organization switch requested: [orgId]
🔄 SWITCHER START: [orgId] targetPath: undefined
🔄 SWITCHER - Target org: [OrgName] [slug]
🔄 SWITCHER - Default path, letting context handle router.push
🔄 SWITCH ORG START: [orgId]
🔄 SWITCH ORG - Target: [OrgName] [slug]
🔄 SWITCH ORG - Current pathname: /org/current-slug/dashboard
🔄 SWITCH ORG - Router Push: /org/new-slug/dashboard
🔄 SWITCH ORG - Current URL slug: current-slug
🧭 NAVIGATION DEBUG - router.push called: /org/new-slug/dashboard
🔄 SWITCH ORG - Session Storage Updated
🔄 SWITCH ORG END
🔄 SWITCHER END
📺 PROFILE MENU - Organization switch completed
🧭 NAVIGATION DEBUG - Pathname changed: /org/new-slug/dashboard  
🧭 NAVIGATION DEBUG - Current org slug: new-slug
```

**Erwartetes Verhalten:**
- ✅ URL ändert sich zu `/org/new-slug/dashboard`
- ✅ Page lädt mit neuer Organization
- ✅ Sidebar zeigt neue Organization
- ✅ Header zeigt neue Organization

### **Test 2: OrganizationSelector Switch**
1. **Navigiere zu `/organizations`**
2. **Organization-Karte klicken → "Auswählen"**

**Erwartete Console-Logs:**
```
📋 ORG SELECTOR - Switch requested: [orgId]
🔄 SWITCHER START: [orgId] targetPath: undefined
[... same as above ...]
📋 ORG SELECTOR - Switch completed
```

### **Test 3: Direct URL Navigation**
1. **Direkt zu `/org/other-slug/dashboard` navigieren**
2. **OrganizationGuard sollte automatisch switchen**

**Erwartete Console-Logs:**
```
🔍 DEBUG OrganizationContext - URL slug: other-slug
🔍 DEBUG OrganizationContext - Available orgs: [slug1, slug2, ...]
🔍 DEBUG OrganizationContext - Target org found: [OrgName]
🔍 DEBUG OrganizationContext - Current org set to: [OrgName] [orgId]
```

---

## **DEBUGGING BEI PROBLEMEN:**

### **Problem: URL ändert sich nicht**
**Check Console für:**
- ❌ Fehlt `🧭 NAVIGATION DEBUG - router.push called`? → Router wird nicht aufgerufen
- ❌ Fehlt `🧭 NAVIGATION DEBUG - Pathname changed`? → Router.push funktioniert nicht
- ❌ `SWITCH ORG ERROR`? → Membership nicht gefunden

### **Problem: URL ändert sich, aber Daten werden nicht geladen**
**Check Console für:**
- ❌ Fehlt OrganizationGuard Debug-Logs? → Guard erkennt Slug-Change nicht
- ❌ Fehlt `🔍 DEBUG OrganizationContext - Current org set to`? → State-Update funktioniert nicht

### **Problem: Doppelte Navigation/Flackern**
**Check Console für:**
- ⚠️ Zwei `router.push` Calls? → Bug in useOrganizationSwitcher
- ⚠️ Mehrfache `SWITCH ORG START`? → useEffect-Loop

---

## **MÖGLICHE WEITERFÜHRENDE ISSUES:**

### **1. Next.js Router Cache**
- **Symptom**: Alte Daten werden angezeigt trotz URL-Change
- **Fix**: `router.refresh()` nach switch

### **2. State Persistence Issues**
- **Symptom**: Organization resettet sich nach Page-Reload
- **Fix**: SessionStorage restoration in useEffect

### **3. Middleware Interference**
- **Symptom**: Redirects oder Authentication-Issues
- **Check**: middleware.ts Logs

---

## **PERFORMANCE OPTIMIERUNGEN:**

### **Nach erfolgreichen Tests:**
1. **Debug-Logs entfernen** (außer kritische Fehler)
2. **Memoization prüfen** bei häufigen Re-renders
3. **Loading States** verbessern
4. **Error Boundaries** hinzufügen

---

## **COMMIT MESSAGE SUGGESTIONS:**

```
fix: resolve organization switching URL navigation issues

- Add comprehensive debug logging to track switching flow
- Fix double router.push in useOrganizationSwitcher 
- Unify ProfileMenu and OrganizationSelector to use same hook
- Add useDebugNavigation hook for URL change tracking

Fixes issue where organization switching didn't update URL correctly
due to competing router.push calls in context and switcher hook.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```