# 📅 Phase 3: Appointment/Booking System - Comprehensive Analysis & Design

> **Status:** Planning & Analysis Complete  
> **Target:** Q1 2025 Implementation  
> **Context:** Lia Hair POS - Multi-tenant Hair Salon Management System  
> **Philosophy:** "Clean und simpel halten" - sauber und clean funktionieren

---

## 🎯 **Business Requirements & Vision**

### **Core Goal**
Create an appointment booking system where the hairdresser has "perfekten Überblick über seine Termine" and can "einfach neue aufnehmen kann und/oder anpassen" - perfect overview of appointments with easy creation and modification.

### **Key Requirements**
- **Clean & Simple**: Maintain existing app's clean, minimal design philosophy
- **Mobile-First**: Hairdresser must manage appointments on-the-go
- **Real-Time**: Immediate updates when appointments change
- **Integrated**: Seamless connection with existing customers and services
- **Conflict-Free**: Prevent overlapping appointments automatically
- **Swiss-Centric**: Proper timezone handling and Swiss business practices

---

## 🌍 **Industry Research & Best Practices**

### **Leading Salon Booking Platforms (2024)**
Based on comprehensive market research:

**Top Performers:**
- **Mangomint**: "Most impeccably designed platform" with intuitive UX
- **Boulevard**: Mobile-first approach with real-time availability
- **GlossGenius**: Minimalistic design with personalized recommendations
- **Fresha**: Strong mobile adoption with seamless booking flow

**Key Industry Trends:**
- **Mobile-First Design**: 70% of beauty professionals use mobile apps
- **AI-Powered Scheduling**: Pattern recognition for optimal time slots
- **Personalization**: Customer history and preference tracking
- **Real-Time Availability**: Live calendar integration prevents double bookings
- **Minimalistic UI**: Clean interfaces improve conversion rates by 200-400%

### **React Calendar Component Leaders**
- **Mobiscroll**: Professional appointment booking with responsive design
- **Syncfusion Scheduler**: Full-featured with drag & drop rescheduling
- **DevExtreme Reactive**: Customizable appointments with iCalendar support
- **Custom Solutions**: Tailwind CSS + React for perfect brand integration

---

## 🏗️ **Technical Architecture**

### **Database Schema Design**

```sql
-- Core appointments table following existing multi-tenant patterns
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timing & Duration
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Customer (Optional for walk-ins)
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT, -- Fallback for walk-ins
    customer_phone TEXT, -- Quick contact for walk-ins
    
    -- Service & Staff
    stylist_user_id UUID NOT NULL REFERENCES organization_users(user_id),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    
    -- Status & Workflow
    status TEXT NOT NULL DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    estimated_price DECIMAL(10,2),
    final_price DECIMAL(10,2), -- Set when completed
    
    -- Notes & Communication
    notes TEXT,
    internal_notes TEXT, -- Staff-only
    reminder_sent BOOLEAN DEFAULT FALSE,
    
    -- Integration Points
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL, -- Link to completed sale
    
    -- Multi-tenant & Audit (following existing patterns)
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Business Rule Constraints
    CONSTRAINT valid_time_range CHECK (end_datetime > start_datetime),
    CONSTRAINT valid_price_range CHECK (estimated_price IS NULL OR estimated_price >= 0)
);

-- Critical Performance Indexes
CREATE INDEX idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX idx_appointments_stylist_date ON appointments(stylist_user_id, start_datetime);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_appointments_date_range ON appointments(start_datetime, end_datetime);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Conflict Prevention (PostgreSQL Exclusion Constraint)
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE appointments ADD CONSTRAINT appointments_no_stylist_overlap 
    EXCLUDE USING gist (
        stylist_user_id WITH =,
        organization_id WITH =,
        tsrange(start_datetime, end_datetime) WITH &&
    ) WHERE (status NOT IN ('cancelled', 'no_show'));

-- Row Level Security (following existing patterns)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_organization_policy" ON appointments
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );
```

### **Service Layer Architecture**

Following existing `itemsService.ts` patterns:

