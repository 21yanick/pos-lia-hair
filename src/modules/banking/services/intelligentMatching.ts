// =====================================================
// Intelligent Matching - Core Algorithm Service
// =====================================================
// Shared matching algorithms and utilities
// Used by both provider and bank matching services

import type { AvailableForBankMatching } from '../types/banking'
import type {
  AmountMatchAnalysis,
  CombinationAnalysis,
  DateMatchAnalysis,
  DescriptionMatchAnalysis,
  MatchingConfig,
  MatchingPerformanceMetrics,
} from './matchingTypes'
import { DEFAULT_MATCHING_CONFIG } from './matchingTypes'

// =====================================================
// CORE MATCHING ALGORITHMS
// =====================================================

export class IntelligentMatchingService {
  private config: MatchingConfig
  private startTime: number = 0

  constructor(config: MatchingConfig = DEFAULT_MATCHING_CONFIG) {
    this.config = config
  }

  // =====================================================
  // AMOUNT MATCHING ALGORITHMS
  // =====================================================

  analyzeAmountMatch(
    amount1: number,
    amount2: number,
    tolerances = this.config.provider.tolerances
  ): AmountMatchAnalysis {
    const difference = Math.abs(amount1 - amount2)

    let category: AmountMatchAnalysis['category']
    let score: number
    let tolerance: number

    if (difference <= tolerances.exactAmountTolerance) {
      category = 'exact'
      score = 100
      tolerance = tolerances.exactAmountTolerance
    } else if (difference <= tolerances.closeAmountTolerance) {
      category = 'close'
      score = 85
      tolerance = tolerances.closeAmountTolerance
    } else if (difference <= tolerances.maxAmountTolerance) {
      category = 'similar'
      score = 50
      tolerance = tolerances.maxAmountTolerance
    } else {
      category = 'different'
      score = 0
      tolerance = difference
    }

    return {
      difference,
      category,
      score,
      tolerance,
    }
  }

  // =====================================================
  // DATE MATCHING ALGORITHMS
  // =====================================================

  analyzeDateMatch(date1: Date | string, date2: Date | string): DateMatchAnalysis {
    const d1 = new Date(date1)
    const d2 = new Date(date2)

    // Calculate days difference
    const timeDiff = Math.abs(d1.getTime() - d2.getTime())
    const daysDifference = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

    let category: DateMatchAnalysis['category']
    let score: number

    if (daysDifference === 0) {
      category = 'same_day'
      score = 100
    } else if (daysDifference === 1) {
      category = 'next_day'
      score = 75
    } else if (daysDifference <= 7) {
      category = 'same_week'
      score = 50
    } else {
      category = 'far'
      score = Math.max(0, 20 - daysDifference) // Diminishing score
    }

    return {
      daysDifference,
      category,
      score,
      saleDate: d1,
      reportDate: d2,
    }
  }

  // =====================================================
  // DESCRIPTION MATCHING ALGORITHMS
  // =====================================================

  analyzeDescriptionMatch(
    description: string,
    targetDescription: string,
    keywords: string[] = ['twint', 'sumup', 'cash', 'transfer']
  ): DescriptionMatchAnalysis {
    const desc1 = description.toLowerCase()
    const desc2 = targetDescription.toLowerCase()

    const matchedTerms: string[] = []
    let providerDetected = false
    let score = 0

    // Check for keyword matches
    keywords.forEach((keyword) => {
      if (desc1.includes(keyword) && desc2.includes(keyword)) {
        matchedTerms.push(keyword)
        score += 20

        if (keyword === 'twint' || keyword === 'sumup') {
          providerDetected = true
          score += 10 // Extra bonus for provider match
        }
      }
    })

    // Check for general text similarity (simple approach)
    const words1 = desc1.split(/\s+/)
    const words2 = desc2.split(/\s+/)

    const commonWords = words1.filter((word) => word.length > 3 && words2.includes(word))

    score += Math.min(commonWords.length * 5, 30)

    return {
      keywords: matchedTerms,
      providerDetected,
      score: Math.min(score, 100),
      matchedTerms: [...matchedTerms, ...commonWords],
    }
  }

  // =====================================================
  // COMBINATION ANALYSIS
  // =====================================================

  findBestCombinations(
    targetAmount: number,
    availableItems: AvailableForBankMatching[],
    maxItems: number = this.config.bank.tolerances.maxItemsInCombination,
    tolerance: number = this.config.bank.tolerances.maxAmountTolerance
  ): CombinationAnalysis[] {
    const combinations: CombinationAnalysis[] = []

    // Generate combinations of different sizes
    for (let size = 1; size <= Math.min(maxItems, availableItems.length); size++) {
      const sizeCombinations = this.generateCombinations(availableItems, size)

      for (const combo of sizeCombinations) {
        const analysis = this.analyzeCombination(targetAmount, combo, tolerance)
        if (analysis.feasible) {
          combinations.push(analysis)
        }
      }
    }

    // Sort by score (best matches first)
    return combinations.sort((a, b) => b.score - a.score)
  }

