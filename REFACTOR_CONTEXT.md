# 🔧 REFACTOR CONTEXT - AUTH & ORG SIMPLIFICATION

**Status:** READY TO START | **Est. Time:** 6h | **Risk:** Medium

## 🎯 PROBLEM & SOLUTION
- **Issue:** "Organisation wird geladen..." infinite loop 
- **Root:** useEffect hell in OrganizationProvider (15+ deps)
- **Fix:** URL-based org selection + simplified hooks

## 📋 PHASE CHECKLIST

### ✅ PHASE 1: Core Auth (2h) - COMPLETED ✅
- [x] Create `useAuth` simplified hook (170+ → 40 lines)
- [x] Create `useCurrentOrganization` hook (URL-based selection)
- [x] Create `useOrganizationPermissions` hook (organization-scoped)
- [x] Remove OrganizationProvider from layout  
- [x] Test: Build successful, no warnings

### ✅ PHASE 2: Business Hooks (3h) - COMPLETED ✅
- [x] Mass Import Replace (37 files) - All imports updated
- [x] Mass Hook Name Replace (136 calls) - All hook calls updated  
- [x] Build verification - Zero errors, zero warnings
- [x] Architecture migration successful

### ⏳ PHASE 3: PDF + Guards (1h)
- [ ] Create simple PDF modal hook
- [ ] Simplify guards to page-level
- [ ] Test: PDF viewing works

## 🚀 KEY IMPLEMENTATIONS

### useAuth (NEW)
```typescript
// src/shared/hooks/auth/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({data}) => {
      if (mounted) { setUser(data.user); setLoading(false) }
    })
    const {data} = supabase.auth.onAuthStateChange((e, session) => {
      if (mounted) setUser(session?.user ?? null)
    })
    return () => { mounted = false; data.subscription.unsubscribe() }
  }, [])
  
  return { user, loading, isAuthenticated: !!user && !loading }
}
```

### useCurrentOrganization (NEW)
```typescript
// src/hooks/useCurrentOrganization.ts  
export function useCurrentOrganization() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  
  const { data: memberships = [] } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: () => fetchUserOrganizations(user.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  })
  
  const currentOrganization = useMemo(() => {
    return memberships.find(m => m.organization.slug === slug)?.organization || null
  }, [slug, memberships])
  
  return { currentOrganization, memberships }
}
```

## 🗂️ FILES TO DELETE (8 files)
```bash
rm src/modules/organization/contexts/OrganizationProvider*.tsx
rm src/modules/organization/hooks/useOrganizationStore.ts
rm src/modules/organization/hooks/useOrganizationNavigation.ts
rm src/shared/components/pdf/EnterprisePDFProvider.tsx
rm src/shared/services/pdfManager.{legacy,backup}.ts
```

## 🔄 MASS REPLACE COMMAND
```bash
# Replace all useOrganization imports (Phase 2)
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/from.*useOrganization/from "@\/hooks\/useCurrentOrganization"/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/useOrganization/useCurrentOrganization/g'
```

## 🚨 CRITICAL TESTS
1. **Loading State:** "Organisation wird geladen..." never appears
2. **Navigation:** /org/example/dashboard loads instantly  
3. **Switching:** Organization switch < 200ms
4. **Refresh:** Page refresh works without freeze
5. **Business:** POS/Sales/Expenses work with org context

## 🔍 TROUBLESHOOTING
- **useEffect loops:** Check browser console for warnings
- **Loading freeze:** Verify currentOrganization is set properly
- **404 org routes:** Check slug exists in user's organizations
- **React Query errors:** Verify user.id exists for queries

## 📁 AFFECTED AREAS
- **Auth Layer:** 6 core files (major refactor)
- **Business Hooks:** 20+ files (import change only)
- **UI Components:** 15+ files (context updates)
- **Guards/Routes:** 5 files (simplification)

## ⚡ NEXT ACTION  
Test runtime functionality: /organizations page and organization switching

**Phase 1 & 2 COMPLETED:** ✅ Major refactoring successfully completed
- Core Auth infrastructure simplified (170+ → 40 lines)
- Mass migration of 37 files with 136 hook calls
- Build successful, zero errors/warnings
- Ready for end-to-end testing