```typescript
// src/shared/services/appointmentService.ts
export interface Appointment {
  id: string;
  start_datetime: string;
  end_datetime: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  stylist_user_id: string;
  item_id: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  estimated_price?: number;
  final_price?: number;
  notes?: string;
  internal_notes?: string;
  reminder_sent: boolean;
  sale_id?: string;
  organization_id: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

// Core CRUD Operations (following itemsService pattern)
export async function getAppointments(organizationId: string, dateRange?: DateRange): Promise<Appointment[]>
export async function createAppointment(data: AppointmentInsert, organizationId: string): Promise<AppointmentMutationResult>
export async function updateAppointment(data: AppointmentUpdate, organizationId: string): Promise<AppointmentMutationResult>
export async function cancelAppointment(appointmentId: string, reason: string, organizationId: string): Promise<AppointmentMutationResult>

// Scheduling-Specific Operations
export async function getAvailableSlots(
  organizationId: string,
  stylistUserId: string,
  date: Date,
  serviceDuration: number
): Promise<TimeSlot[]>

export async function checkAppointmentConflicts(
  organizationId: string,
  stylistUserId: string,
  startDateTime: Date,
  endDateTime: Date,
  excludeAppointmentId?: string
): Promise<ConflictCheckResult>

export async function rescheduleAppointment(
  appointmentId: string,
  newStartDateTime: Date,
  organizationId: string
): Promise<AppointmentMutationResult>

export async function completeAppointmentWithSale(
  appointmentId: string,
  saleData: CreateSaleData,
  organizationId: string
): Promise<{ success: boolean; sale?: Sale; appointment?: Appointment; error?: string }>
```

### **React Query Integration**

Extending existing query key structure:

```typescript
// src/shared/lib/react-query/queryKeys.ts
business: {
  // ... existing keys
  
  appointments: {
    all: (orgId: string) => [...queryKeys.business.all(orgId), 'appointments'] as const,
    lists: (orgId: string) => [...queryKeys.business.appointments.all(orgId), 'list'] as const,
    
    // Calendar views with different caching strategies
    calendar: (orgId: string, view: 'day' | 'week' | 'month', date: string) => [
      ...queryKeys.business.appointments.lists(orgId), 'calendar', view, date
    ] as const,
    
    // Real-time availability checking
    availableSlots: (orgId: string, stylistId: string, date: string, duration: number) => [
      ...queryKeys.business.appointments.all(orgId), 'available-slots', stylistId, date, duration
    ] as const,
    
    // Customer appointment history
    customerHistory: (orgId: string, customerId: string) => [
      ...queryKeys.business.customers.detail(orgId, customerId), 'appointments'
    ] as const,
  },
}
```

### **Real-Time Considerations**

```typescript
// Optimistic locking for concurrent bookings
export async function createAppointmentWithConflictCheck(
  appointmentData: AppointmentInsert,
  organizationId: string
): Promise<{ success: boolean; appointment?: Appointment; conflicts?: ConflictInfo[]; error?: string }> {
  // Use database function for atomic conflict checking
  const { data, error } = await supabase.rpc('create_appointment_with_conflict_check', {
    p_organization_id: organizationId,
    p_appointment_data: appointmentData
  })
  
  if (error?.code === 'P0001') { // Custom conflict error
    return { success: false, error: 'Terminkonflikt: Der gewählte Zeitraum ist bereits belegt.' }
  }
  
  return { success: true, appointment: data }
}

// Real-time subscription for calendar updates
export function useAppointmentRealtime(organizationId: string) {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('appointments_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `organization_id=eq.${organizationId}`
      }, (payload) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.business.appointments.all(organizationId)
        })
        
        if (payload.eventType === 'UPDATE' && payload.new.status === 'cancelled') {
          toast.info('Ein Termin wurde geändert und der Kalender wurde aktualisiert.')
        }
      })
      .subscribe()
      
    return () => supabase.removeChannel(channel)
  }, [organizationId, queryClient])
}
```

---

## 🎨 **UI/UX Design Strategy**

### **Design Philosophy**
Following existing app patterns:
- **Mobile-First**: Primary interface for touch devices
- **Clean & Minimal**: Consistent with existing POS design
- **Shadcn/UI**: Leverage existing component library
- **Tailwind CSS**: Consistent styling patterns
- **Responsive**: Desktop enhancements without mobile compromise

### **Calendar View Hierarchy**

```typescript
enum CalendarView {
  AGENDA = 'agenda',    // Mobile primary - List view
  DAY = 'day',         // Mobile secondary - Single day grid
  WEEK = 'week',       // Desktop primary - 7-day overview
  MONTH = 'month'      // Desktop overview - Month calendar
}
```

