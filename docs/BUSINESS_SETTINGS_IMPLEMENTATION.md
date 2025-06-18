# 🏢 Business Settings - Implementation Plan

## 🎯 Executive Summary

**Problem:** PDFs haben hartcodierte Firmendaten (`POS LIA HAIR`, `Lia Hair by Zilfije Rupp`, `Römerstrasse 6`)  
**Solution:** Konfigurierbare Business Settings mit Logo-Upload  
**Effort:** ~12-16 Stunden  
**Impact:** Professionelle, anpassbare PDFs + Logo-Branding

### 🏆 **Current Achievements (Phases 1-3 Complete)**
- ✅ **Database**: `business_settings` table + RLS + Storage bucket
- ✅ **Backend**: Full CRUD service + validation + logo upload capability  
- ✅ **Frontend**: Settings UI working at `/settings/business`
- ✅ **Form**: Company data saves to database with validation
- ✅ **Theme**: 100% semantic colors, no hardcoded styles
- ✅ **Navigation**: Settings accessible from main settings page
- ✅ **PDFs**: ReceiptPDF + PlaceholderReceiptPDF use dynamic settings
- ✅ **Logo Upload**: Drag & Drop Upload mit File Validation  
- ✅ **Logo in PDFs**: Logo wird in PDFs angezeigt wenn hochgeladen

### 🚧 **Next Up: Phase 5 - Final Polish**
Final testing, edge cases, and polish

---

## 🗄️ Database Schema

```sql
-- Migration: 20241215000001_create_business_settings_table.sql
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Company Data
  company_name TEXT,
  company_tagline TEXT,
  company_address TEXT,
  company_postal_code TEXT,
  company_city TEXT,
  company_phone TEXT,
  company_email TEXT,
  company_website TEXT,
  company_uid TEXT,
  
  -- Logo
  logo_url TEXT,
  logo_storage_path TEXT,
  
  -- Settings
  default_currency TEXT DEFAULT 'CHF',
  tax_rate DECIMAL(5,2) DEFAULT 7.7,
  pdf_show_logo BOOLEAN DEFAULT true,
  pdf_show_company_details BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON business_settings 
  FOR ALL USING (auth.uid() = user_id);

-- Logo Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('business-logos', 'business-logos', true);
CREATE POLICY "Users manage own logos" ON storage.objects FOR ALL 
  USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 📁 Key Files to Create

### Backend
- `src/shared/types/businessSettings.ts` - TypeScript interfaces
- `src/shared/services/businessSettingsService.ts` - CRUD operations + logo upload
- `src/shared/hooks/business/useBusinessSettings.ts` - React hook

### Frontend
- `src/modules/settings/components/business/BusinessSettingsPage.tsx` - Main page
- `src/modules/settings/components/business/CompanyInfoForm.tsx` - Company form
- `src/modules/settings/components/business/LogoUploadSection.tsx` - Logo upload
- `app/(auth)/settings/business/page.tsx` - Route

### PDF Updates
- Update `ReceiptPDF.tsx`, `MonthlyReportPDF.tsx`, `PlaceholderReceiptPDF.tsx`
- Add `businessSettings` prop to all PDF components

---

## 🚀 Implementation Status

### ✅ Phase 1: Backend Foundation (4h) - COMPLETED
1. ✅ Database migration executed (`business_settings` table + RLS + Storage)
2. ✅ TypeScript types created (`src/shared/types/businessSettings.ts`)
3. ✅ BusinessSettingsService built with CRUD + logo upload
4. ✅ useBusinessSettings hook created with full state management
5. ✅ Tested with basic data - all CRUD operations working

### ✅ Phase 2: Basic UI (3h) - COMPLETED
1. ✅ BusinessSettingsPage with theme-compliant tabs layout
2. ✅ CompanyInfoForm with validation and responsive design
3. ✅ Route `/settings/business` created and working (HTTP 200)
4. ✅ Settings navigation button enabled ("Geschäft konfigurieren")
5. ✅ Form saving tested - data persists to database

### ✅ Phase 3: PDF Integration (3h) - COMPLETED
1. ✅ Add `businessSettings` prop to ReceiptPDF.tsx
2. ❌ MonthlyReportPDF.tsx SKIPPED (legacy - rollender Abgleich)
3. ✅ Extend PlaceholderReceiptPDF.tsx
4. ✅ Modify PDF generation services (useSales.ts, useExpenses.ts)
5. ✅ Test PDF generation with fallbacks

### ✅ Phase 4: Logo Upload (2h) - COMPLETED
1. ✅ Create LogoUploadSection with drag & drop
2. ✅ Implement file validation (5MB, JPEG/PNG/SVG)
3. ✅ Test logo upload/delete
4. ✅ Add logo preview in PDFs (ReceiptPDF + PlaceholderPDF)

### 🎯 Phase 5: Polish (2h) - PLANNED
1. Advanced validation and error handling
2. UX improvements (loading states, success messages)
3. Edge case testing
4. Full workflow integration

---

## 🎨 Theme Integration

**Use semantic colors only:**
```tsx
// ✅ Good
className="bg-primary text-primary-foreground"
className="border-l-4 border-l-accent"
className="text-muted-foreground"

