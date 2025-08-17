// =====================================================
// Bank Matching Service - Tab 2 Logic
// =====================================================
// Intelligent matching between Bank Transactions and Available Items
// Handles single matches, combinations, bulk detection, and provider summaries

import type { AvailableForBankMatching, UnmatchedBankTransaction } from '../types/banking'
import { intelligentMatchingService } from './intelligentMatching'
import type {
  BankMatchCandidate,
  BankMatchSuggestion,
  BankMatchType,
  BulkDetectionResult,
  MatchingConfig,
  MatchingServiceResult,
  ProviderSummary,
  ProviderSummaryDashboard,
} from './matchingTypes'
import { DEFAULT_MATCHING_CONFIG } from './matchingTypes'

// =====================================================
// BANK MATCHING SERVICE
// =====================================================

export class BankMatchingService {
  private config: MatchingConfig
  private matchingCore = intelligentMatchingService

  constructor(config: MatchingConfig = DEFAULT_MATCHING_CONFIG) {
    this.config = config
  }

  // =====================================================
  // MAIN MATCHING FUNCTIONS
  // =====================================================

  async findBankMatches(
    bankTransaction: UnmatchedBankTransaction,
    availableItems: AvailableForBankMatching[]
  ): Promise<MatchingServiceResult<BankMatchSuggestion>> {
    try {
      this.matchingCore.startPerformanceTracking()

      const allCandidates: BankMatchCandidate[] = []
      let candidatesAnalyzed = 0

      // 1. Single exact matches
      const singleMatches = this.findSingleMatches(bankTransaction, availableItems)
      allCandidates.push(...singleMatches)
      candidatesAnalyzed += availableItems.length

      // 2. Provider bulk detection
      const bulkDetection = this.detectProviderBulk(bankTransaction, availableItems)
      if (bulkDetection.detected) {
        const bulkCandidates = this.createBulkCandidates(bankTransaction, bulkDetection)
        allCandidates.push(...bulkCandidates)
        candidatesAnalyzed += bulkCandidates.length
      }

      // 3. Combination matches (if no high-confidence single/bulk match found)
      const hasSafeMatch = allCandidates.some(
        (c) => c.confidence >= this.config.bank.topSuggestionThreshold
      )
      if (!hasSafeMatch) {
        const combinationMatches = this.findCombinationMatches(bankTransaction, availableItems)
        allCandidates.push(...combinationMatches)
        candidatesAnalyzed += combinationMatches.length
      }

      // Filter and sort candidates
      const filteredCandidates = allCandidates
        .filter((c) => c.confidence >= this.config.bank.showSuggestionThreshold)
        .sort((a, b) => b.confidence - a.confidence)

      // Take top candidates (max 10)
      const topCandidates = filteredCandidates.slice(0, 10)

      const suggestion: BankMatchSuggestion = {
        bankTransactionId: bankTransaction.id,
        topCandidates,
        bulkDetection: bulkDetection.detected
          ? {
              provider: bulkDetection.provider!,
              items: bulkDetection.items,
              totalAmount: bulkDetection.totalAmount,
              confidence: bulkDetection.confidence,
            }
          : undefined,
        summary: {
          bestConfidence: topCandidates.length > 0 ? topCandidates[0].confidence : 0,
          totalSuggestions: topCandidates.length,
          hasBulkMatch: bulkDetection.detected,
        },
      }

      const metrics = this.matchingCore.getPerformanceMetrics({
        candidatesAnalyzed,
        algorithmsUsed: ['single_matching', 'bulk_detection', 'combination_matching'],
      })

      return {
        success: true,
        data: suggestion,
        metrics,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'algorithm',
          message: `Bank matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
          timestamp: new Date(),
        },
      }
    }
  }

  // =====================================================
  // PROVIDER SUMMARY DASHBOARD
  // =====================================================

  async generateProviderSummary(
    availableItems: AvailableForBankMatching[]
  ): Promise<MatchingServiceResult<ProviderSummaryDashboard>> {
    try {
      this.matchingCore.startPerformanceTracking()

      const summaries: ProviderSummary[] = []

      // Group items by provider/type
      const groupedItems = this.groupItemsByProvider(availableItems)

      // TWINT items
      if (groupedItems.twint.length > 0) {
        summaries.push({
          provider: 'twint',
          displayName: 'TWINT',
          icon: '🟦',
          itemCount: groupedItems.twint.length,
          totalAmount: groupedItems.twint.reduce((sum, item) => sum + item.amount, 0),
          items: groupedItems.twint,
        })
      }

      // SumUp items
      if (groupedItems.sumup.length > 0) {
        summaries.push({
          provider: 'sumup',
          displayName: 'SumUp',
          icon: '🟧',
          itemCount: groupedItems.sumup.length,
          totalAmount: groupedItems.sumup.reduce((sum, item) => sum + item.amount, 0),
          items: groupedItems.sumup,
        })
      }

      // Cash movements
      if (groupedItems.cash.length > 0) {
        summaries.push({
          provider: 'cash',
          displayName: 'Cash',
          icon: '💰',
          itemCount: groupedItems.cash.length,
          totalAmount: groupedItems.cash.reduce((sum, item) => sum + item.amount, 0),
          items: groupedItems.cash,
        })
      }

      // Owner transactions
      if (groupedItems.owner.length > 0) {
        summaries.push({
          provider: 'owner',
          displayName: 'Owner',
          icon: '🏢',
          itemCount: groupedItems.owner.length,
          totalAmount: groupedItems.owner.reduce((sum, item) => sum + item.amount, 0),
          items: groupedItems.owner,
        })
      }

      const grandTotal = summaries.reduce((sum, summary) => sum + summary.totalAmount, 0)

      const dashboard: ProviderSummaryDashboard = {
        summaries,
        grandTotal,
        lastUpdated: new Date(),
      }

      const metrics = this.matchingCore.getPerformanceMetrics({
        candidatesAnalyzed: availableItems.length,
        algorithmsUsed: ['provider_grouping', 'summary_calculation'],
      })

      return {
        success: true,
        data: dashboard,
        metrics,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'algorithm',
          message: `Provider summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
          timestamp: new Date(),
        },
      }
    }
  }

  // =====================================================
  // SINGLE MATCH DETECTION
  // =====================================================

  private findSingleMatches(
    bankTransaction: UnmatchedBankTransaction,
    availableItems: AvailableForBankMatching[]
  ): BankMatchCandidate[] {
    const candidates: BankMatchCandidate[] = []

    for (const item of availableItems) {
      const candidate = this.analyzeSingleMatch(bankTransaction, item)

      if (candidate.confidence >= this.config.bank.showSuggestionThreshold) {
        candidates.push(candidate)
      }
    }

    return candidates
  }

  private analyzeSingleMatch(
    bankTransaction: UnmatchedBankTransaction,
    item: AvailableForBankMatching
  ): BankMatchCandidate {
    const scores = {
      amountAccuracy: 0,
      dateProximity: 0,
      descriptionMatch: 0,
      itemCountPenalty: 0,
    }

    // 1. Amount accuracy (70% weight)
    const amountAnalysis = this.matchingCore.analyzeAmountMatch(
      bankTransaction.amount,
      item.amount,
      this.config.bank.tolerances
    )
    scores.amountAccuracy = amountAnalysis.score

    // 2. Date proximity (20% weight)
    const dateAnalysis = this.matchingCore.analyzeDateMatch(
      bankTransaction.transaction_date,
      item.date
    )
    scores.dateProximity = dateAnalysis.score

    // 3. Description matching (10% weight)
    const descriptionAnalysis = this.matchingCore.analyzeDescriptionMatch(
      bankTransaction.description,
      item.description
    )
    scores.descriptionMatch = descriptionAnalysis.score

    // 4. No penalty for single items
    scores.itemCountPenalty = 0

    const confidence = this.matchingCore.calculateConfidence(scores, {
      amountAccuracy: this.config.bank.scores.amountAccuracyWeight,
      dateProximity: this.config.bank.scores.dateProximityWeight,
      descriptionMatch: this.config.bank.scores.descriptionMatchWeight,
    })

    const matchReasons = this.generateBankMatchReasons(
      scores,
      amountAnalysis,
      dateAnalysis,
      descriptionAnalysis
    )

    return {
      bankTransaction,
      matchedItems: [item],
      confidence,
      matchType: 'single',
      matchReasons,
      scores,
      details: {
        totalAmount: item.amount,
        amountDifference: amountAnalysis.difference,
        itemCount: 1,
        providerDetected: this.matchingCore.detectProvider(bankTransaction.description),
      },
    }
  }

  // =====================================================
  // BULK DETECTION
  // =====================================================

  private detectProviderBulk(
    bankTransaction: UnmatchedBankTransaction,
    availableItems: AvailableForBankMatching[]
  ): BulkDetectionResult {
    const detectedProvider = this.matchingCore.detectProvider(bankTransaction.description)

    if (!detectedProvider) {
      return {
        detected: false,
        confidence: 0,
        items: [],
        totalAmount: 0,
        amountDifference: 0,
        reasons: [],
      }
    }

    // Filter items by detected provider
    const providerItems = availableItems.filter((item) => {
      const itemDesc = item.description.toLowerCase()
      return itemDesc.includes(detectedProvider)
    })

    if (providerItems.length === 0) {
      return {
        detected: false,
        confidence: 0,
        items: [],
        totalAmount: 0,
        amountDifference: 0,
        reasons: [],
      }
    }

    // Try different combinations of provider items
    const bestCombination = this.findBestProviderCombination(
      bankTransaction.amount,
      providerItems,
      this.config.bank.tolerances.maxBulkItems,
      this.config.bank.tolerances.maxBulkTolerance
    )

    if (!bestCombination) {
      return {
        detected: false,
        confidence: 0,
        items: [],
        totalAmount: 0,
        amountDifference: 0,
        reasons: [],
      }
    }

    const confidence = this.calculateBulkConfidence(
      bankTransaction,
      bestCombination,
      detectedProvider
    )

    const reasons = [
      `✓ ${detectedProvider.toUpperCase()} Provider erkannt`,
      `✓ ${bestCombination.items.length} Items gefunden`,
      `✓ Summe: ${bestCombination.totalAmount.toFixed(2)} CHF`,
    ]

    if (bestCombination.amountDifference === 0) {
      reasons.push('✓ Exakte Summe')
    } else if (bestCombination.amountDifference <= 0.1) {
      reasons.push('✓ Summe sehr nah')
    }

    return {
      detected: confidence >= this.config.bank.bulkDetectionThreshold,
      provider: detectedProvider,
      confidence,
      items: bestCombination.items,
      totalAmount: bestCombination.totalAmount,
      amountDifference: bestCombination.amountDifference,
      reasons,
    }
  }

  private findBestProviderCombination(
    targetAmount: number,
    providerItems: AvailableForBankMatching[],
    maxItems: number,
    tolerance: number
  ) {
    const combinations = this.matchingCore.findBestCombinations(
      targetAmount,
      providerItems,
      maxItems,
      tolerance
    )

    return combinations.length > 0 ? combinations[0] : null
  }

  private calculateBulkConfidence(
    bankTransaction: UnmatchedBankTransaction,
    combination: any,
    provider: string
  ): number {
    let confidence = 60 // Base score for provider detection

    // Amount accuracy bonus
    if (combination.amountDifference === 0) {
      confidence += 30
    } else if (combination.amountDifference <= 0.1) {
      confidence += 25
    } else if (combination.amountDifference <= 1.0) {
      confidence += 15
    }

    // Item count consideration
    if (combination.itemCount >= 2 && combination.itemCount <= 5) {
      confidence += 10 // Sweet spot for bulk transactions
    } else if (combination.itemCount > 5) {
      confidence -= 5 // Slight penalty for very complex bulks
    }

    return Math.min(confidence, 100)
  }

  private createBulkCandidates(
    bankTransaction: UnmatchedBankTransaction,
    bulkDetection: BulkDetectionResult
  ): BankMatchCandidate[] {
    if (!bulkDetection.detected || !bulkDetection.provider) return []

    const candidate: BankMatchCandidate = {
      bankTransaction,
      matchedItems: bulkDetection.items,
      confidence: bulkDetection.confidence,
      matchType: 'provider_bulk',
      matchReasons: bulkDetection.reasons,
      scores: {
        amountAccuracy: bulkDetection.amountDifference <= 0.1 ? 90 : 70,
        dateProximity: 50, // Bulk transactions can span multiple days
        descriptionMatch: 80, // High since provider was detected
        itemCountPenalty: Math.max(0, (bulkDetection.items.length - 3) * -5),
      },
      details: {
        totalAmount: bulkDetection.totalAmount,
        amountDifference: bulkDetection.amountDifference,
        itemCount: bulkDetection.items.length,
        providerDetected: bulkDetection.provider,
      },
    }

    return [candidate]
  }

  // =====================================================
  // COMBINATION MATCHING
  // =====================================================

  private findCombinationMatches(
    bankTransaction: UnmatchedBankTransaction,
    availableItems: AvailableForBankMatching[]
  ): BankMatchCandidate[] {
    const candidates: BankMatchCandidate[] = []

    // Find best combinations using the core service
    const combinations = this.matchingCore.findBestCombinations(
      bankTransaction.amount,
      availableItems,
      this.config.bank.tolerances.maxItemsInCombination,
      this.config.bank.tolerances.maxAmountTolerance
    )

    // Convert top combinations to candidates
    for (const combination of combinations.slice(0, 5)) {
      // Top 5 combinations
      const candidate = this.createCombinationCandidate(bankTransaction, combination)

      if (candidate.confidence >= this.config.bank.showSuggestionThreshold) {
        candidates.push(candidate)
      }
    }

    return candidates
  }

  private createCombinationCandidate(
    bankTransaction: UnmatchedBankTransaction,
    combination: any
  ): BankMatchCandidate {
    const scores = {
      amountAccuracy: combination.score,
      dateProximity: this.calculateCombinationDateScore(bankTransaction, combination.items),
      descriptionMatch: 30, // Lower for combinations
      itemCountPenalty: Math.max(0, (combination.itemCount - 2) * -5),
    }

    const confidence = this.matchingCore.calculateConfidence(scores, {
      amountAccuracy: this.config.bank.scores.amountAccuracyWeight,
      dateProximity: this.config.bank.scores.dateProximityWeight,
      descriptionMatch: this.config.bank.scores.descriptionMatchWeight,
    })

    const matchReasons = [
      `⚡ Kombination aus ${combination.itemCount} Items`,
      `✓ Summe: ${combination.totalAmount.toFixed(2)} CHF`,
      combination.amountDifference === 0
        ? '✓ Exakte Summe'
        : `⚠ Diff: ${combination.amountDifference.toFixed(2)} CHF`,
    ]

    return {
      bankTransaction,
      matchedItems: combination.items,
      confidence,
      matchType: 'combination',
      matchReasons,
      scores,
      details: {
        totalAmount: combination.totalAmount,
        amountDifference: combination.amountDifference,
        itemCount: combination.itemCount,
        providerDetected: this.matchingCore.detectProvider(bankTransaction.description),
      },
    }
  }

  private calculateCombinationDateScore(
    bankTransaction: UnmatchedBankTransaction,
    items: AvailableForBankMatching[]
  ): number {
    const bankDate = new Date(bankTransaction.transaction_date)
    let totalScore = 0

    for (const item of items) {
      const dateAnalysis = this.matchingCore.analyzeDateMatch(bankDate, item.date)
      totalScore += dateAnalysis.score
    }

    return totalScore / items.length // Average date score
  }

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  private groupItemsByProvider(items: AvailableForBankMatching[]) {
    const groups = {
      twint: [] as AvailableForBankMatching[],
      sumup: [] as AvailableForBankMatching[],
      cash: [] as AvailableForBankMatching[],
      owner: [] as AvailableForBankMatching[],
      other: [] as AvailableForBankMatching[],
    }

    for (const item of items) {
      const desc = item.description.toLowerCase()

      if (desc.includes('twint')) {
        groups.twint.push(item)
      } else if (desc.includes('sumup')) {
        groups.sumup.push(item)
      } else if (item.item_type === 'cash_movement') {
        groups.cash.push(item)
      } else if (item.item_type === 'owner_transaction') {
        groups.owner.push(item)
      } else {
        groups.other.push(item)
      }
    }

    return groups
  }

  private generateBankMatchReasons(
    scores: any,
    amountAnalysis: any,
    dateAnalysis: any,
    descriptionAnalysis: any
  ): string[] {
    const reasons: string[] = []

    // Amount
    if (amountAnalysis.category === 'exact') {
      reasons.push('✓ Exakter Betrag')
    } else if (amountAnalysis.category === 'close') {
      reasons.push('✓ Betrag sehr nah')
    } else if (amountAnalysis.category === 'similar') {
      reasons.push('⚠ Betrag ähnlich')
    }

    // Date
    if (dateAnalysis.category === 'same_day') {
      reasons.push('✓ Gleicher Tag')
    } else if (dateAnalysis.category === 'next_day') {
      reasons.push('✓ Nächster Tag')
    }

    // Description
    if (descriptionAnalysis.providerDetected) {
      reasons.push('✓ Provider erkannt')
    }

    return reasons
  }

  // =====================================================
  // CONFIGURATION
  // =====================================================

  updateConfig(newConfig: Partial<MatchingConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.matchingCore.updateConfig(this.config)
  }

  getConfig(): MatchingConfig {
    return { ...this.config }
  }
}

// =====================================================
// EXPORT SINGLETON
// =====================================================

export const bankMatchingService = new BankMatchingService()
export default bankMatchingService
