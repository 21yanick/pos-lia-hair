# 📅 Appointment System Redesign - Complete Specification

## 🎯 **Vision: Simple, Fast, Mobile-First**

**Kernprinzipien:**
- **Max 4-5 Taps** für komplette Buchung
- **Clean, minimalistisches Design** ohne Information Overload  
- **Mobile-First** mit Bottom Calendar Pattern
- **Performance-optimiert** mit Next.js 15 + React Server Components
- **Pragmatisch** - keine unnötige Komplexität

---

## 🏗️ **Architecture Overview**

### **Component Structure**
```
src/modules/appointments/
├── components/
│   ├── calendar/
│   │   ├── MonthGrid.tsx         // RSC - Month view with indicators
│   │   ├── DayTimeline.tsx       // Client - Interactive day view
│   │   └── AppointmentBlock.tsx  // Reusable appointment display
│   ├── dialogs/
│   │   ├── QuickBookingDialog.tsx // 2-step simplified booking
│   │   └── DurationPicker.tsx     // Service duration adjustment
│   ├── settings/
│   │   ├── BusinessHoursConfig.tsx  // Working hours setup
│   │   ├── VacationManager.tsx      // Multi-day vacation periods
│   │   └── BookingRulesConfig.tsx   // Basic booking rules
│   └── AppointmentsPage.tsx       // Main page with new layout
├── hooks/
│   ├── useBusinessSettings.tsx
│   ├── useOptimisticBooking.tsx
│   └── useMonthData.tsx
└── services/
    ├── businessSettingsService.ts
    └── appointmentOptimizations.ts
```

---

## 📱 **Mobile-First UI Specification**

### **Main Layout (AppointmentsPage.tsx)**
```
┌─────────────────────────────────────┐
│ 📅 Termine                    [⚙️]  │ ← Simple header + settings
├─────────────────────────────────────┤
│        Mai 2024                     │ ← Month display only
│ Mo Di Mi Do Fr Sa So                │
│  1  2  3  4• 5  6  7               │ ← Visual indicators:
│  8  9○10 11●12 13 14               │   • = heute (primary color)
│ 15 16 17 18 19 20 21               │   ○ = frei (muted)  
│ 22 23 24 25 26 27 28               │   ● = gebucht (secondary)
│ 29 30 31                           │   □ = urlaub (destructive)
└─────────────────────────────────────┘
│ ▼ Heute, 4. Mai 2024                │ ← Selected day header
├─────────────────────────────────────┤
│ 09│────────────────────────────────│ ← Clean timeline
│ 10│ [Maria M.] Haarschnitt         │   - 1h grid lines
│ 11│ ────── + ──────────────────── │ ← Tap = Quick Dialog  
│ 12│ [Mittagspause]                 │   - Breaks shown
│ 13│ [Hans W.] Färben + Schnitt     │   - Multi-service blocks
│ 14│ ────────────────────────────── │
│ 15│ ────────────────────────────── │
└─────────────────────────────────────┘
                [+] FAB              ← Floating Action Button
```

### **Visual Design System**
```css
/* Month Grid Indicators */
.day-today     { bg-primary, text-primary-foreground, ring-2 }
.day-free      { bg-muted/50, text-muted-foreground }  
.day-booked    { bg-secondary, text-secondary-foreground, badge-count }
.day-vacation  { bg-destructive/20, text-destructive, diagonal-lines }
.day-closed    { bg-muted, text-muted-foreground, opacity-60 }

/* Timeline */
.timeline-hour { border-b, h-16, grid-template }
.appointment-block { 
  rounded-md, p-2, border, shadow-sm
  hover:shadow-md, transition-all
}
.free-slot { 
  border-dashed, opacity-50
  hover:opacity-100, cursor-pointer 
}
```

---

## ⚡ **Simplified 2-Step Booking Dialog**

