"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Zap,
  Layers,
  Target,
  TrendingUp
} from "lucide-react"
import { getBankMatchSuggestions, createIntelligentBankMatch } from '../../services/bankingApi'
import type { BankMatchSuggestion, BankMatchCandidate } from '../../services/matchingTypes'

interface BankMatchSuggestionsProps {
  bankTransactionId: string | null
  onMatchComplete: () => void
  className?: string
}

export function BankMatchSuggestions({ 
  bankTransactionId, 
  onMatchComplete, 
  className 
}: BankMatchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<BankMatchSuggestion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadSuggestions = async (transactionId: string) => {
    setIsLoading(true)
    setError(null)
    setSelectedItems([])
    
    try {
      const { data, error: apiError } = await getBankMatchSuggestions(transactionId)
      
      if (apiError || !data) {
        throw new Error(apiError?.message || 'Fehler beim Laden der Suggestions')
      }
      
      setSuggestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setSuggestions(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (bankTransactionId) {
      loadSuggestions(bankTransactionId)
    } else {
      setSuggestions(null)
      setSelectedItems([])
      setError(null)
    }
  }, [bankTransactionId])

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleQuickSelect = (candidate: BankMatchCandidate) => {
    const itemIds = candidate.matchedItems.map(item => item.id)
    setSelectedItems(itemIds)
  }

  const executeMatch = async () => {
    if (!bankTransactionId || selectedItems.length === 0) return

    setIsMatching(true)
    setError(null)
    
    try {
      const { success, error: matchError } = await createIntelligentBankMatch(
        bankTransactionId,
        selectedItems,
        suggestions?.topCandidates[0]?.confidence || 100,
        'suggested'
      )
      
      if (!success) {
        throw new Error(matchError?.message || 'Fehler beim Erstellen des Matches')
      }
      
      // Reset state and notify parent
      setSuggestions(null)
      setSelectedItems([])
      onMatchComplete()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setIsMatching(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100'
    if (confidence >= 70) return 'text-blue-600 bg-blue-100'
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'single':
        return <Target className="w-4 h-4" />
      case 'combination':
        return <Layers className="w-4 h-4" />
      case 'provider_bulk':
        return <Zap className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'single':
        return 'Einzelmatch'
      case 'combination':
        return 'Kombination'
      case 'provider_bulk':
        return 'Provider Bulk'
      default:
        return 'Match'
    }
  }

  if (!bankTransactionId) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-gray-500">
            Wählen Sie eine Bank-Transaktion für intelligente Suggestions
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 animate-pulse" />
            Analysiere Matches...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Fehler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!suggestions || suggestions.topCandidates.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-gray-500">
            Keine passenden Matches gefunden
          </p>
        </CardContent>
      </Card>
    )
  }

  const bestCandidate = suggestions.topCandidates[0]
  const selectedTotal = selectedItems.reduce((sum, itemId) => {
    // Find the item amount from all candidates
    for (const candidate of suggestions.topCandidates) {
      const item = candidate.matchedItems.find(i => i.id === itemId)
      if (item) return sum + item.amount
    }
    return sum
  }, 0)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Smart Suggestions
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50">
            {suggestions.summary.totalSuggestions} Vorschläge
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Bulk Detection Alert */}
        {suggestions.bulkDetection && (
          <Alert className="bg-purple-50 border-purple-200">
            <Zap className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Bulk erkannt:</strong> {suggestions.bulkDetection.provider.toUpperCase()} 
              Settlement mit {suggestions.bulkDetection.items.length} Items 
              ({formatAmount(suggestions.bulkDetection.totalAmount)})
            </AlertDescription>
          </Alert>
        )}

        {/* Top Suggestions */}
        <div className="space-y-3">
          {suggestions.topCandidates.slice(0, 3).map((candidate, index) => (
            <div 
              key={index}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getMatchTypeIcon(candidate.matchType)}
                  <span className="font-medium">
                    {getMatchTypeLabel(candidate.matchType)}
                  </span>
                  <Badge className={getConfidenceColor(candidate.confidence)}>
                    {candidate.confidence}%
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatAmount(candidate.details.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {candidate.matchedItems.length} Items
                  </div>
                </div>
              </div>

              {/* Quick Select Button */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {candidate.matchReasons.slice(0, 3).map((reason, reasonIndex) => (
                    <Badge key={reasonIndex} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={() => handleQuickSelect(candidate)}
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Auswählen
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedItems.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {selectedItems.length} Items ausgewählt
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-900">
                  {formatAmount(selectedTotal)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Match Action */}
        <div className="pt-2 border-t">
          <Button
            onClick={executeMatch}
            disabled={selectedItems.length === 0 || isMatching}
            className="w-full"
            size="lg"
          >
            {isMatching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Erstelle Match...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Match erstellen ({selectedItems.length} Items)
              </>
            )}
          </Button>
        </div>

        {/* Performance Info */}
        <div className="text-xs text-gray-500 text-center">
          Beste Confidence: {suggestions.summary.bestConfidence}%
          {suggestions.summary.hasBulkMatch && ' • Bulk-Match verfügbar'}
        </div>
      </CardContent>
    </Card>
  )
}