// =====================================================
// Settlement Detection Service
// =====================================================
// Enhanced settlement detection for Banking Tab 2
// Identifies TWINT/SumUp settlements and groupings

import type { AvailableForBankMatching, UnmatchedBankTransaction } from '../types/banking'
import { intelligentMatchingService } from './intelligentMatching'

// =====================================================
// SETTLEMENT DETECTION TYPES
// =====================================================

export interface SettlementGroup {
  provider: 'twint' | 'sumup' | 'cash' | 'owner' | 'expenses'
  displayName: string
  icon: string
  items: AvailableForBankMatching[]
  totalAmount: number
  confidence?: number
  isDetected?: boolean
  settlementPeriod?: string
  matchedTransaction?: UnmatchedBankTransaction
}

export interface SettlementDetectionResult {
  groups: SettlementGroup[]
  primarySettlement?: SettlementGroup
  confidence: number
  bankTransaction: UnmatchedBankTransaction
  recommendedAction: 'auto_select' | 'suggest' | 'review'
}

// =====================================================
// SETTLEMENT DETECTION SERVICE
// =====================================================

export class SettlementDetectionService {
  private matchingCore = intelligentMatchingService

  // Main settlement detection method
  detectSettlements(
    bankTransaction: UnmatchedBankTransaction,
    availableItems: AvailableForBankMatching[]
  ): SettlementDetectionResult {
    this.matchingCore.startPerformanceTracking()

    // 1. Generate base settlement groups
    const groups = this.generateSettlementGroups(availableItems)

    // 2. Analyze each group against the bank transaction
    const analyzedGroups = groups.map((group) =>
      this.analyzeSettlementGroup(bankTransaction, group)
    )

    // 3. Find primary settlement (best match)
    const primarySettlement = this.findPrimarySettlement(bankTransaction, analyzedGroups)

    // 4. Calculate overall confidence
    const confidence = primarySettlement?.confidence || 0

    // 5. Determine recommended action
    const recommendedAction = this.getRecommendedAction(confidence, primarySettlement)

    return {
      groups: analyzedGroups,
      primarySettlement,
      confidence,
      bankTransaction,
      recommendedAction,
    }
  }

  // Generate settlement groups from available items
  private generateSettlementGroups(items: AvailableForBankMatching[]): SettlementGroup[] {
    const groups: SettlementGroup[] = []

    // TWINT Settlement Group
    const twintItems = items.filter((item) => this.isTwintItem(item))
    if (twintItems.length > 0) {
      groups.push({
        provider: 'twint',
        displayName: 'TWINT Settlement',
        icon: '🟦',
        items: twintItems,
        totalAmount: twintItems.reduce((sum, item) => sum + item.amount, 0),
        settlementPeriod: this.getSettlementPeriod(twintItems),
      })
    }

    // SumUp Settlement Group
    const sumupItems = items.filter((item) => this.isSumUpItem(item))
    if (sumupItems.length > 0) {
      groups.push({
        provider: 'sumup',
        displayName: 'SumUp Settlement',
        icon: '🟧',
        items: sumupItems,
        totalAmount: sumupItems.reduce((sum, item) => sum + item.amount, 0),
        settlementPeriod: this.getSettlementPeriod(sumupItems),
      })
    }

    // Expenses Group
    const expenseItems = items.filter((item) => item.item_type === 'expense')
    if (expenseItems.length > 0) {
      groups.push({
        provider: 'expenses',
        displayName: 'Ausgaben',
        icon: '💰',
        items: expenseItems,
        totalAmount: expenseItems.reduce((sum, item) => sum + item.amount, 0),
      })
    }

    // Cash Movement Group
    const cashItems = items.filter((item) => item.item_type === 'cash_movement')
    if (cashItems.length > 0) {
      groups.push({
        provider: 'cash',
        displayName: 'Cash Transfers',
        icon: '💵',
        items: cashItems,
        totalAmount: cashItems.reduce((sum, item) => sum + item.amount, 0),
      })
    }

    // Owner Transaction Group
    const ownerItems = items.filter((item) => item.item_type === 'owner_transaction')
    if (ownerItems.length > 0) {
      groups.push({
        provider: 'owner',
        displayName: 'Owner Transaktionen',
        icon: '🏢',
        items: ownerItems,
        totalAmount: ownerItems.reduce((sum, item) => sum + item.amount, 0),
      })
    }

    return groups
  }