### **Step 1: Service + Zeit (Combined)**
```typescript
interface Step1State {
  selectedServices: ServiceSelection[]
  customDuration?: number
  suggestedEndTime: string
}

interface ServiceSelection {
  service: Item
  duration: number // can override default
}
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Neuer Termin - 4. Mai, 11:00        │
├─────────────────────────────────────┤
│ Services auswählen:                 │
│ [✓] Haarschnitt   45min             │ ← Multiple select
│ [ ] Färben        90min             │
│ [ ] Waschen       20min             │
│                                     │
│ ⏱️ Gesamtdauer: 45min               │ ← Auto calculated
│ ◀ [-15] [45min] [+15] ▶            │ ← Manual adjustment
│                                     │
│ 🕐 Zeit: 11:00 - 11:45             │ ← End time calculated  
│ ◀ 10:30 [11:00] 11:30 ▶            │ ← Start time adjustment
│                                     │
│ [Weiter →]                          │
└─────────────────────────────────────┘
```

### **Step 2: Kunde + Bestätigung**
```
┌─────────────────────────────────────┐
│ Kunde auswählen:                    │
│ [•] Bestehend  [ ] Laufkundschaft   │
│                                     │
│ 🔍 [Maria Müller        ▼]         │ ← Searchable dropdown
│                                     │
│ 📝 Notizen (optional):              │
│ [                    ]              │
│                                     │
│ ✅ Zusammenfassung:                 │
│ Maria M. - Haarschnitt              │
│ 4. Mai, 11:00-11:45                 │
│                                     │ ← No price needed!
│ [◀ Zurück]    [Termin erstellen]    │
└─────────────────────────────────────┘
```

**Optimized Flow: 4-5 Taps**
1. Tap freie Zeit (11:00)
2. Tap Service (Haarschnitt) 
3. Tap Kunde (Maria M.)
4. Tap "Termin erstellen"
5. Optional: Dauer anpassen

---

## ⚙️ **Business Settings Implementation**

### **Database Schema**
```sql
CREATE TABLE business_settings (
  organization_id uuid PRIMARY KEY REFERENCES organizations(id),
  
  -- Working Hours (JSONB for flexibility)
  working_hours jsonb NOT NULL DEFAULT '{
    "monday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": [{"start": "12:00", "end": "13:00"}]},
    "tuesday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": []},
    "wednesday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": []},
    "thursday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": []},
    "friday": {"start": "09:00", "end": "18:00", "closed": false, "breaks": []},
    "saturday": {"start": "09:00", "end": "16:00", "closed": false, "breaks": []},
    "sunday": {"start": "10:00", "end": "16:00", "closed": true, "breaks": []}
  }',
  
  -- Booking Rules
  booking_rules jsonb NOT NULL DEFAULT '{
    "slotInterval": 15,
    "defaultDuration": 60,
    "maxAdvanceDays": 90,
    "minAdvanceHours": 2,
    "bufferMinutes": 5,
    "autoConfirm": true
  }',
  
  -- Display Preferences  
  display_preferences jsonb NOT NULL DEFAULT '{
    "timelineStart": "08:00",
    "timelineEnd": "19:00",
    "showWeekends": true,
    "showClosedDays": false
  }',
  
  -- Vacation Periods (Multi-day support)
  vacation_periods jsonb NOT NULL DEFAULT '[]',
  -- Example: [{"start": "2024-07-15", "end": "2024-07-29", "reason": "Sommerurlaub"}]
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policy
CREATE POLICY "business_settings_access" ON business_settings
FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM organization_users 
    WHERE user_id = auth.uid() AND active = true
  )
);
```

