# 🚀 LIA HAIR POS - CLAUDE CONTEXT DOCUMENT

**Datum:** 26. Juni 2025  
**Status:** Email + JWT Invitation System ERFOLGREICH implementiert  
**Nächste Phase:** Progressive Onboarding + Invitation Management UI

## 📋 PROJEKT ÜBERSICHT

**Multi-Tenant Hair Salon POS System** - Enterprise-grade SaaS Platform für Schweizer Friseursalons

- **Domain:** `lia-hair.ch` (gehört User)
- **App URL:** `https://pos.lia-hair.ch` 
- **Database:** Self-hosted Supabase auf Hetzner VPS
- **Tech Stack:** Next.js 15, React 19, TypeScript, TailwindCSS, Supabase, Resend

## ✅ ERFOLGREICH IMPLEMENTIERT (Juni 2025)

### 🔐 **Authentication & Organization System**
- **URL-based Organization Selection** (`/org/[slug]/dashboard`)
- **Multi-Tenant Row Level Security** (Database-level isolation)
- **3-stufige Rollen-Hierarchie** (staff → admin → owner)
- **24 granulare Permissions** (pos.create_sale, banking.manage_accounts, etc.)
- **React Query Caching** (5min stale time, org-scoped invalidation)

### 📧 **Email Infrastructure (RESEND)**
- **Domain verified:** `lia-hair.ch` mit DNS Records bei Hoststar
- **API Key:** Konfiguriert in `.env.local`
- **React Email Templates:** Professionelle HTML Email Templates
- **3.000 emails/month FREE TIER** (aktuell genutzt)

**Email Adressen:**
```
einladung@lia-hair.ch    # User invitations
willkommen@lia-hair.ch   # Welcome emails  
noreply@lia-hair.ch      # System emails
test@lia-hair.ch         # Testing
```

### 🎯 **JWT Invitation System**
- **Secure JWT Tokens** (7 Tage gültig, signed with JWT_SECRET)
- **Token Validation API** (`/api/invitations/validate`)
- **Invitation Sending API** (`/api/invitations/send`)
- **Registration Flow Integration** (`/register?invite=token`)

**FUNKTIONIERT:** User kann mit JWT Token registrieren und wird automatisch zur Organization hinzugefügt.

## 🗂️ WICHTIGE IMPLEMENTIERTE DATEIEN

### **Services (Business Logic)**
```
src/shared/services/
├── emailService.ts          # Resend Email integration
├── invitationService.ts     # JWT token creation/validation
└── authService.ts           # Existing auth logic
```

### **Email Templates**
```
src/emails/
├── InviteUserEmail.tsx      # Invitation email template
└── WelcomeEmail.tsx         # Welcome email template
```

### **API Routes**
```
app/api/
├── test-email/route.ts      # Email testing endpoint
├── test-invitation/route.ts # JWT testing endpoint
├── invitations/
│   ├── send/route.ts        # Send invitation API
│   └── validate/route.ts    # Validate invitation API
```

### **Registration Flow**
```
app/register/page.tsx        # UPGRADED: JWT token support
                            # Auto-validation of invitation tokens
                            # Email pre-fill from invitation
                            # Welcome email sending
```

## 🎛️ ENVIRONMENT VARIABLES (.env.local)
```bash
RESEND_API_KEY=re_Kwp5oCqF_KqQT7EsKEQa47qDwMMxXJxmm
JWT_SECRET=lia-hair-pos-super-secret-jwt-key-change-in-production-2025
NEXT_PUBLIC_APP_URL=https://pos.lia-hair.ch
# + Supabase credentials already configured
```

## 🧪 TESTING COMMANDS

```bash
# Test Email System
curl -X POST http://localhost:3000/api/test-email

# Test JWT System  
curl -X POST http://localhost:3000/api/test-invitation

# Test Registration mit Invitation
# URL: /register?invite=[JWT_TOKEN]
```

## ❌ WAS NOCH FEHLT (HIGH PRIORITY)

### 1. **Invitation Management UI** 
**Ort:** Settings Page oder neue `/org/[slug]/team` Page
**Features:**
- Team Mitglieder einladen (Email + Rolle)
- Pending Invitations anzeigen
- Invitation Links generieren/kopieren
- User Rollen ändern/entfernen

### 2. **Progressive Onboarding Flow**
**Nach Registration/Login:**
- Welcome Screen mit Organization Setup
- Interactive Checklist (3-5 Steps)
- Contextual Tooltips statt Tours
- Empty States mit Clear CTAs

### 3. **Enhanced User Management**
**Settings/Team Page:**
- User Liste mit Rollen
- Role Change Interface  
- User Removal Functionality
- Invitation History

## 📐 EXISTING ARCHITECTURE PATTERNS

### **URL-based Organization Context**
```typescript
// useCurrentOrganization Hook (bereits implementiert)
const { currentOrganization, memberships } = useCurrentOrganization()
// Extracts slug from URL params, loads memberships, finds org by slug
```

