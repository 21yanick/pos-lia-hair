"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { Zap, Target, AlertCircle, Brain, Eye, CheckCircle2 } from "lucide-react"
import { useBankingData } from '../../hooks/useBankingData'
import { getProviderMatchSuggestions, executeAutoProviderMatch } from '../../services/bankingApi'
import type { ProviderMatchCandidate } from '../../services/matchingTypes'
import { ProviderMatchConnector } from './ProviderMatchConnector'

interface EnhancedProviderTablesProps {
  selectedSale: string | null
  selectedProvider: string | null
  onSaleSelect: (saleId: string) => void
  onProviderSelect: (providerId: string) => void
  onMatchComplete: () => void
  className?: string
}

export function EnhancedProviderTables({
  selectedSale,
  selectedProvider,
  onSaleSelect,
  onProviderSelect,
  onMatchComplete,
  className
}: EnhancedProviderTablesProps) {
  const [matchCandidates, setMatchCandidates] = useState<ProviderMatchCandidate[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showMatches, setShowMatches] = useState(false)
  const [selectedMatches, setSelectedMatches] = useState<string[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    unmatchedSales,
    unmatchedProviderReports,
    isLoading
  } = useBankingData()

  // Analysis function
  const handleAnalyze = async () => {
    if (unmatchedSales.length === 0 || unmatchedProviderReports.length === 0) return

    setIsAnalyzing(true)
    try {
      const result = await getProviderMatchSuggestions()
      
      if (result.error) {
        throw new Error(result.error.message || 'Analysis failed')
      }

      const candidates = result.data?.candidates || []
      setMatchCandidates(candidates)
      setShowMatches(true)
      
      // Pre-select high confidence matches (95%+)
      const autoSelectIds = candidates
        .filter(c => c.confidence >= 95)
        .map(c => `${c.sale.id}-${c.providerReport.id}`)
      setSelectedMatches(autoSelectIds)
      
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Get confidence for a specific sale
  const getSaleConfidence = (saleId: string): number | null => {
    if (!showMatches) return null
    const match = matchCandidates.find(c => c.sale.id === saleId)
    return match ? match.confidence : null
  }

  // Get confidence for a specific provider report
  const getProviderConfidence = (providerId: string): number | null => {
    if (!showMatches) return null
    const match = matchCandidates.find(c => c.providerReport.id === providerId)
    return match ? match.confidence : null
  }

  // Get confidence badge component
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) {
      return (
        <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {confidence}%
        </Badge>
      )
    }
    if (confidence >= 80) {
      return (
        <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 flex items-center gap-1">
          <Target className="w-3 h-3" />
          {confidence}%
        </Badge>
      )
    }
    if (confidence >= 60) {
      return (
        <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {confidence}%
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {confidence}%
      </Badge>
    )
  }

  // Check if a row is matchable
  const isRowMatchable = (saleId: string, providerId: string): boolean => {
    if (!showMatches) return false
    return matchCandidates.some(c => c.sale.id === saleId && c.providerReport.id === providerId)
  }

  // Handle match selection
  const handleMatchSelect = (saleId: string, providerId: string) => {
    const matchId = `${saleId}-${providerId}`
    setSelectedMatches(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId)
        : [...prev, matchId]
    )
  }

  // Execute selected matches
  const executeSelectedMatches = async () => {
    if (selectedMatches.length === 0) return

    setIsExecuting(true)
    try {
      // Get the actual match candidates for the selected matches
      const selectedCandidates = matchCandidates.filter(candidate => 
        selectedMatches.includes(`${candidate.sale.id}-${candidate.providerReport.id}`)
      )

      // Execute the matches using the banking API
      const result = await executeAutoProviderMatch(selectedCandidates)
      
      if (result.error) {
        throw new Error(result.error.message || 'Match execution failed')
      }

      // Success - reset state and refresh data
      setShowMatches(false)
      setMatchCandidates([])
      setSelectedMatches([])
      onMatchComplete()
      
    } catch (error) {
      console.error('Failed to execute matches:', error)
      // TODO: Show error toast to user
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className={className} ref={containerRef} style={{ position: 'relative' }}>
      {/* Connection Lines Overlay */}
      {showMatches && (
        <ProviderMatchConnector 
          matchCandidates={matchCandidates}
          selectedMatches={selectedMatches}
          containerRef={containerRef}
        />
      )}
      
      {/* Inline Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || unmatchedSales.length === 0 || unmatchedProviderReports.length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-4 h-4 animate-pulse" />
                Analysiere...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                🧠 Intelligente Analyse
              </>
            )}
          </Button>

          {showMatches && (
            <Button
              onClick={executeSelectedMatches}
              disabled={selectedMatches.length === 0 || isExecuting}
              className="flex items-center gap-2"
            >
              {isExecuting ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  Führe {selectedMatches.length} Matches aus...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  ⚡ Auto-Match ({selectedMatches.length})
                </>
              )}
            </Button>
          )}
        </div>

        {showMatches && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {matchCandidates.filter(c => c.confidence >= 95).length} Auto-Match
            </Badge>
            <Badge variant="outline">
              <Eye className="w-3 h-3 mr-1" />
              {matchCandidates.length} gefunden
            </Badge>
          </div>
        )}
      </div>

      {/* Analysis Results Alert */}
      {showMatches && matchCandidates.length > 0 && (
        <Alert className="mb-4">
          <Brain className="h-4 w-4" />
          <AlertDescription>
            {matchCandidates.length} Matching-Kandidaten gefunden. 
            {matchCandidates.filter(c => c.confidence >= 95).length > 0 && (
              <> {matchCandidates.filter(c => c.confidence >= 95).length} sind für Auto-Match vorausgewählt (≥95%).</>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Enhanced POS Sales */}
        <Card>
          <CardHeader>
            <CardTitle>POS Sales (Brutto)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {showMatches && <TableHead className="w-12">Match</TableHead>}
                  <TableHead>Datum</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Methode</TableHead>
                  {showMatches && <TableHead>Confidence</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {showMatches && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      {showMatches && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                    </TableRow>
                  ))
                ) : unmatchedSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showMatches ? 6 : 4} className="text-center text-muted-foreground py-8">
                      No unmatched sales found
                    </TableCell>
                  </TableRow>
                ) : (
                  unmatchedSales.map((sale) => {
                    const confidence = getSaleConfidence(sale.id)
                    const hasMatch = confidence !== null
                    const matchedProvider = hasMatch ? matchCandidates.find(c => c.sale.id === sale.id)?.providerReport : null
                    
                    return (
                      <TableRow 
                        key={sale.id}
                        data-sale-id={sale.id}
                        className={`cursor-pointer transition-colors ${
                          selectedSale === sale.id 
                            ? 'bg-accent border-l-4 border-primary' 
                            : hasMatch 
                              ? 'hover:bg-chart-2/5' 
                              : 'hover:bg-muted/30'
                        } ${hasMatch ? 'bg-chart-2/10' : ''}`}
                        onClick={() => onSaleSelect(sale.id)}
                      >
                        {showMatches && (
                          <TableCell>
                            {hasMatch && matchedProvider && (
                              <Checkbox
                                checked={selectedMatches.includes(`${sale.id}-${matchedProvider.id}`)}
                                onCheckedChange={() => handleMatchSelect(sale.id, matchedProvider.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.total_amount.toFixed(2)} CHF</TableCell>
                        <TableCell>{sale.customer_name || 'Walk-in'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{sale.payment_display}</Badge>
                        </TableCell>
                        {showMatches && (
                          <TableCell>
                            {confidence !== null && getConfidenceBadge(confidence)}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right: Enhanced Provider Settlements */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Settlements (Netto + Gebühren)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {showMatches && <TableHead className="w-12">Match</TableHead>}
                  <TableHead>Datum</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Brutto</TableHead>
                  <TableHead>Gebühren</TableHead>
                  <TableHead>Netto</TableHead>
                  {showMatches && <TableHead>Confidence</TableHead>}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {showMatches && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      {showMatches && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : unmatchedProviderReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showMatches ? 8 : 7} className="text-center text-muted-foreground py-8">
                      No unmatched provider reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  unmatchedProviderReports.map((report) => {
                    const confidence = getProviderConfidence(report.id)
                    const hasMatch = confidence !== null
                    const matchedSale = hasMatch ? matchCandidates.find(c => c.providerReport.id === report.id)?.sale : null
                    
                    return (
                      <TableRow 
                        key={report.id}
                        data-provider-id={report.id}
                        className={`cursor-pointer transition-colors ${
                          selectedProvider === report.id 
                            ? 'bg-accent border-l-4 border-primary' 
                            : hasMatch 
                              ? 'hover:bg-chart-2/5' 
                              : 'hover:bg-muted/30'
                        } ${hasMatch ? 'bg-chart-2/10' : ''}`}
                        onClick={() => onProviderSelect(report.id)}
                      >
                        {showMatches && (
                          <TableCell>
                            {hasMatch && matchedSale && (
                              <Checkbox
                                checked={selectedMatches.includes(`${matchedSale.id}-${report.id}`)}
                                onCheckedChange={() => handleMatchSelect(matchedSale.id, report.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell>{new Date(report.transaction_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={report.provider === 'twint' ? 'default' : 'secondary'}>
                            {report.provider_display}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.gross_amount.toFixed(2)}</TableCell>
                        <TableCell>{report.fees.toFixed(2)}</TableCell>
                        <TableCell>{report.net_amount.toFixed(2)}</TableCell>
                        {showMatches && (
                          <TableCell>
                            {confidence !== null && getConfidenceBadge(confidence)}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant="outline">Pending</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}