### **TypeScript Types**
```typescript
interface BusinessSettings {
  organizationId: string
  
  workingHours: {
    [K in WeekDay]: {
      start: string      // "09:00"
      end: string        // "18:00"  
      closed: boolean    // false
      breaks: {
        start: string    // "12:00"
        end: string      // "13:00"
      }[]
    }
  }
  
  bookingRules: {
    slotInterval: 15 | 30           // Booking grid
    defaultDuration: 30 | 45 | 60   // Default service time
    maxAdvanceDays: 30 | 60 | 90    // How far ahead
    minAdvanceHours: 1 | 2 | 4 | 24 // Minimum notice
    bufferMinutes: 0 | 5 | 10       // Time between appointments
    autoConfirm: boolean            // Auto-confirm bookings
  }
  
  displayPreferences: {
    timelineStart: string    // "08:00" - Timeline display start
    timelineEnd: string      // "19:00" - Timeline display end  
    showWeekends: boolean    // Show Sat/Sun in calendar
    showClosedDays: boolean  // Show closed days in timeline
  }
  
  vacationPeriods: {
    start: string     // "2024-07-15" - Start date
    end: string       // "2024-07-29" - End date  
    reason: string    // "Sommerurlaub" - Description
  }[]
}

type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
```

### **Settings UI Location**
```
Main Navigation:
├── Dashboard
├── Verkauf  
├── Kunden
├── Termine (existing AppointmentsPage)
└── Settings ← Contains new Terme Card
    ├── Import
    ├── Verwaltung
    ├── Mein Profil
    ├── Firma
    ├── Termine ← NEW Card with appointment settings
    └── Team Verwaltung
```

---

## 🚀 **Next.js 15 Performance Architecture**

### **Server Components Strategy**
```typescript
// app/termine/page.tsx (Server Component)
export default async function AppointmentsPage() {
  const orgId = await getCurrentOrganizationId()
  
  // Parallel data fetching
  const [businessSettings, monthAppointments] = await Promise.all([
    getBusinessSettings(orgId),
    getMonthAppointments(new Date(), orgId)
  ])
  
  return (
    <div className="flex flex-col h-full">
      {/* Server-rendered month grid */}
      <MonthGrid 
        initialData={monthAppointments}
        settings={businessSettings}
      />
      
      {/* Client component for interactions */}
      <Suspense fallback={<DayTimelineSkeleton />}>
        <DayTimeline 
          settings={businessSettings}
          initialDate={new Date()}
        />
      </Suspense>
    </div>
  )
}

// Cached data fetching
const getBusinessSettings = cache(async (orgId: string) => {
  return await db.businessSettings.findUnique({
    where: { organizationId: orgId }
  })
})
```

### **Client Components for Interactivity**
```typescript
// MonthGrid.tsx (Server Component)
export function MonthGrid({ initialData, settings }) {
  const monthData = getMonthIndicators(initialData, settings)
  
  return (
    <div className="month-grid">
      {monthData.map(day => (
        <DayIndicator 
          key={day.date}
          day={day}
          onClick={() => {}} // Client component will handle
        />
      ))}
    </div>
  )
}

// DayTimeline.tsx (Client Component)  
'use client'
export function DayTimeline({ settings, initialDate }) {
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const { data: appointments } = useAppointments(selectedDate)
  
  return (
    <div className="day-timeline">
      {generateTimeSlots(settings).map(slot => (
        <TimeSlot
          key={slot.time}
          slot={slot}
          appointments={appointments}
          onSlotClick={handleSlotClick}
        />
      ))}
    </div>
  )
}
```

### **Optimistic Updates**
```typescript
// useOptimisticBooking.tsx
export function useOptimisticBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createAppointment,
    
    onMutate: async (newAppointment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['appointments'])
      
      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(['appointments'])
      
      // Optimistically update to new value
      queryClient.setQueryData(['appointments'], old => [
        ...old,
        { ...newAppointment, id: 'temp-' + Date.now() }
      ])
      
      return { previousAppointments }
    },
    
    onError: (err, newAppointment, context) => {
      // Rollback on error
      queryClient.setQueryData(['appointments'], context.previousAppointments)
    },
    
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['appointments'])
    }
  })
}
```

---

## 📋 **Implementation Roadmap**

### **Phase 1: Foundation (Week 1)**
1. **Database Setup**
   ```bash
   # Migration for business_settings table
   npx supabase migration new business_settings
   ```