  // Analyze a settlement group against a bank transaction
  private analyzeSettlementGroup(
    bankTransaction: UnmatchedBankTransaction,
    group: SettlementGroup
  ): SettlementGroup {
    // 1. Amount matching (70% weight)
    const amountAnalysis = this.matchingCore.analyzeAmountMatch(
      bankTransaction.amount,
      group.totalAmount,
      {
        exactAmountTolerance: 0.0,
        closeAmountTolerance: 0.1,
        maxAmountTolerance: 2.0,
        maxDaysTolerance: 7, // Settlement detection uses default date tolerance
      }
    )

    // 2. Provider detection in bank description (25% weight)
    const providerDetected = this.detectProviderInDescription(
      bankTransaction.description,
      group.provider
    )

    // 3. Settlement period matching (5% weight)
    const periodMatch = this.analyzePeriodMatch(bankTransaction, group.settlementPeriod)

    // Calculate confidence
    let confidence = 0

    // Amount matching score
    confidence += amountAnalysis.score * 0.7

    // Provider detection score
    if (providerDetected) {
      confidence += 100 * 0.25
    }

    // Period matching score
    confidence += periodMatch * 0.05

    // Bonus for settlement groups (TWINT/SumUp)
    if (group.provider === 'twint' || group.provider === 'sumup') {
      if (group.items.length >= 2 && amountAnalysis.category === 'exact') {
        confidence += 5 // Settlement bonus
      }
    }

    return {
      ...group,
      confidence: Math.round(confidence),
      isDetected: confidence >= 85,
      matchedTransaction: confidence >= 70 ? bankTransaction : undefined,
    }
  }

  // Find the primary settlement (best match)
  private findPrimarySettlement(
    _bankTransaction: UnmatchedBankTransaction,
    groups: SettlementGroup[]
  ): SettlementGroup | undefined {
    // Sort by confidence and return the best
    const sortedGroups = groups
      .filter((g) => g.confidence && g.confidence >= 70)
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))

    return sortedGroups.length > 0 ? sortedGroups[0] : undefined
  }

  // Determine recommended action based on confidence
  private getRecommendedAction(
    confidence: number,
    primarySettlement?: SettlementGroup
  ): 'auto_select' | 'suggest' | 'review' {
    if (!primarySettlement) return 'review'

    if (
      (confidence >= 95 && primarySettlement.provider === 'twint') ||
      primarySettlement.provider === 'sumup'
    ) {
      return 'auto_select' // Very high confidence settlement
    }

    if (confidence >= 85) {
      return 'suggest' // High confidence, suggest selection
    }

    return 'review' // Lower confidence, manual review needed
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private isTwintItem(item: AvailableForBankMatching): boolean {
    const desc = item.description.toLowerCase()
    return desc.includes('twint') || desc.includes('(twint)')
  }

  private isSumUpItem(item: AvailableForBankMatching): boolean {
    const desc = item.description.toLowerCase()
    return desc.includes('sumup') || desc.includes('(sumup net)')
  }

  private detectProviderInDescription(
    bankDescription: string,
    groupProvider: SettlementGroup['provider']
  ): boolean {
    const desc = bankDescription.toLowerCase()

    switch (groupProvider) {
      case 'twint':
        return (
          desc.includes('twint') || desc.includes('acquiring') || desc.includes('gutschrift twint')
        )

      case 'sumup':
        return (
          desc.includes('sumup') || desc.includes('payments ltd') || desc.includes('sumup payments')
        )

      case 'cash':
        return (
          desc.includes('cash') ||
          desc.includes('transfer') ||
          desc.includes('abhebung') ||
          desc.includes('einzahlung')
        )

      case 'owner':
        return (
          desc.includes('owner') ||
          desc.includes('inhaber') ||
          desc.includes('entnahme') ||
          desc.includes('einlage')
        )

      default:
        return false
    }
  }

  private getSettlementPeriod(items: AvailableForBankMatching[]): string {
    if (items.length === 0) return ''

    // Use the month of the first item as settlement period
    const firstDate = new Date(items[0].date)
    return `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}`
  }

  private analyzePeriodMatch(
    bankTransaction: UnmatchedBankTransaction,
    settlementPeriod?: string
  ): number {
    if (!settlementPeriod) return 50 // Neutral if no period info

    const bankDate = new Date(bankTransaction.transaction_date)
    const bankPeriod = `${bankDate.getFullYear()}-${String(bankDate.getMonth() + 1).padStart(2, '0')}`

    // Same month = 100, different month = 0
    return bankPeriod === settlementPeriod ? 100 : 0
  }

  // =====================================================
  // SETTLEMENT STATISTICS
  // =====================================================

  generateSettlementStats(result: SettlementDetectionResult): {
    totalGroups: number
    detectedGroups: number
    highConfidenceGroups: number
    totalAmount: number
    primaryProvider?: string
  } {
    const detectedGroups = result.groups.filter((g) => g.isDetected).length
    const highConfidenceGroups = result.groups.filter(
      (g) => g.confidence && g.confidence >= 95
    ).length
    const totalAmount = result.groups.reduce((sum, g) => sum + g.totalAmount, 0)

    return {
      totalGroups: result.groups.length,
      detectedGroups,
      highConfidenceGroups,
      totalAmount,
      primaryProvider: result.primarySettlement?.provider,
    }
  }
}

// =====================================================
// EXPORT SINGLETON
// =====================================================

export const settlementDetectionService = new SettlementDetectionService()
export default settlementDetectionService
