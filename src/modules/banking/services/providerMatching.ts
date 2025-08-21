// =====================================================
// Provider Matching Service - Tab 1 Logic
// =====================================================
// Intelligent matching between POS Sales and Provider Reports
// Handles TWINT and SumUp transaction reconciliation

import type { UnmatchedProviderReport, UnmatchedSaleForProvider } from '../types/banking'
import { intelligentMatchingService } from './intelligentMatching'
import type {
  AmountMatchAnalysis,
  DateMatchAnalysis,
  MatchingConfig,
  MatchingServiceResult,
  ProviderAutoMatchResult,
  ProviderMatchCandidate,
  ProviderMatchResult,
} from './matchingTypes'
import { DEFAULT_MATCHING_CONFIG } from './matchingTypes'

// =====================================================
// PROVIDER MATCHING SERVICE
// =====================================================

export class ProviderMatchingService {
  private config: MatchingConfig
  private matchingCore = intelligentMatchingService

  constructor(config: MatchingConfig = DEFAULT_MATCHING_CONFIG) {
    this.config = config
  }

  // =====================================================
  // MAIN MATCHING FUNCTIONS
  // =====================================================

  async findProviderMatches(
    sales: UnmatchedSaleForProvider[],
    reports: UnmatchedProviderReport[]
  ): Promise<MatchingServiceResult<ProviderMatchResult>> {
    try {
      this.matchingCore.startPerformanceTracking()

      const candidates: ProviderMatchCandidate[] = []
      let candidatesAnalyzed = 0

      // Generate all possible matching candidates
      for (const sale of sales) {
        for (const report of reports) {
          const candidate = this.analyzeProviderMatch(sale, report)

          // Only include candidates with reasonable confidence
          if (candidate.confidence >= this.config.provider.mediumConfidenceThreshold) {
            candidates.push(candidate)
          }
          candidatesAnalyzed++
        }
      }

      // Sort by confidence (highest first)
      candidates.sort((a, b) => b.confidence - a.confidence)

      // Categorize candidates
      const autoMatchable = candidates.filter(
        (c) => c.confidence >= this.config.provider.autoMatchThreshold
      )

      const reviewRequired = candidates.filter(
        (c) =>
          c.confidence < this.config.provider.autoMatchThreshold &&
          c.confidence >= this.config.provider.mediumConfidenceThreshold
      )

      const result: ProviderMatchResult = {
        candidates,
        autoMatchable,
        reviewRequired,
        summary: {
          totalCandidates: candidates.length,
          autoMatchCount: autoMatchable.length,
          reviewCount: reviewRequired.length,
          highestConfidence: candidates.length > 0 ? candidates[0].confidence : 0,
        },
      }

      const metrics = this.matchingCore.getPerformanceMetrics({
        candidatesAnalyzed,
        algorithmsUsed: ['provider_matching', 'amount_analysis', 'date_analysis'],
      })

      return {
        success: true,
        data: result,
        metrics,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'algorithm',
          message: `Provider matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
          timestamp: new Date(),
        },
      }
    }
  }

  // =====================================================
  // SINGLE MATCH ANALYSIS
  // =====================================================

  analyzeProviderMatch(
    sale: UnmatchedSaleForProvider,
    report: UnmatchedProviderReport
  ): ProviderMatchCandidate {
    const scores = {
      providerMatch: 0,
      amountMatch: 0,
      dateMatch: 0,
    }

    const details = {
      amountDifference: 0,
      daysDifference: 0,
      providerMatches: false,
    }

    // 1. PROVIDER MATCH (Mandatory - 60 points)
    const providerMatches = sale.payment_method === report.provider
    if (providerMatches) {
      scores.providerMatch = 100
      details.providerMatches = true
    } else {
      // If provider doesn't match, immediately disqualify
      return this.createFailedCandidate(sale, report, 'Provider mismatch')
    }

    // 2. AMOUNT MATCH (40 points)
    const amountAnalysis = this.matchingCore.analyzeAmountMatch(
      sale.total_amount,
      report.gross_amount,
      this.config.provider.tolerances
    )

    scores.amountMatch = amountAnalysis.score
    details.amountDifference = amountAnalysis.difference

    // 3. DATE MATCH (20 points)
    const dateAnalysis = this.matchingCore.analyzeDateMatch(
      sale.created_at,
      report.transaction_date
    )

    scores.dateMatch = dateAnalysis.score
    details.daysDifference = dateAnalysis.daysDifference

    // 4. CALCULATE TOTAL CONFIDENCE
    const confidence = this.matchingCore.calculateConfidence(scores, {
      providerMatch: this.config.provider.scores.providerMatchWeight,
      amountMatch: this.config.provider.scores.amountMatchWeight,
      dateMatch: this.config.provider.scores.dateMatchWeight,
    })

    // 5. GENERATE MATCH REASONS
    const matchReasons = this.generateProviderMatchReasons(
      scores,
      details,
      amountAnalysis,
      dateAnalysis
    )

    return {
      sale,
      providerReport: report,
      confidence,
      matchReasons,
      scores,
      details,
    }
  }

  // =====================================================
  // AUTO-MATCH EXECUTION
  // =====================================================

  async executeAutoProviderMatch(
    candidates: ProviderMatchCandidate[]
  ): Promise<MatchingServiceResult<ProviderAutoMatchResult>> {
    try {
      this.matchingCore.startPerformanceTracking()

      // Filter to only high-confidence matches
      const autoMatchableCandidates = candidates.filter(
        (c) => c.confidence >= this.config.provider.autoMatchThreshold
      )

      // Remove conflicts (same sale or report matched multiple times)
      const finalCandidates = this.resolveMatchingConflicts(autoMatchableCandidates)

      let matchedPairs = 0
      const errors: string[] = []
      const processedCandidates: ProviderMatchCandidate[] = []

      // Execute matches sequentially to handle potential conflicts
      for (const candidate of finalCandidates) {
        try {
          // Here we would call the actual API to create the match
          // For now, we'll simulate the success
          const matchSuccess = true // await this.createProviderMatch(candidate)

          if (matchSuccess) {
            matchedPairs++
            processedCandidates.push(candidate)
          } else {
            errors.push(
              `Failed to match Sale ${candidate.sale.id} with Report ${candidate.providerReport.id}`
            )
          }
        } catch (error) {
          errors.push(
            `Error matching Sale ${candidate.sale.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        }
      }

      const result: ProviderAutoMatchResult = {
        success: errors.length === 0,
        matchedPairs,
        errors,
        processedCandidates,
      }

      const metrics = this.matchingCore.getPerformanceMetrics({
        candidatesAnalyzed: finalCandidates.length,
        algorithmsUsed: ['auto_matching', 'conflict_resolution'],
      })

      return {
        success: true,
        data: result,
        metrics,
      }
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'algorithm',
          message: `Auto-match execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: error,
          timestamp: new Date(),
        },
      }
    }
  }

  // =====================================================
  // CONFLICT RESOLUTION
  // =====================================================

  private resolveMatchingConflicts(candidates: ProviderMatchCandidate[]): ProviderMatchCandidate[] {
    const usedSaleIds = new Set<string>()
    const usedReportIds = new Set<string>()
    const finalCandidates: ProviderMatchCandidate[] = []

    // Sort by confidence to prioritize best matches
    const sortedCandidates = [...candidates].sort((a, b) => b.confidence - a.confidence)

    for (const candidate of sortedCandidates) {
      const saleId = candidate.sale.id
      const reportId = candidate.providerReport.id

      // Skip if either sale or report is already used
      if (usedSaleIds.has(saleId) || usedReportIds.has(reportId)) {
        continue
      }

      // Add to final list and mark as used
      finalCandidates.push(candidate)
      usedSaleIds.add(saleId)
      usedReportIds.add(reportId)
    }

    return finalCandidates
  }

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  private createFailedCandidate(
    sale: UnmatchedSaleForProvider,
    report: UnmatchedProviderReport,
    reason: string
  ): ProviderMatchCandidate {
    return {
      sale,
      providerReport: report,
      confidence: 0,
      matchReasons: [`✗ ${reason}`],
      scores: { providerMatch: 0, amountMatch: 0, dateMatch: 0 },
      details: { amountDifference: 0, daysDifference: 0, providerMatches: false },
    }
  }

  private generateProviderMatchReasons(
    _scores: { providerMatch: number; amountMatch: number; dateMatch: number },
    details: { amountDifference: number; daysDifference: number; providerMatches: boolean },
    amountAnalysis: AmountMatchAnalysis,
    dateAnalysis: DateMatchAnalysis
  ): string[] {
    const reasons: string[] = []

    // Provider match
    if (details.providerMatches) {
      reasons.push('✓ Provider Match')
    }

    // Amount match
    if (amountAnalysis.category === 'exact') {
      reasons.push('✓ Exakter Betrag')
    } else if (amountAnalysis.category === 'close') {
      reasons.push(`✓ Betrag sehr nah (±${details.amountDifference.toFixed(2)} CHF)`)
    } else if (amountAnalysis.category === 'similar') {
      reasons.push(`⚠ Betrag ähnlich (±${details.amountDifference.toFixed(2)} CHF)`)
    } else {
      reasons.push(`✗ Betrag unterschiedlich (±${details.amountDifference.toFixed(2)} CHF)`)
    }

    // Date match
    if (dateAnalysis.category === 'same_day') {
      reasons.push('✓ Gleicher Tag')
    } else if (dateAnalysis.category === 'next_day') {
      reasons.push('✓ Nächster Tag')
    } else if (dateAnalysis.category === 'same_week') {
      reasons.push(`⚠ Gleiche Woche (${details.daysDifference} Tage)`)
    } else {
      reasons.push(`⚠ Datum weit entfernt (${details.daysDifference} Tage)`)
    }

    return reasons
  }

  // =====================================================
  // STATISTICAL ANALYSIS
  // =====================================================

  analyzeMatchingStats(result: ProviderMatchResult): {
    confidence: { high: number; medium: number; low: number }
    providers: { twint: number; sumup: number }
    amounts: { exact: number; close: number; different: number }
    dates: { sameDay: number; nextDay: number; week: number; far: number }
  } {
    const stats = {
      confidence: { high: 0, medium: 0, low: 0 },
      providers: { twint: 0, sumup: 0 },
      amounts: { exact: 0, close: 0, different: 0 },
      dates: { sameDay: 0, nextDay: 0, week: 0, far: 0 },
    }

    result.candidates.forEach((candidate) => {
      // Confidence levels
      if (candidate.confidence >= this.config.provider.highConfidenceThreshold) {
        stats.confidence.high++
      } else if (candidate.confidence >= this.config.provider.mediumConfidenceThreshold) {
        stats.confidence.medium++
      } else {
        stats.confidence.low++
      }

      // Provider distribution
      if (candidate.providerReport.provider === 'twint') {
        stats.providers.twint++
      } else if (candidate.providerReport.provider === 'sumup') {
        stats.providers.sumup++
      }

      // Amount accuracy
      if (candidate.details.amountDifference === 0) {
        stats.amounts.exact++
      } else if (candidate.details.amountDifference <= 0.05) {
        stats.amounts.close++
      } else {
        stats.amounts.different++
      }

      // Date proximity
      const days = candidate.details.daysDifference
      if (days === 0) stats.dates.sameDay++
      else if (days === 1) stats.dates.nextDay++
      else if (days <= 7) stats.dates.week++
      else stats.dates.far++
    })

    return stats
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

export const providerMatchingService = new ProviderMatchingService()
export default providerMatchingService