2. **Settings UI Components**
   ```typescript
   // Priority order:
   1. BusinessHoursConfig.tsx  - Core working hours
   2. VacationManager.tsx      - Multi-day periods  
   3. BookingRulesConfig.tsx   - Basic rules
   ```

3. **Navigation Update**
   ```typescript
   // Update app-sidebar.tsx
   + "Termine" section with submenu
   ```

### **Phase 2: Core UI Rebuild (Week 2)**
1. **Month Grid Component**
   ```typescript
   // Server Component with indicators
   - Visual state calculation
   - Vacation period overlay
   - Business hours consideration
   ```

2. **Day Timeline Component**  
   ```typescript
   // Client Component with interactions
   - Touch-optimized slots
   - Appointment blocks  
   - Click-to-book functionality
   ```

3. **Simplified Dialog**
   ```typescript
   // 2-step booking flow
   - Service + Duration (Step 1)
   - Customer + Confirm (Step 2)
   - Remove price complexity
   ```

### **Phase 3: Integration & Optimization (Week 3)**
1. **Business Logic Integration**
   ```typescript
   // Connect all components
   - Settings → Timeline constraints
   - Vacation → Month indicators
   - Working hours → Available slots
   ```

2. **Performance Optimization**
   ```typescript
   // Next.js 15 patterns
   - Suspense boundaries
   - Parallel data fetching
   - Optimistic updates
   ```

3. **Mobile Optimization**
   ```typescript
   // Touch interactions
   - Gesture handling
   - Responsive design
   - Performance on mobile
   ```

### **Phase 4: Testing & Polish (Week 4)**
1. **Comprehensive Testing**
   - Unit tests for business logic
   - Integration tests for booking flow
   - E2E tests for complete user journey

2. **Performance Validation**
   - Lighthouse scoring
   - Real device testing
   - Bundle size optimization

3. **User Experience Polish**
   - Loading states
   - Error handling
   - Accessibility

---

## 🧪 **Testing Strategy**

### **Key Test Cases**
```typescript
// Business Logic Tests
- Working hours validation
- Vacation period conflicts  
- Appointment overlap detection
- Service duration calculations

// UI Interaction Tests  
- Month grid navigation
- Timeline slot clicking
- 2-step dialog flow
- Optimistic booking updates

// Performance Tests
- Server component rendering
- Client component hydration
- Data fetching optimization
- Bundle size requirements
```

### **Success Metrics**
- **Booking Flow:** Max 5 taps from calendar to confirmation
- **Performance:** < 2s initial load, < 500ms interactions
- **Mobile UX:** Touch targets min 44px, smooth scrolling
- **Accessibility:** WCAG 2.1 AA compliance

---

## 🎯 **Migration Plan**

### **Backward Compatibility**
```typescript
// Existing AppointmentDialog.tsx → Keep as fallback
// New QuickBookingDialog.tsx → Primary interface
// Gradual rollout with feature flag

const useNewBookingFlow = () => {
  return useFeatureFlag('new-booking-dialog')
}
```

### **Data Migration**
```sql
-- Migrate existing org settings to business_settings
INSERT INTO business_settings (organization_id, working_hours, booking_rules)
SELECT id, default_working_hours(), default_booking_rules()
FROM organizations;
```

### **Rollout Strategy**
1. **Beta Phase:** Internal testing with existing data
2. **Gradual Rollout:** Feature flag for new users
3. **Full Migration:** Switch all users after validation
4. **Cleanup:** Remove old components after stable period

---

## 📚 **Documentation Requirements**

### **User Documentation**
- Settings configuration guide
- Booking workflow explanation  
- Mobile usage tips

### **Developer Documentation**
- Component API documentation
- Business logic explanations
- Performance best practices
- Testing guidelines

---

## ✅ **Definition of Done**

### **Functional Requirements**
- [ ] Business settings fully configurable
- [ ] Month grid with visual indicators
- [ ] Interactive day timeline
- [ ] 2-step booking dialog (max 5 taps)
- [ ] Multi-day vacation support
- [ ] Mobile-optimized interface

