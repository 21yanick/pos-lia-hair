# Intelligent Banking Matching System - Living Document
*Version: 1.0 | Last Updated: 06.01.2025*

## Overview & Current State

### Current Banking System
- **Location**: `/src/modules/banking/BankingPage.tsx`
- **Architecture**: 2-Tab System with manual click-to-connect matching
- **Database Views**: Uses 4 optimized views from `06_banking_system_rebuild.sql`

### Tab 1: Provider-Gebühren (Manual)
- **Left**: POS Sales (TWINT/SumUp) - `unmatched_sales_for_provider` 
- **Right**: Provider Reports - `unmatched_provider_reports`
- **Current Flow**: Click sale → Click provider → Manual match button
- **Problem**: 100% manual, time-consuming, no suggestions

### Tab 2: Bank-Abgleich (Manual Multi-Select)
- **Left**: Bank Transactions - `unmatched_bank_transactions`
- **Right**: Available Items - `available_for_bank_matching` 
- **Current Flow**: Click bank TX → Multi-select items → Manual match button
- **Problem**: No intelligent suggestions, hard to find combinations

## Target Improvements

### Tab 1: Smart Provider Matching with Auto-Match
**Goal**: Reduce 30-60min manual work to 5-10min with 90%+ automation

#### Algorithm: Provider Match Scoring
```
Confidence Score (0-100%):
├─ Provider Match (60pts): TWINT↔TWINT, SumUp↔SumUp (mandatory)
├─ Amount Match (40pts): Exact=40, ±5Rp=35, ±1CHF=20  
└─ Date Match (20pts): Same day=20, Next day=15, Week=10
```

#### UX Implementation - INLINE APPROACH ✅ COMPLETED
- **✅ Keep**: 2-column layout unchanged - no popups/dialogs
- **✅ Add**: Confidence badges directly in table rows (⚡96%, 🎯80%, ⚠️60%)
- **✅ Add**: Checkboxes for individual match control per row
- **✅ Add**: SVG connection lines between matched pairs
- **✅ Add**: Inline controls: "🧠 Intelligente Analyse" + "⚡ Auto-Match (N)"
- **✅ Behavior**: Matches appear and disappear directly in tables
- **✅ Result**: Transparent, visual, checkbox-controlled matching workflow

**Implementation**: `EnhancedProviderTables.tsx` + `ProviderMatchConnector.tsx`

### Tab 2: Intelligent Bank Matching (No Auto-Match)
**Goal**: Smart suggestions replace blind search, maintain user control

#### Algorithm: Bank Match Strategies
```
Match Types:
├─ Single Exact (70pts base): 1:1 amount matching
├─ Combinations (50pts base): 2-5 items totaling bank amount  
├─ Provider Bulk (60pts base): TWINT/SumUp batch settlements
└─ Cash Transfers (65pts base): Recognized cash movements

Scoring Factors:
├─ Amount Accuracy: Exact=max, ±5Rp=high, ±1CHF=medium
├─ Date Proximity: Same day=bonus, ±3days=neutral  
├─ Description Match: Provider keywords detected
└─ Item Count Penalty: More items = lower confidence
```

#### UX Design Specification

##### Provider Summen Dashboard (New - Top of Tab 2)
```
📊 Offene Provider-Summen
┌─────────────────────────────────────────┐
│ 🟦 TWINT:  3 Items = 1,247.80 CHF      │
│ 🟧 SumUp:  5 Items = 892.45 CHF        │  
│ 💰 Cash:   2 Items = 145.60 CHF        │
│ 🏢 Owner:  1 Item  = 500.00 CHF        │
└─────────────────────────────────────────┘
```

##### Intelligent Suggestions (New - Appears when bank TX selected)
```
🤖 Intelligente Vorschläge für: [Amount] [Description]

┌─ 📊 Bulk Detection (when applicable) ──────────┐
│ Provider: X Items = Exact Amount Match          │
│ [✓] Item 1 - Amount                            │
│ [✓] Item 2 - Amount                            │
│ Confidence: XX% [Bulk auswählen]               │
└─────────────────────────────────────────────────┘

┌─ Weitere Vorschläge ──────────────────────────  ┐
│ 🎯 Einzelmatch (XX%): Description - Amount     │
│ ⚡ Kombination (XX%): X Items = Amount         │  
└─────────────────────────────────────────────────┘
```

##### States & Behavior
- **No Selection**: Show provider sums + hint to select bank TX
- **Bank TX Selected**: Show intelligent suggestions + keep normal item list
- **Suggestion Click**: Auto-selects items in checkbox list below
- **Manual Override**: Users can still manually adjust selections

## Technical Implementation

### New Services Required
```
src/modules/banking/services/
├─ intelligentMatching.ts     # Core algorithms
├─ providerMatching.ts        # Tab 1 specific logic  
├─ bankMatching.ts           # Tab 2 specific logic
└─ matchingTypes.ts          # Shared interfaces
```