// ❌ Avoid
className="bg-purple-600 text-white"
```

**Component patterns:**
```tsx
<Card className="border-l-4 border-l-primary">
<Button className="bg-primary hover:bg-primary/90">
<Input className="border-input focus-visible:ring-ring">
```

---

## 📄 PDF Integration Points

### ReceiptPDF.tsx
```tsx
// Replace lines 144-146:
<Text>{businessSettings?.company_name || 'POS LIA HAIR'}</Text>
<Text>{businessSettings?.company_tagline || 'Ihr Friseursalon'}</Text>

// Add logo if available:
{businessSettings?.logo_url && (
  <Image src={businessSettings.logo_url} style={styles.logo} />
)}
```

### MonthlyReportPDF.tsx  
```tsx
// Replace lines 348-353:
<Text>{businessSettings?.company_name || 'Lia Hair by Zilfije Rupp'}</Text>
<Text>{getFormattedAddress() || 'Römerstrasse 6\n4512 Bellach'}</Text>
```

### Service Integration
```tsx
// In useSales.ts createReceiptPDF:
const { settings } = useBusinessSettings()
const pdfBlob = await pdf(
  <ReceiptPDF sale={sale} items={items} businessSettings={settings} />
).toBlob()
```

---

## 📋 Current Status Checklist

- [x] **Phase 1**: ✅ Backend Foundation complete
- [x] **Phase 2**: ✅ Basic UI complete
- [x] **Phase 3**: ✅ PDF Integration complete
- [x] **Phase 4**: ✅ Logo upload complete
- [ ] **Phase 5**: 🚧 Final polish in progress

**Next:** Logo Upload → Polish → Final Testing

---

## 🎯 Success Criteria

### ✅ Phase 1-3 - ACCOMPLISHED
1. ✅ Settings form saves company data to database
2. ✅ All theme colors used correctly (no hardcoded colors)
3. ✅ Works in both light and dark mode
4. ✅ Form validation and error handling working
5. ✅ Business settings UI accessible via `/settings/business`
6. ✅ PDFs show dynamic company data instead of hardcoded
7. ✅ ReceiptPDF and PlaceholderReceiptPDF integrated

### ✅ Phase 1-4 - ACCOMPLISHED
1. ✅ Settings form saves company data to database
2. ✅ All theme colors used correctly (no hardcoded colors)
3. ✅ Works in both light and dark mode
4. ✅ Form validation and error handling working
5. ✅ Business settings UI accessible via `/settings/business`
6. ✅ PDFs show dynamic company data instead of hardcoded
7. ✅ ReceiptPDF and PlaceholderReceiptPDF integrated
8. ✅ Logo upload works with drag & drop and preview
9. ✅ Logo appears in PDF headers when uploaded

### 🎯 Phase 5 - REMAINING
10. 📋 Final polish and edge case testing

**Progress: 12/14 hours completed (~86%)**