### **Technical Requirements**  
- [ ] Next.js 15 Server Components
- [ ] Performance < 2s initial load
- [ ] Optimistic updates working
- [ ] Dark mode compatibility
- [ ] Accessibility compliance

### **Quality Requirements**
- [ ] 90%+ test coverage
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Mobile-first validation
- [ ] Cross-browser compatibility

---

## 📊 **Implementation Status Update**

### **✅ Phase 1: Foundation (COMPLETED - 2025-01-07)**

**Completed Tasks:**
1. ✅ **Database Migration:** Extended `business_settings` table with appointment fields
   - `working_hours` (JSONB) - Weekly schedule with breaks
   - `booking_rules` (JSONB) - Appointment constraints  
   - `display_preferences` (JSONB) - UI preferences
   - `vacation_periods` (JSONB) - Multi-day vacation support

2. ✅ **TypeScript Types:** Extended `businessSettings.ts` with comprehensive types
   - `WorkingHours` (mapped type), `BookingRules`, `DisplayPreferences`, `VacationPeriod`
   - Default values and validation schemas
   - Full type safety for appointment settings
   - **Fixed:** Build error with mapped type syntax (interface → type)

3. ✅ **Service Layer:** Enhanced `businessSettingsService.ts` 
   - CRUD operations for all appointment settings
   - Business logic helpers (isOrganizationOpen, generateTimeSlots)
   - Validation functions with error handling
   - Multi-tenant security throughout

4. ✅ **React Query Hook:** Extended `useBusinessSettingsQuery.ts`
   - Optimistic updates for all appointment settings
   - Comprehensive error handling and loading states
   - Business logic helpers integrated
   - Full appointment settings API coverage

5. ✅ **UI Components** - Three comprehensive appointment settings components:
   - **BusinessHoursConfig.tsx** - Full working hours management with breaks & copy functionality
   - **VacationManager.tsx** - Multi-day vacation periods with calendar integration
   - **BookingRulesConfig.tsx** - Comprehensive booking rules and display preferences

6. ✅ **Settings Integration** - Clean Settings page integration:
   - **NEW:** Termine card added to main Settings page grid
   - Navigation: Settings → Termine → `/appointments/settings`
   - Consistent UI/UX with existing settings categories
   - **Removed:** Complex sidebar submenu approach

7. ✅ **Page Structure** - Complete appointment settings flow:
   - `/appointments` - Main appointments overview (existing)
   - `/appointments/settings` - Dedicated settings page with all three components
   - Proper metadata and SEO optimization

**Current Database State:**
```sql
-- All appointment fields successfully added to business_settings table
working_hours JSONB NOT NULL DEFAULT '...'
booking_rules JSONB NOT NULL DEFAULT '...' 
display_preferences JSONB NOT NULL DEFAULT '...'
vacation_periods JSONB NOT NULL DEFAULT '[]'
```

**Current Architecture:**
```
Settings Integration:
├── Settings Page Grid
│   ├── Import
│   ├── Verwaltung  
│   ├── Mein Profil
│   ├── Firma
│   ├── Termine ← NEW: Links to /appointments/settings
│   └── Team Verwaltung
│
└── /appointments/settings
    ├── BusinessHoursConfig (Working hours + breaks + copy functions)
    ├── VacationManager (Multi-day periods + calendar)
    └── BookingRulesConfig (Rules + display preferences + summary)
```

### **🔄 Phase 2: Core UI Rebuild (IN PROGRESS)**

**✅ Phase 2.1: Month Grid Component (Server Component) - COMPLETED**
- ✅ Calendar Types defined (`calendar.ts`)
  - `DayStatus`, `CalendarDay`, `MonthData` interfaces
  - Visual indicator configuration system
  - Swiss locale calendar settings
- ✅ Calendar Utils (`calendarUtils.ts`)
  - Month data generation (42-day grid)
  - Business logic application functions
  - Swiss locale date formatting