### API Extensions
```
Banking API additions:
├─ getProviderMatchSuggestions(salesIds, reportIds)
├─ getBankMatchSuggestions(bankTransactionId, availableItems)  
├─ getProviderSummaries() # For dashboard
└─ executeAutoProviderMatch() # Batch processing
```

### Database Requirements
- **Views**: Current 4 views sufficient (no changes needed)
- **Indexes**: Ensure performance on amount/date range queries
- **Functions**: Potentially add stored procedures for complex matching logic

### Component Updates - INLINE INTEGRATION ✅ COMPLETED
```
BankingPage.tsx modifications:
├─ ✅ REPLACE current provider tables with EnhancedProviderTables
├─ ✅ INTEGRATED ProviderMatchConnector for visual connections
├─ ✅ INTEGRATED InlineMatchControls (🧠 Analyse, ⚡ Auto-Match buttons)
├─ ✅ KEEP ProviderSummaryDashboard component (Tab 2) 
├─ ✅ KEEP BankMatchSuggestions component (Tab 2) 
└─ ✅ Preserve existing manual workflows
```

### IMPLEMENTED Inline Components
```
📁 src/modules/banking/components/intelligent/
├── EnhancedProviderTables.tsx         ✅ Complete tables with confidence & checkboxes
├── ProviderMatchConnector.tsx         ✅ SVG connection lines between matched pairs
└── [Integrated inline controls within EnhancedProviderTables]
```

## Success Criteria

### Performance Targets
- **Tab 1**: 90% of provider matches automated (95%+ confidence)
- **Tab 2**: 80% of bank matches suggested in top 3 results
- **Time Reduction**: 30-60min → 5-10min typical workflow
- **Accuracy**: 98%+ for auto-matched provider pairs

### User Experience Goals - INLINE FOCUS ✅ ACHIEVED
- **✅ Learning Curve**: Zero - familiar 2-column table interface
- **✅ No Dialogs**: All interactions happen inline in tables
- **✅ Checkbox Control**: Individual match selection like email clients
- **✅ Visual Feedback**: Confidence badges, SVG connection lines
- **✅ Immediate Results**: Matched rows disappear from tables instantly
- **✅ Manual Override**: Full control retained, analysis is optional

### Technical Requirements
- **Response Time**: <500ms for suggestion generation
- **Scalability**: Handle 100+ transactions per batch
- **Reliability**: Graceful degradation if suggestion engine fails
- **Maintainability**: Clear separation between manual and intelligent features

## Development Phases ✅ COMPLETED

### ✅ Phase 1: Backend Foundation 
- ✅ Create matching service layer (`intelligentMatching.ts`, `providerMatching.ts`, `bankMatching.ts`)
- ✅ Implement core algorithms (confidence scoring, match detection)
- ✅ Add API endpoints (`getProviderMatchSuggestions`, `executeAutoProviderMatch`)
- ✅ Type safety with complete TypeScript coverage

### ✅ Phase 2: UI Integration 
- ✅ Build suggestion components (`EnhancedProviderTables.tsx`)
- ✅ Integrate with existing BankingPage (seamless replacement)
- ✅ Add visual connection system (`ProviderMatchConnector.tsx`)
- ✅ Functional end-to-end matching workflow

### ✅ Phase 2.5: UX Enhancement
- ✅ SVG connection lines for visual clarity
- ✅ Theme-consistent color system
- ✅ Checkbox-based individual control
- ✅ Real-time match preview system

## Configuration & Tuning

### Confidence Thresholds
```
Provider Matching:
├─ Auto-Match Threshold: 95%
├─ High Confidence: 80-94% (green highlight)
├─ Medium Confidence: 60-79% (yellow highlight)  
└─ Low Confidence: <60% (no highlight)

Bank Matching:
├─ Top Suggestion: 70%+
├─ Show Suggestion: 50%+
└─ Bulk Detection: 60%+ (due to higher complexity)
```

### Business Rules
- **Provider Mismatch**: Immediate disqualification (0% confidence)
- **Amount Tolerance**: ±5Rp for exact, ±1CHF for combinations
- **Date Range**: ±7 days maximum consideration
- **Item Limit**: Max 5 items in combination matches
- **Bulk Priority**: Provider bulk detection takes precedence

## Monitoring & Metrics

### Key Performance Indicators
- **Match Accuracy Rate**: % of auto-matches confirmed correct
- **Time Savings**: Before/after workflow duration
- **User Adoption**: % using suggestions vs pure manual
- **Error Rate**: % of matches requiring correction
- **Suggestion Relevance**: % of top-3 suggestions selected

### Logging Requirements
- All match suggestions with confidence scores
- User acceptance/rejection of suggestions  
- Performance metrics (response times)
- Error cases and edge conditions

---
*This document should be updated after each implementation phase and major feature changes.*