### **Permission System**
```typescript
// useOrganizationPermissions Hook (bereits implementiert) 
const { hasPermission, userRole } = useOrganizationPermissions()
// Role-based permissions: owner > admin > staff
```

### **React Query Pattern**
```typescript
// Organization-scoped Query Keys
['business', organizationId, 'sales', filters]
['business', organizationId, 'team', 'members']
```

## 🎯 IMPLEMENTATION GUIDELINES

### **UI Components zu verwenden:**
- **Shadcn/UI Components** (bereits 45+ installiert)
- **Button, Input, Card, Dialog, Tabs** etc.
- **Consistent Design System** (dark/light theme support)

### **Service Pattern:**
```typescript
// Alle Business Logic in Services
export class TeamService {
  static async inviteUser({ organizationId, email, role }) {
    return InvitationService.sendInvitation({ ... })
  }
}
```

### **API Pattern:**
```typescript
// Standard API Response Format
{ success: boolean, data?: any, error?: string }
```

## 📊 DATABASE SCHEMA (relevant tables)

```sql
-- Core Tables (bereits implementiert)
organizations              # Salon instances
organization_users         # Team memberships (role: owner/admin/staff)  
users                      # User profiles
business_settings          # Per-organization configuration

-- RLS Policies aktiv für Multi-Tenant Security
```

## 🚀 NÄCHSTE IMPLEMENTIERUNG

**Phase 1: Invitation Management UI (2-3 Stunden)**
1. Team Settings Page (`/org/[slug]/settings/team`)
2. "Team Mitglied einladen" Dialog
3. Pending Invitations Liste
4. User Management (Rolle ändern, entfernen)

**Phase 2: Progressive Onboarding (2-3 Stunden)**
1. Welcome Screen nach Registration
2. Interactive Setup Checklist
3. Empty States mit CTAs
4. Contextual Tooltips

## 💡 WICHTIGE HINWEISE

- **Rückwärtskompatibilität:** NICHT nötig (noch in Entwicklung)
- **Clean Implementation:** Standard patterns, keine Legacy Support
- **Email Domain:** `lia-hair.ch` (nicht pos-lia-hair.ch!)
- **JWT Secret:** In Production durch starken Key ersetzen
- **Resend Limits:** 3.000 emails/month (FREE), dann $20/month für 50k

## 🎯 SUCCESS METRICS

- ✅ **JWT Token Validation:** Funktioniert perfekt
- ✅ **Email Sending:** Test Emails erfolgreich  
- ✅ **Registration Flow:** Screenshot bestätigt funktioniert
- ✅ **Team Management UI:** VOLLSTÄNDIG implementiert + responsive
- ❌ **Team Management Backend:** APIs fehlen (Buttons funktionieren nicht)
- ⏳ **Progressive Onboarding:** Noch zu implementieren

## 🚨 AKTUELLE TECHNICAL DEBT

### **Team Management - Backend APIs fehlen**
**Problem:** UI ist 100% fertig, aber Buttons machen nichts (404 errors)
- ❌ "Member entfernen" → `DELETE /api/organizations/[orgId]/members/[userId]` (404)
- ❌ "Rolle ändern" → `PATCH /api/organizations/[orgId]/members/[userId]/role` (404)  
- ❌ "Einladung erneut senden" → `POST /api/invitations/resend` (404)

**Impact:** User Experience ist schlecht - professionelle UI aber kaputte Funktionalität

### **Bestehende Architektur Patterns (zu folgen):**
```typescript
// 1. Service Layer Pattern
export class TeamService {
  static async removeMember() { /* business logic */ }
  static async changeRole() { /* business logic */ }
  static async resendInvitation() { /* business logic */ }
}

// 2. API Layer Pattern  
export async function DELETE(request: NextRequest) {
  const result = await TeamService.removeMember()
  return NextResponse.json(result)
}

// 3. Auth Pattern
const { data: userData } = await supabase.auth.getUser()

// 4. Validation & Error Handling
if (!organizationId) {
  return NextResponse.json({ error: 'Deutsche Fehlermeldung' }, { status: 400 })
}
```

### **Security Requirements:**
- **Permission Matrix**: owner > admin > staff
- **Self-Action Prevention**: Niemand kann sich selbst entfernen/ändern
- **Organization-Scoped**: RLS policies sind bereits korrekt
- **Role Validation**: Nur berechtigte Rollen können Änderungen machen

### **Implementation Roadmap:**
1. **TeamService.ts** erstellen (business logic, security validation)
2. **3 API Routes** erstellen (delegation an TeamService)
3. **Testing** der vollständigen UI → Backend Integration
4. **Error States** in UI hinzufügen (falls needed)

---

**READY FOR:** Team Management Backend APIs Implementation (1-2h, strukturiert)
**CONTACT:** User möchte saubere, durchdachte Implementation ohne Quick-Fixes