- ✅ MonthGrid Server Component (`MonthGrid.tsx`)
  - Performance-optimized server-side rendering
  - Visual indicators for all day states
  - Error handling for business settings
  - Accessibility support with ARIA labels
- ✅ MonthGridClient wrapper (`MonthGridClient.tsx`)
  - Client-side interaction handling
  - Suspense integration with loading skeleton
- ✅ Clean module exports (`index.ts`)

**✅ Phase 2.2: Day Timeline Component (Client Component) - COMPLETED**
- ✅ Timeline Types defined (`timeline.ts`)
  - `TimeSlot`, `AppointmentBlock`, `TimelineData` interfaces
  - Slot status system and visual configuration
  - Touch-optimized layout constants
- ✅ Timeline Utils (`timelineUtils.ts`)
  - Timeline data generation with business logic
  - Time calculation utilities (minutes/hours conversion)
  - Appointment positioning for absolute layout
  - Availability checking and slot validation
- ✅ DayTimeline Client Component (`DayTimeline.tsx`)
  - Touch-optimized interactive timeline
  - Real-time appointment display with absolute positioning
  - Current time indicator for today
  - Auto-scroll to current time
  - Click handlers for slots and appointments
  - Responsive design for mobile/desktop
- ✅ useAppointmentCalendar Hook (`useAppointmentCalendar.ts`)
  - State management for calendar interactions
  - Month navigation and day selection
  - Dialog state management for booking flow
- ✅ Clean module exports and integration

**✅ Phase 2.2.5: Clean Integration (COMPLETED)**
- ✅ **New AppointmentsPage**: Complete redesign with MonthGrid + DayTimeline
  - Desktop: Side-by-side layout (MonthGrid sidebar + Timeline main)
  - Mobile: Stacked layout (MonthGrid top + Timeline bottom)
  - Touch-optimized floating action button
  - Integrated useAppointmentCalendar state management
- ✅ **Legacy Cleanup**: Removed old calendar components
  - ❌ AgendaView.tsx (removed)
  - ❌ SimpleWeekView.tsx (removed)
  - ❌ Old calendar widget dependencies (removed)
  - ✅ Clean export structure

**Phase 2.3: Simplified Booking Dialog**
- 2-step booking process (Service+Time, Customer+Confirm)
- Max 4-5 taps from calendar to completion
- Mobile-first design with optimal UX

**Phase 2.4: Business Logic Integration**
- Connect settings to UI constraints
- Working hours → Available time slots
- Vacation periods → Calendar blocking
- Booking rules → Timeline behavior

**Current Implementation Details:**
```typescript
// ✅ COMPLETED: Calendar System + Clean Integration
src/modules/appointments/
├── components/
│   ├── AppointmentsPage.tsx (NEW: MonthGrid + DayTimeline integration)
│   ├── calendar/
│   │   ├── MonthGrid.tsx (Server Component with visual indicators)
│   │   ├── MonthGridClient.tsx (Client wrapper with Suspense)
│   │   ├── DayTimeline.tsx (Touch-optimized timeline)
│   │   └── index.ts (Clean exports)
│   └── settings/ (BusinessHours, Vacation, BookingRules)
├── types/
│   ├── calendar.ts (Month Grid types and day status system)
│   └── timeline.ts (Timeline types, slots, appointments, touch config)
├── utils/
│   ├── calendarUtils.ts (Month data generation + business logic)
│   └── timelineUtils.ts (Timeline generation + time calculations)
└── hooks/
    └── useAppointmentCalendar.ts (Unified state management)

// ❌ REMOVED: Legacy components (clean)
- AgendaView.tsx (removed)
- SimpleWeekView.tsx (removed)
- Old calendar widget (removed)

// 🔄 NEXT: Simplified Booking Dialog
src/modules/appointments/components/dialogs/QuickBookingDialog.tsx
```

---

**Total Estimated Development Time: 3-4 weeks**
**Priority: High (Core business functionality)**
**Current Status: Phase 1 Complete ✅ | Phase 2.1 In Progress 🔄**