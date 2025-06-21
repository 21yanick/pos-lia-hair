"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { 
  CheckCircle2, 
  Layers, 
  TrendingUp,
  Building2
} from "lucide-react"
import { useBankingData } from '../../hooks/useBankingData'
import { BankSettlementConnector } from './BankSettlementConnector'
import { formatDateForDisplay, formatDateForAPI } from '@/shared/utils/dateUtils'

interface SettlementGroup {
  provider: 'twint' | 'sumup' | 'cash' | 'owner' | 'expenses'
  displayName: string
  icon: string
  items: any[]
  totalAmount: number
  confidence?: number
  isDetected?: boolean
}

interface EnhancedBankTablesProps {
  selectedBankTransaction: string | null
  selectedItems: string[]
  onBankTransactionSelect: (transactionId: string) => void
  onItemsSelect: (itemIds: string[]) => void
  onMatchComplete: () => void
  className?: string
}

export function EnhancedBankTables({
  selectedBankTransaction,
  selectedItems,
  onBankTransactionSelect,
  onItemsSelect,
  onMatchComplete,
  className
}: EnhancedBankTablesProps) {
  const [isMatching, setIsMatching] = useState(false)
  const [highlightedItems, setHighlightedItems] = useState<string[]>([]) // Auto-highlighted potential matches
  const [highlightedScores, setHighlightedScores] = useState<Map<string, number>>(new Map()) // Scores for highlighted items
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    unmatchedBankTransactions,
    availableForMatching,
    isLoading,
    handleBankMatch
  } = useBankingData()

  // Settlement Detection & Grouping - ALWAYS generate from available items
  const generateSettlementGroups = (): SettlementGroup[] => {
    const groups: SettlementGroup[] = []
    
    // Group items by provider/type
    const twintItems = availableForMatching.filter(item => 
      item.description.toLowerCase().includes('twint')
    )
    const sumupItems = availableForMatching.filter(item => 
      item.description.toLowerCase().includes('sumup')
    )
    const expenseItems = availableForMatching.filter(item => 
      item.item_type === 'expense'
    )
    const cashItems = availableForMatching.filter(item => 
      item.item_type === 'cash_movement'
    )
    const ownerItems = availableForMatching.filter(item => 
      item.item_type === 'owner_transaction'
    )

    if (twintItems.length > 0) {
      groups.push({
        provider: 'twint',
        displayName: 'TWINT Settlement',
        icon: '🟦',
        items: twintItems,
        totalAmount: twintItems.reduce((sum, item) => sum + item.amount, 0)
      })
    }

    if (sumupItems.length > 0) {
      groups.push({
        provider: 'sumup', 
        displayName: 'SumUp Settlement',
        icon: '🟧',
        items: sumupItems,
        totalAmount: sumupItems.reduce((sum, item) => sum + item.amount, 0)
      })
    }

    if (expenseItems.length > 0) {
      groups.push({
        provider: 'expenses',
        displayName: 'Ausgaben',
        icon: '💰',
        items: expenseItems,
        totalAmount: expenseItems.reduce((sum, item) => sum + item.amount, 0)
      })
    }

    if (cashItems.length > 0) {
      groups.push({
        provider: 'cash',
        displayName: 'Cash Transfers',
        icon: '💵',
        items: cashItems,
        totalAmount: cashItems.reduce((sum, item) => sum + item.amount, 0)
      })
    }

    if (ownerItems.length > 0) {
      groups.push({
        provider: 'owner',
        displayName: 'Owner Transaktionen',
        icon: '🏢',
        items: ownerItems,
        totalAmount: ownerItems.reduce((sum, item) => sum + item.amount, 0)
      })
    }

    return groups
  }

  // Generate base settlement groups from available items (ALWAYS)
  const baseSettlements = generateSettlementGroups()

  // Auto-highlighting logic: Intelligent weighted scoring system (like Provider Matching)
  const findPotentialMatches = (bankTransactionId: string): {itemIds: string[], scores: Map<string, number>} => {
    const bankTransaction = unmatchedBankTransactions.find(t => t.id === bankTransactionId)
    if (!bankTransaction) return {itemIds: [], scores: new Map()}

    const bankAmount = bankTransaction.amount
    const bankDate = new Date(bankTransaction.transaction_date)
    
    // console.log('🔍 Intelligent Banking Match Analysis:', {
    //   id: bankTransactionId,
    //   amount: bankAmount,
    //   date: bankTransaction.transaction_date,
    //   description: bankTransaction.description
    // })
    
    const potentialMatches: Array<{id: string, score: number, item: any, breakdown: any}> = []

    availableForMatching.forEach(item => {
      const analysis = analyzeIntelligentBankMatch(bankTransaction, item)
      
      // Only consider matches with reasonable confidence (>= 50%)
      if (analysis.finalScore >= 50) {
        potentialMatches.push({ 
          id: item.id, 
          score: analysis.finalScore, 
          item,
          breakdown: analysis
        })
        
        // console.log('💡 Intelligent Match Found:', {
        //   item: {
        //     id: item.id,
        //     amount: item.amount,
        //     date: item.date,
        //     description: item.description,
        //     type: item.item_type
        //   },
        //   scores: {
        //     amount: analysis.scores.amountAccuracy,
        //     date: analysis.scores.dateProximity,
        //     description: analysis.scores.descriptionMatch,
        //     final: analysis.finalScore
        //   },
        //   weights: analysis.weights,
        //   calculation: analysis.calculation
        // })
      }
    })
    
    // Sort by score and return top matches
    const sortedMatches = potentialMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Top 3 matches
    
    // console.log('🎯 Top Intelligent Matches:', sortedMatches.map(m => ({
    //   id: m.id,
    //   finalScore: Math.round(m.score),
    //   amount: m.item.amount,
    //   description: m.item.description,
    //   breakdown: `Amount:${m.breakdown.scores.amountAccuracy}% × Date:${m.breakdown.scores.dateProximity}% × Desc:${m.breakdown.scores.descriptionMatch}%`
    // })))
    
    // Create scores map
    const scores = new Map<string, number>()
    sortedMatches.forEach(match => {
      scores.set(match.id, match.score)
    })
    
    return {
      itemIds: sortedMatches.map(match => match.id),
      scores
    }
  }

  // Intelligent weighted scoring analysis (based on Provider Matching algorithm)
  const analyzeIntelligentBankMatch = (bankTransaction: any, item: any) => {
    const weights = {
      amountAccuracy: 70,
      dateProximity: 20,
      descriptionMatch: 10
    }
    
    const scores = {
      amountAccuracy: 0,
      dateProximity: 0,
      descriptionMatch: 0
    }

    // 1. AMOUNT ACCURACY (70% weight)
    const amountDiff = Math.abs(bankTransaction.amount - item.amount)
    if (amountDiff < 0.01) {
      scores.amountAccuracy = 100 // Perfect match
    } else if (amountDiff <= 0.05) {
      scores.amountAccuracy = 95 // Near perfect
    } else if (amountDiff <= 1.0) {
      scores.amountAccuracy = Math.max(80 - (amountDiff * 10), 60) // Good match
    } else if (amountDiff <= 5.0) {
      scores.amountAccuracy = Math.max(60 - (amountDiff * 5), 30) // Fair match
    } else {
      scores.amountAccuracy = 0 // Poor match
    }

    // 2. DATE PROXIMITY (20% weight) - Same logic as Provider Matching
    const bankDate = new Date(bankTransaction.transaction_date)
    const itemDate = new Date(item.date)
    const timeDiff = Math.abs(bankDate.getTime() - itemDate.getTime())
    const daysDifference = Math.floor(timeDiff / (1000 * 60 * 60 * 24))

    if (daysDifference === 0) {
      scores.dateProximity = 100 // Same day
    } else if (daysDifference === 1) {
      scores.dateProximity = 75 // Next day
    } else if (daysDifference <= 7) {
      scores.dateProximity = 50 // Same week
    } else {
      scores.dateProximity = Math.max(0, 20 - daysDifference) // Diminishing returns
    }

    // 3. DESCRIPTION MATCH (10% weight)
    const bankDesc = bankTransaction.description.toLowerCase()
    const itemDesc = item.description.toLowerCase()
    
    // Simple keyword matching
    if (bankDesc.includes(itemDesc) || itemDesc.includes(bankDesc)) {
      scores.descriptionMatch = 90
    } else {
      // Check for common words
      const bankWords = bankDesc.split(/\s+/)
      const itemWords = itemDesc.split(/\s+/)
      const commonWords = bankWords.filter(word => 
        word.length > 3 && itemWords.some(iw => iw.includes(word) || word.includes(iw))
      )
      
      if (commonWords.length > 0) {
        scores.descriptionMatch = Math.min(70, commonWords.length * 25)
      } else {
        scores.descriptionMatch = 10 // Base score for having descriptions
      }
    }

    // 4. CALCULATE WEIGHTED AVERAGE (like Provider Matching)
    const totalScore = (
      scores.amountAccuracy * weights.amountAccuracy +
      scores.dateProximity * weights.dateProximity +
      scores.descriptionMatch * weights.descriptionMatch
    ) / (weights.amountAccuracy + weights.dateProximity + weights.descriptionMatch)

    const finalScore = Math.round(totalScore)

    return {
      scores,
      weights,
      finalScore,
      calculation: `(${scores.amountAccuracy}×${weights.amountAccuracy} + ${scores.dateProximity}×${weights.dateProximity} + ${scores.descriptionMatch}×${weights.descriptionMatch}) / 100 = ${finalScore}%`,
      details: {
        amountDifference: Math.abs(bankTransaction.amount - item.amount),
        daysDifference,
        bankDate: formatDateForAPI(bankDate),
        itemDate: formatDateForAPI(itemDate)
      }
    }
  }

  // Auto-highlight when bank transaction changes
  React.useEffect(() => {
    if (selectedBankTransaction) {
      const result = findPotentialMatches(selectedBankTransaction)
      setHighlightedItems(result.itemIds)
      setHighlightedScores(result.scores)
    } else {
      setHighlightedItems([])
      setHighlightedScores(new Map())
    }
  }, [selectedBankTransaction, availableForMatching])

  // Handle settlement group pre-selection
  const handlePreSelectGroup = (group: SettlementGroup) => {
    const itemIds = group.items.map(item => item.id)
    onItemsSelect(itemIds)
  }

  // Handle individual item selection
  const handleItemSelect = (itemId: string) => {
    const newSelection = selectedItems.includes(itemId) 
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId]
    onItemsSelect(newSelection)
  }

  // Execute match with confirmation
  const handleConfirmMatch = async () => {
    if (!selectedBankTransaction || selectedItems.length === 0) return

    setIsMatching(true)
    try {
      const matchedItems = selectedItems.map(itemId => {
        const item = availableForMatching.find(i => i.id === itemId)
        if (!item) throw new Error(`Item ${itemId} not found`)
        
        return {
          type: item.item_type,
          id: item.id,
          amount: Math.abs(item.amount)
        }
      })

      const success = await handleBankMatch(selectedBankTransaction, matchedItems)
      
      if (success) {
        // Reset state
        onItemsSelect([])
        onMatchComplete()
      }
    } catch (error) {
      console.error('Failed to confirm match:', error)
    } finally {
      setIsMatching(false)
    }
  }


  return (
    <div className={className} ref={containerRef} style={{ position: 'relative' }}>
      {/* Connection Lines Overlay - Manual connections only */}
      <BankSettlementConnector 
        selectedItems={selectedItems}
        highlightedItems={highlightedItems}
        highlightedScores={highlightedScores}
        selectedBankTransaction={selectedBankTransaction}
        containerRef={containerRef}
      />

      {/* Match Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && selectedBankTransaction && (
            <Button
              onClick={handleConfirmMatch}
              disabled={isMatching}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {isMatching ? (
                <>
                  <TrendingUp className="w-4 h-4 animate-spin" />
                  Bestätige Match...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  ✅ Match bestätigen ({selectedItems.length})
                </>
              )}
            </Button>
          )}
        </div>
      </div>


      <div className="grid grid-cols-2 gap-6">
        {/* Left: Bank Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Bank-Transaktionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : unmatchedBankTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Keine ungematchten Bank-Transaktionen
                    </TableCell>
                  </TableRow>
                ) : (
                  unmatchedBankTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id}
                      data-bank-id={transaction.id}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedBankTransaction === transaction.id 
                          ? 'bg-accent border-l-4 border-primary' 
                          : 'hover:bg-muted/30'
                      }`}
                      onClick={() => onBankTransactionSelect(transaction.id)}
                    >
                      <TableCell>{formatDateForDisplay(transaction.transaction_date)}</TableCell>
                      <TableCell className={transaction.amount > 0 ? 'text-success' : 'text-destructive'}>
                        {transaction.direction_display} {transaction.amount_abs.toFixed(2)} CHF
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Pending</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right: Settlement Groups & Available Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Settlement Groups & Verfügbare Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {baseSettlements.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-gray-500">
                  Keine verfügbaren Items für Bank-Matching gefunden
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Settlement Groups - ALWAYS displayed */}
                {baseSettlements.map((group, index) => (
                  <div 
                    key={group.provider}
                    data-settlement-group={group.items.map(item => item.id).join(',')}
                    className="border rounded-lg p-4 transition-all duration-200 border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{group.icon}</span>
                        <span className="font-medium">{group.displayName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {group.totalAmount.toFixed(2)} CHF
                        </div>
                        <div className="text-sm text-gray-500">
                          {group.items.length} Items
                        </div>
                      </div>
                    </div>


                    {/* Individual Items */}
                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => (
                        <div 
                          key={item.id}
                          data-item-id={item.id}
                          className={`flex items-center justify-between p-2 rounded border transition-all duration-200 ${
                            selectedItems.includes(item.id) 
                              ? 'bg-accent/50 border-primary shadow-sm' 
                              : highlightedItems.includes(item.id)
                                ? 'bg-warning/10 border-warning shadow-sm'
                                : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => handleItemSelect(item.id)}
                            />
                            <div className="text-sm">
                              <div className="font-medium">{item.amount.toFixed(2)} CHF</div>
                              <div className="text-gray-500 truncate max-w-[150px]">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {formatDateForDisplay(item.date)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}