  private analyzeCombination(
    targetAmount: number,
    items: AvailableForBankMatching[],
    tolerance: number
  ): CombinationAnalysis {
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
    const amountDifference = Math.abs(targetAmount - totalAmount)
    const itemCount = items.length

    let score = 0
    let feasible = false

    if (amountDifference <= tolerance) {
      feasible = true

      // Base score for feasible combination
      score = 50

      // Amount accuracy bonus
      if (amountDifference === 0) {
        score += 40
      } else if (amountDifference <= 0.05) {
        score += 30
      } else {
        score += Math.max(0, 20 - amountDifference * 10)
      }

      // Penalty for more items (prefer simpler combinations)
      score -= (itemCount - 1) * 5

      // Ensure minimum score
      score = Math.max(score, 10)
    }

    return {
      items,
      totalAmount,
      amountDifference,
      itemCount,
      score,
      feasible,
    }
  }

  // =====================================================
  // PROVIDER DETECTION
  // =====================================================

  detectProvider(description: string): 'twint' | 'sumup' | null {
    const desc = description.toLowerCase()

    // TWINT keywords
    const twintKeywords = ['twint', 'acquiring', 'gutschrift twint']
    if (twintKeywords.some((keyword) => desc.includes(keyword))) {
      return 'twint'
    }

    // SumUp keywords
    const sumupKeywords = ['sumup', 'payments ltd', 'sumup payments']
    if (sumupKeywords.some((keyword) => desc.includes(keyword))) {
      return 'sumup'
    }

    return null
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  private generateCombinations<T>(arr: T[], size: number): T[][] {
    if (size === 1) return arr.map((item) => [item])
    if (size > arr.length) return []

    const combinations: T[][] = []

    const generateRecursive = (start: number, current: T[]) => {
      if (current.length === size) {
        combinations.push([...current])
        return
      }

      for (let i = start; i < arr.length; i++) {
        current.push(arr[i])
        generateRecursive(i + 1, current)
        current.pop()
      }
    }

    generateRecursive(0, [])
    return combinations
  }

  calculateConfidence(
    scores: { [key: string]: number },
    weights: { [key: string]: number }
  ): number {
    let totalScore = 0
    let totalWeight = 0

    Object.keys(scores).forEach((key) => {
      if (weights[key]) {
        totalScore += scores[key] * weights[key]
        totalWeight += weights[key]
      }
    })

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }

  formatMatchReasons(scores: { [key: string]: number }, _details: any = {}): string[] {
    const reasons: string[] = []

    Object.entries(scores).forEach(([key, score]) => {
      if (score > 80) {
        reasons.push(`✓ ${this.formatScoreLabel(key, score)}`)
      } else if (score > 50) {
        reasons.push(`⚠ ${this.formatScoreLabel(key, score)}`)
      } else if (score > 0) {
        reasons.push(`• ${this.formatScoreLabel(key, score)}`)
      }
    })

    return reasons
  }

  private formatScoreLabel(key: string, score: number): string {
    const labels: { [key: string]: string } = {
      providerMatch: `Provider Match (${score}%)`,
      amountMatch: `Amount Match (${score}%)`,
      dateMatch: `Date Match (${score}%)`,
      amountAccuracy: `Amount Accuracy (${score}%)`,
      dateProximity: `Date Proximity (${score}%)`,
      descriptionMatch: `Description Match (${score}%)`,
    }

    return labels[key] || `${key} (${score}%)`
  }

  // =====================================================
  // PERFORMANCE MONITORING
  // =====================================================

  startPerformanceTracking(): void {
    this.startTime = Date.now()
  }

  getPerformanceMetrics(
    additionalData: Partial<MatchingPerformanceMetrics> = {}
  ): MatchingPerformanceMetrics {
    return {
      processingTimeMs: Date.now() - this.startTime,
      candidatesAnalyzed: 0,
      algorithmsUsed: ['amount_analysis', 'date_analysis', 'combination_analysis'],
      ...additionalData,
    }
  }

  // =====================================================
  // CONFIGURATION HELPERS
  // =====================================================

  updateConfig(newConfig: Partial<MatchingConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): MatchingConfig {
    return { ...this.config }
  }

  // =====================================================
  // VALIDATION HELPERS
  // =====================================================

  validateAmount(amount: number): boolean {
    return typeof amount === 'number' && !Number.isNaN(amount) && Number.isFinite(amount)
  }

  validateDate(date: Date | string): boolean {
    const d = new Date(date)
    return d instanceof Date && !Number.isNaN(d.getTime())
  }

  validateItems(items: AvailableForBankMatching[]): boolean {
    return (
      Array.isArray(items) &&
      items.length > 0 &&
      items.every((item) => this.validateAmount(item.amount) && this.validateDate(item.date))
    )
  }
}

// =====================================================
// EXPORT SINGLETON INSTANCE
// =====================================================

export const intelligentMatchingService = new IntelligentMatchingService()
export default intelligentMatchingService