### **Mobile-First Calendar Design**

**Agenda View (Mobile Primary):**
```typescript
const AgendaView = () => {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {appointmentsByDate.map(({ date, appointments }) => (
          <div key={date} className="space-y-2">
            {/* Sticky date header */}
            <div className="sticky top-0 bg-background py-2 text-sm font-medium text-muted-foreground">
              {format(parseISO(date), 'EEEE, dd. MMMM', { locale: de })}
            </div>
            
            {/* Appointment cards */}
            {appointments.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground">
                Keine Termine
              </Card>
            ) : (
              appointments.map(appointment => (
                <AppointmentCard 
                  key={appointment.id}
                  appointment={appointment}
                  variant="mobile-list"
                />
              ))
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
```

**Desktop Week View:**
```typescript
const WeekView = () => {
  return (
    <div className="hidden md:grid md:grid-cols-8 h-full">
      {/* Time column */}
      <div className="border-r border-gray-200">
        {timeSlots.map(time => (
          <div key={time} className="h-16 border-b border-gray-100 text-xs text-gray-500 p-2">
            {format(time, 'HH:mm')}
          </div>
        ))}
      </div>
      
      {/* Day columns */}
      {weekDays.map(day => (
        <div key={day.toISOString()} className="border-r border-gray-200">
          <DayHeader date={day} />
          <div className="relative">
            {getAppointmentsForDay(day).map(appointment => (
              <AppointmentBlock 
                key={appointment.id}
                appointment={appointment}
                onDragStart={() => handleDragStart(appointment)}
                onEdit={() => openEditDialog(appointment)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### **Appointment Management Flow**

**Multi-Step Creation (Mobile-Optimized):**
```typescript
const AppointmentCreateDialog = () => {
  const [step, setStep] = useState<'service' | 'customer' | 'time' | 'confirm'>('service')
  
  const steps = [
    { key: 'service', title: 'Service wählen', component: ServiceSelectionStep },
    { key: 'customer', title: 'Kunde auswählen', component: CustomerSelectionStep },
    { key: 'time', title: 'Zeit wählen', component: TimeSelectionStep },
    { key: 'confirm', title: 'Bestätigen', component: ConfirmationStep }
  ]
  
  return (
    <Dialog>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Neuen Termin erstellen</DialogTitle>
          {/* Progress indicator */}
          <div className="flex space-x-2 mt-2">
            {steps.map((s, i) => (
              <div 
                key={s.key}
                className={cn(
                  "flex-1 h-1 rounded transition-colors",
                  i <= steps.findIndex(s => s.key === step) 
                    ? "bg-primary" 
                    : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {steps.find(s => s.key === step)?.component()}
        </div>
        
        <DialogFooter className="shrink-0">
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            disabled={step === 'service'}
          >
            Zurück
          </Button>
          <Button onClick={goToNextStep}>
            {step === 'confirm' ? 'Termin erstellen' : 'Weiter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### **Appointment Card Design**

```typescript
const AppointmentCard = ({ appointment, variant = 'card' }: AppointmentCardProps) => {
  return (
    <Card className={cn(
      "relative group transition-all hover:shadow-md cursor-pointer",
      appointment.status === 'completed' && "bg-green-50 border-green-200",
      appointment.status === 'cancelled' && "bg-gray-50 border-gray-200 opacity-75",
      appointment.status === 'no_show' && "bg-red-50 border-red-200"
    )}>
      <CardContent className="p-3">
        {/* Customer & Service Info */}
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">
              {appointment.customer?.name || appointment.customer_name || 'Walk-in'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {appointment.service.name}
            </div>
            {appointment.customer_phone && (
              <div className="text-xs text-muted-foreground font-mono">
                {appointment.customer_phone}
              </div>
            )}
          </div>
          
          <div className="text-right ml-2">
            <div className="text-sm font-mono">
              {format(parseISO(appointment.start_datetime), 'HH:mm')} - 
              {format(parseISO(appointment.end_datetime), 'HH:mm')}
            </div>
            <Badge variant={getStatusVariant(appointment.status)}>
              {getStatusLabel(appointment.status)}
            </Badge>
          </div>
        </div>
        
        {/* Notes preview */}
        {appointment.notes && (
          <div className="text-xs text-muted-foreground truncate mb-2">
            💬 {appointment.notes}
          </div>
        )}
        
        {/* Quick Actions - appear on hover/tap */}
        <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs text-muted-foreground">
            {appointment.estimated_price && `CHF ${appointment.estimated_price.toFixed(2)}`}
          </div>
          
          <div className="flex space-x-1">
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEditDialog(appointment) }}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); rescheduleAppointment(appointment) }}>
              <Calendar className="h-3 w-3" />
            </Button>
            {appointment.status === 'scheduled' && (
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); markCompleted(appointment) }}>
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); cancelAppointment(appointment) }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🔗 **Integration Strategy**

### **Existing System Integration Points**

**Customer Management:**
- Reuse existing `customers` table and `useCustomers` hook
- Leverage `CustomerAutocomplete` component for selection
- Integrate with customer history and notes system

**Service Management:**
- Extend existing `items` table (already has `duration_minutes`, `requires_booking` from Phase 2)
- Filter services with `type: 'service'` and `requires_booking: true`
- Reuse existing service validation logic

**Organization & Staff:**
- Use existing `organization_users` with `role: 'staff'`
- Leverage current multi-tenant security patterns
- Integrate with existing team management

**Date & Time Utilities:**
- Extend existing `dateUtils.ts` for Swiss timezone handling
- Add appointment-specific time calculation functions
- Maintain consistent date formatting across app

### **File Structure Integration**

```
src/
├── modules/
│   ├── appointments/                    # 🆕 NEW MODULE
│   │   ├── components/
│   │   │   ├── AppointmentsPage.tsx           # Main calendar interface
│   │   │   ├── calendar/
│   │   │   │   ├── CalendarContainer.tsx      # Responsive calendar wrapper
│   │   │   │   ├── AgendaView.tsx            # Mobile list view
│   │   │   │   ├── DayView.tsx               # Mobile day view
│   │   │   │   ├── WeekView.tsx              # Desktop week grid
│   │   │   │   └── MonthView.tsx             # Desktop month overview
│   │   │   ├── appointment/
│   │   │   │   ├── AppointmentCard.tsx        # Appointment display
│   │   │   │   ├── AppointmentCreateDialog.tsx # Multi-step creation
│   │   │   │   ├── AppointmentEditDialog.tsx  # Edit appointment
│   │   │   │   └── AppointmentDetailsSheet.tsx # Mobile details view
│   │   │   └── shared/
│   │   │       ├── TimeSlotPicker.tsx        # Available time selection
│   │   │       ├── ServiceSelector.tsx       # Service selection (reuse existing)
│   │   │       └── AppointmentStatus.tsx     # Status indicators
│   │   ├── hooks/
│   │   │   ├── useAppointments.ts            # Main appointments hook
│   │   │   ├── useAvailableSlots.ts          # Time slot availability
│   │   │   ├── useAppointmentActions.ts      # CRUD operations
│   │   │   ├── useCalendarState.ts           # Calendar navigation
│   │   │   └── useAppointmentRealtime.ts     # Real-time updates
│   │   └── index.ts
│   ├── products/                        # ✅ EXISTING - Service integration
│   ├── customers/                       # ✅ EXISTING - Customer integration
│   └── pos/                            # ✅ EXISTING - POS integration
├── shared/
│   ├── services/
│   │   ├── appointmentService.ts             # 🆕 NEW - Core appointment logic
│   │   ├── itemsService.ts                   # ✅ EXISTING - Service management
│   │   └── customerService.ts                # ✅ EXISTING - Customer management
│   ├── hooks/business/
│   │   ├── useAppointments.ts                # 🆕 NEW - Appointment queries
│   │   ├── useItems.ts                       # ✅ EXISTING - Service queries
│   │   └── useCustomers.ts                   # ✅ EXISTING - Customer queries
│   ├── utils/
│   │   └── dateUtils.ts                      # 🔄 ENHANCED - Appointment utilities
│   └── lib/react-query/
│       └── queryKeys.ts                      # 🔄 ENHANCED - Appointment keys
└── app/org/[slug]/
    └── appointments/                         # 🆕 NEW ROUTES
        ├── page.tsx                          # Calendar page
        ├── [id]/page.tsx                     # Appointment detail
        └── new/page.tsx                      # Create appointment
```

### **Navigation Integration**

```typescript
// src/shared/components/layout/app-sidebar.tsx
const navItemsTemplate = [
  { name: "Dashboard", path: "/dashboard", icon: BarChart4 },
  { name: "Verkauf", path: "/pos", icon: ShoppingCart },
  { name: "Termine", path: "/appointments", icon: Calendar }, // 🆕 NEW
  { name: "Banking", path: "/banking", icon: CreditCard },
  { name: "Transaktionen", path: "/transactions", icon: FileText },
  { name: "Kassenbuch", path: "/cash-register", icon: BookOpen },
  { name: "Produkte", path: "/products", icon: Package },  
  { name: "Kunden", path: "/customers", icon: Users },  
  { name: "Ausgaben", path: "/expenses", icon: FileIcon },
  { name: "Einstellungen", path: "/settings", icon: Settings },
]
```

---

## ⚡ **Performance & Scalability**

### **Database Optimization**

```sql
-- Performance-critical indexes
CREATE INDEX idx_appointments_calendar_query ON appointments(
    organization_id, 
    stylist_user_id, 
    start_datetime, 
    status
) WHERE status NOT IN ('cancelled', 'no_show');

-- Partial index for active appointments only
CREATE INDEX idx_appointments_active_range ON appointments(start_datetime, end_datetime) 
WHERE status IN ('scheduled', 'confirmed', 'in_progress');

-- Customer appointment history
CREATE INDEX idx_appointments_customer_history ON appointments(customer_id, start_datetime DESC) 
WHERE customer_id IS NOT NULL;
```

### **React Query Caching Strategy**

```typescript
// Optimized caching with different strategies per data type
export const useAppointmentsCalendar = (
  organizationId: string,
  view: 'day' | 'week' | 'month',
  date: Date
) => {
  const dateStr = format(date, 'yyyy-MM-dd')
  
  return useQuery({
    queryKey: queryKeys.business.appointments.calendar(organizationId, view, dateStr),
    queryFn: () => getAppointmentsForCalendarView(organizationId, view, date),
    staleTime: view === 'day' ? 30 * 1000 : 5 * 60 * 1000, // Day: 30s, others: 5min
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: view === 'day' ? 60 * 1000 : undefined, // Auto-refresh day view
  })
}

// High-frequency availability checking with shorter cache
export const useAvailableSlots = (
  organizationId: string,
  stylistId: string,
  date: Date,
  serviceDuration: number
) => {
  return useQuery({
    queryKey: queryKeys.business.appointments.availableSlots(
      organizationId, stylistId, format(date, 'yyyy-MM-dd'), serviceDuration
    ),
    queryFn: () => getAvailableTimeSlots(organizationId, stylistId, date, serviceDuration),
    staleTime: 15 * 1000, // 15 seconds for real-time feel
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!stylistId && serviceDuration > 0,
  })
}
```

### **Optimistic Updates Pattern**

```typescript
// Optimistic appointment creation following useItems pattern
const createAppointmentMutation = useMutation({
  mutationFn: async (newAppointment: AppointmentInsert) => {
    return createAppointment(newAppointment, organizationId!)
  },
  
  onMutate: async (newAppointment) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({
      queryKey: queryKeys.business.appointments.lists(organizationId!)
    })
    
    // Snapshot the previous value
    const previousAppointments = queryClient.getQueryData(
      queryKeys.business.appointments.list(organizationId!)
    )
    
    // Optimistically update to the new value
    queryClient.setQueryData(
      queryKeys.business.appointments.list(organizationId!),
      (old: Appointment[] = []) => [...old, {
        ...newAppointment,
        id: 'temp-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Appointment]
    )
    
    return { previousAppointments }
  },
  
  onError: (err, newAppointment, context) => {
    // Rollback on error
    if (context?.previousAppointments) {
      queryClient.setQueryData(
        queryKeys.business.appointments.list(organizationId!),
        context.previousAppointments
      )
    }
    toast.error('Fehler beim Erstellen des Termins')
  },
  
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({
      queryKey: queryKeys.business.appointments.all(organizationId!)
    })
  }
})
```

---

## 🔄 **Business Logic & Workflows**

### **Appointment Lifecycle**

```typescript
enum AppointmentStatus {
  SCHEDULED = 'scheduled',     // Initial state
  CONFIRMED = 'confirmed',     // Customer confirmed (future feature)
  IN_PROGRESS = 'in_progress', // Service started
  COMPLETED = 'completed',     // Service finished, potentially linked to sale
  CANCELLED = 'cancelled',     // Cancelled by customer or salon
  NO_SHOW = 'no_show'         // Customer didn't appear
}

// Status transition rules
const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.SCHEDULED]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW
  ],
  [AppointmentStatus.IN_PROGRESS]: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED
  ],
  [AppointmentStatus.COMPLETED]: [], // Final state
  [AppointmentStatus.CANCELLED]: [], // Final state
  [AppointmentStatus.NO_SHOW]: []   // Final state
}
```

### **Time Slot Calculation**

```typescript
// Enhanced service duration calculation integrating Phase 2 data
export function calculateAppointmentSlots(
  workingHours: { start: string; end: string },
  existingAppointments: Appointment[],
  service: ServiceWithBooking,
  date: Date,
  slotInterval: number = 15 // 15-minute intervals
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const startTime = parseTime(workingHours.start)
  const endTime = parseTime(workingHours.end)
  
  // Service duration + buffer time from Phase 2
  const serviceDuration = service.duration_minutes
  const bufferTime = service.booking_buffer_minutes || 0
  const totalBlockedTime = serviceDuration + bufferTime
  
  let currentTime = startTime
  
  while (addMinutes(currentTime, serviceDuration) <= endTime) {
    const slotStart = currentTime
    const slotEnd = addMinutes(currentTime, serviceDuration)
    const bufferEnd = addMinutes(slotEnd, bufferTime)
    
    // Check for conflicts with existing appointments
    const hasConflict = existingAppointments.some(apt => {
      const aptStart = parseISO(apt.start_datetime)
      const aptEnd = parseISO(apt.end_datetime)
      
      // Check if slot overlaps with any existing appointment
      return isTimeOverlapping(slotStart, bufferEnd, aptStart, aptEnd)
    })
    
    slots.push({
      start: slotStart,
      end: slotEnd,
      available: !hasConflict,
      service: service,
      bufferEnd,
      displayText: format(slotStart, 'HH:mm')
    })
    
    // Move to next slot
    currentTime = addMinutes(currentTime, slotInterval)
  }
  
  return slots
}

// Smart conflict detection considering buffer times
function isTimeOverlapping(
  slot1Start: Date, slot1End: Date,
  slot2Start: Date, slot2End: Date
): boolean {
  return slot1Start < slot2End && slot2Start < slot1End
}
```

### **Customer Integration Workflows**

```typescript
// Enhanced customer service with appointment integration
export async function getCustomerFullProfile(
  customerId: string,
  organizationId: string
): Promise<CustomerFullProfile> {
  const [customer, appointments, sales] = await Promise.all([
    getCustomerWithNotes(customerId, organizationId),
    getCustomerAppointments(customerId, organizationId),
    getCustomerSales(customerId, organizationId)
  ])
  
  if (!customer) {
    throw new Error('Kunde nicht gefunden')
  }
  
  // Calculate customer analytics
  const completedAppointments = appointments.filter(apt => apt.status === 'completed')
  const totalSpent = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const avgAppointmentValue = completedAppointments.length > 0 
    ? totalSpent / completedAppointments.length 
    : 0
  
  const lastVisit = completedAppointments.length > 0
    ? new Date(Math.max(...completedAppointments.map(apt => new Date(apt.end_datetime).getTime())))
    : null
    
  const nextAppointment = appointments
    .filter(apt => apt.status === 'scheduled' && new Date(apt.start_datetime) > new Date())
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())[0] || null
  
  // Analyze appointment patterns
  const preferredServices = getPreferredServices(completedAppointments)
  const appointmentFrequency = calculateAppointmentFrequency(completedAppointments)
  const preferredTimeSlots = analyzePreferredTimeSlots(completedAppointments)
  
  return {
    customer,
    appointments,
    sales,
    analytics: {
      totalSpent,
      avgAppointmentValue,
      lastVisit,
      nextAppointment,
      preferredServices,
      appointmentFrequency,
      preferredTimeSlots,
      loyaltyScore: calculateLoyaltyScore(customer, appointments, sales)
    }
  }
}
```

---

## 🌐 **Advanced Features & Future Enhancements**

### **Phase 3.1: Core Implementation**
- Basic appointment CRUD operations
- Calendar views (agenda, day, week)
- Conflict detection and prevention
- Customer and service integration

### **Phase 3.2: Enhanced UX**
- Drag & drop rescheduling
- Quick appointment actions
- Real-time calendar updates
- Mobile gesture support

### **Phase 3.3: Business Intelligence**
- Appointment analytics and reporting
- Customer behavior insights
- Service popularity analysis
- Staff utilization metrics

### **Phase 3.4: Advanced Scheduling**
- Recurring appointments
- Appointment templates
- Automatic reminders (SMS/Email)
- Waitlist management

### **Phase 4 Preparation: Multi-Staff Support**
- Staff availability management
- Multiple stylists per organization
- Staff-specific calendar views
- Team scheduling optimization

### **Future Integrations**
- Online booking widget for customers
- Calendar sync (Google Calendar, Outlook)
- Mobile app for customers
- Advanced notification system

---

## 🧪 **Testing Strategy**

### **Unit Testing**
- Appointment service functions
- Time slot calculation logic
- Conflict detection algorithms
- Date utility functions

### **Integration Testing**
- Database constraint enforcement
- React Query cache invalidation
- Real-time subscription handling
- Multi-tenant data isolation

### **End-to-End Testing**
- Complete appointment creation flow
- Calendar navigation and view switching
- Concurrent booking scenarios
- Mobile responsive behavior

### **Performance Testing**
- Calendar loading with large datasets
- Real-time update performance
- Optimistic update rollback scenarios
- Database query optimization validation

---

## 📊 **Success Metrics & KPIs**

### **Technical Performance**
- Calendar load time: < 1 second
- Appointment creation: < 3 seconds
- Real-time update latency: < 500ms
- Mobile responsiveness: 100% touch targets ≥ 44px

### **Business Impact**
- Staff adoption rate: > 95%
- Appointment conflicts: < 1% of bookings
- Customer satisfaction: Improved booking experience
- Time savings: 50% reduction in manual scheduling

### **User Experience**
- Task completion rate: > 90%
- Error recovery: < 5% failed operations
- Mobile usability: Seamless touch interactions
- Learning curve: < 30 minutes to proficiency

---

## 🛠️ **Implementation Roadmap**

### **Week 1-2: Foundation**
- Database schema implementation
- Core service layer development
- Basic TypeScript type definitions
- Authentication and security setup

### **Week 3-4: Data Layer**
- React Query integration
- Hook development following existing patterns
- Real-time subscription implementation
- Cache optimization strategies

### **Week 5-7: User Interface**
- Calendar component development
- Appointment management dialogs
- Mobile-responsive design implementation
- Integration with existing UI components

### **Week 8-9: Integration**
- Customer and service integration
- POS system connection points
- Existing component reuse
- Navigation and routing setup

### **Week 10-11: Testing & Polish**
- Comprehensive testing implementation
- Performance optimization
- Edge case handling
- User experience refinement

### **Week 12: Deployment**
- Production deployment
- Staff training and documentation
- Monitoring and analytics setup
- Feedback collection and iteration

---

## 🎯 **Conclusion**

This comprehensive appointment booking system design for Lia Hair POS provides:

✅ **Clean & Simple**: Maintains existing design philosophy while adding powerful scheduling capabilities

✅ **Mobile-First**: Primary interface optimized for touch devices with desktop enhancements

✅ **Integrated**: Seamless connection with existing customers, services, and POS system

✅ **Scalable**: Architecture that grows with business needs and future enhancements

✅ **Real-Time**: Live updates preventing conflicts and ensuring data consistency

✅ **Swiss-Focused**: Proper timezone handling and business practice alignment

The system delivers the "perfekten Überblick über seine Termine" while enabling the hairdresser to "einfach neue aufnehmen kann und/oder anpassen" through a clean, intuitive interface that scales from mobile to desktop.

By following established patterns and integrating deeply with existing systems, Phase 3 creates a comprehensive appointment management solution that feels like a natural extension of the existing POS application rather than a bolt-on feature.

**Ready for implementation with a clear technical roadmap and comprehensive design foundation.**