// =====================================================
// Intelligent Banking Matching - Type Definitions
// =====================================================
// Shared interfaces for smart matching algorithms
// Used across provider and bank matching services

import type { 
  UnmatchedSaleForProvider,
  UnmatchedProviderReport,
  UnmatchedBankTransaction,
  AvailableForBankMatching
} from '../types/banking'

// =====================================================
// PROVIDER MATCHING TYPES (Tab 1)
// =====================================================

export interface ProviderMatchCandidate {
  sale: UnmatchedSaleForProvider
  providerReport: UnmatchedProviderReport
  confidence: number
  matchReasons: string[]
  scores: {
    providerMatch: number
    amountMatch: number
    dateMatch: number
  }
  details: {
    amountDifference: number
    daysDifference: number
    providerMatches: boolean
  }
}

export interface ProviderMatchResult {
  candidates: ProviderMatchCandidate[]
  autoMatchable: ProviderMatchCandidate[] // 95%+ confidence
  reviewRequired: ProviderMatchCandidate[] // <95% confidence
  summary: {
    totalCandidates: number
    autoMatchCount: number
    reviewCount: number
    highestConfidence: number
  }
}

export interface ProviderAutoMatchResult {
  success: boolean
  matchedPairs: number
  errors: string[]
  processedCandidates: ProviderMatchCandidate[]
}

// =====================================================
// BANK MATCHING TYPES (Tab 2)
// =====================================================

export type BankMatchType = 'single' | 'combination' | 'provider_bulk' | 'cash_transfer'

export interface BankMatchCandidate {
  bankTransaction: UnmatchedBankTransaction
  matchedItems: AvailableForBankMatching[]
  confidence: number
  matchType: BankMatchType
  matchReasons: string[]
  scores: {
    amountAccuracy: number
    dateProximity: number
    descriptionMatch: number
    itemCountPenalty: number
  }
  details: {
    totalAmount: number
    amountDifference: number
    itemCount: number
    providerDetected?: 'twint' | 'sumup' | null
  }
}

export interface BankMatchSuggestion {
  bankTransactionId: string
  topCandidates: BankMatchCandidate[]
  bulkDetection?: {
    provider: 'twint' | 'sumup'
    items: AvailableForBankMatching[]
    totalAmount: number
    confidence: number
  }
  summary: {
    bestConfidence: number
    totalSuggestions: number
    hasBulkMatch: boolean
  }
}

export interface ProviderSummary {
  provider: 'twint' | 'sumup' | 'cash' | 'owner'
  displayName: string
  icon: string
  itemCount: number
  totalAmount: number
  items: AvailableForBankMatching[]
}

export interface ProviderSummaryDashboard {
  summaries: ProviderSummary[]
  grandTotal: number
  lastUpdated: Date
}

// =====================================================
// MATCHING ALGORITHM CONFIGURATION
// =====================================================

export interface MatchingConfig {
  provider: {
    autoMatchThreshold: number // 95%
    highConfidenceThreshold: number // 80%
    mediumConfidenceThreshold: number // 60%
    scores: {
      providerMatchWeight: number // 60
      amountMatchWeight: number // 40
      dateMatchWeight: number // 20
    }
    tolerances: {
      exactAmountTolerance: number // 0.00
      closeAmountTolerance: number // 0.05
      maxAmountTolerance: number // 1.00
      maxDaysTolerance: number // 7
    }
  }
  bank: {
    showSuggestionThreshold: number // 50%
    topSuggestionThreshold: number // 70%
    bulkDetectionThreshold: number // 60%
    scores: {
      amountAccuracyWeight: number // 70
      dateProximityWeight: number // 20
      descriptionMatchWeight: number // 10
    }
    tolerances: {
      exactAmountTolerance: number // 0.00
      closeAmountTolerance: number // 0.05
      maxAmountTolerance: number // 1.00
      maxBulkTolerance: number // 2.00
      maxItemsInCombination: number // 5
      maxBulkItems: number // 10
    }
  }
}

// =====================================================
// ALGORITHM RESULT TYPES
// =====================================================

export interface MatchingPerformanceMetrics {
  processingTimeMs: number
  candidatesAnalyzed: number
  algorithmsUsed: string[]
  cacheHits?: number
  databaseQueries?: number
}

export interface MatchingError {
  type: 'validation' | 'algorithm' | 'database' | 'timeout'
  message: string
  details?: any
  timestamp: Date
}

export interface MatchingServiceResult<T> {
  success: boolean
  data?: T
  error?: MatchingError
  metrics?: MatchingPerformanceMetrics
}

// =====================================================
// SCORING HELPERS
// =====================================================

export interface AmountMatchAnalysis {
  difference: number
  category: 'exact' | 'close' | 'similar' | 'different'
  score: number
  tolerance: number
}

export interface DateMatchAnalysis {
  daysDifference: number
  category: 'same_day' | 'next_day' | 'same_week' | 'far'
  score: number
  saleDate: Date
  reportDate: Date
}

export interface DescriptionMatchAnalysis {
  keywords: string[]
  providerDetected: boolean
  score: number
  matchedTerms: string[]
}

// =====================================================
// BULK DETECTION TYPES
// =====================================================

export interface BulkDetectionResult {
  detected: boolean
  provider?: 'twint' | 'sumup'
  confidence: number
  items: AvailableForBankMatching[]
  totalAmount: number
  amountDifference: number
  reasons: string[]
}

export interface CombinationAnalysis {
  items: AvailableForBankMatching[]
  totalAmount: number
  amountDifference: number
  itemCount: number
  score: number
  feasible: boolean
}

// =====================================================
// DEFAULT CONFIGURATION
// =====================================================

export const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  provider: {
    autoMatchThreshold: 95,
    highConfidenceThreshold: 80,
    mediumConfidenceThreshold: 60,
    scores: {
      providerMatchWeight: 60,
      amountMatchWeight: 40,
      dateMatchWeight: 20
    },
    tolerances: {
      exactAmountTolerance: 0.00,
      closeAmountTolerance: 0.05,
      maxAmountTolerance: 1.00,
      maxDaysTolerance: 7
    }
  },
  bank: {
    showSuggestionThreshold: 50,
    topSuggestionThreshold: 70,
    bulkDetectionThreshold: 60,
    scores: {
      amountAccuracyWeight: 70,
      dateProximityWeight: 20,
      descriptionMatchWeight: 10
    },
    tolerances: {
      exactAmountTolerance: 0.00,
      closeAmountTolerance: 0.05,
      maxAmountTolerance: 1.00,
      maxBulkTolerance: 2.00,
      maxItemsInCombination: 5,
      maxBulkItems: 10
    }
  }
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type MatchingServiceName = 'provider' | 'bank' | 'intelligent'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'