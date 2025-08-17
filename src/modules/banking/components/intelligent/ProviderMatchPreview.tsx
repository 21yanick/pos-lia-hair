'use client'

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { formatDateForDisplay } from '@/shared/utils/dateUtils'
import type { ProviderMatchCandidate } from '../../services/matchingTypes'

interface ProviderMatchPreviewProps {
  isOpen: boolean
  onClose: () => void
  matchCandidates: ProviderMatchCandidate[]
  onExecuteMatches: (selectedCandidates: ProviderMatchCandidate[]) => void
  isExecuting?: boolean
}

export function ProviderMatchPreview({
  isOpen,
  onClose,
  matchCandidates,
  onExecuteMatches,
  isExecuting = false,
}: ProviderMatchPreviewProps) {
  const [selectedMatches, setSelectedMatches] = useState<string[]>(
    // Pre-select high confidence matches (95%+)
    matchCandidates
      .filter((candidate) => candidate.confidence >= 95)
      .map((candidate) => `${candidate.sale.id}-${candidate.providerReport.id}`)
  )

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(amount)
  }

  // Use dateUtils formatDateForDisplay for consistent formatting

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 80) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 95) return <CheckCircle2 className="w-4 h-4" />
    if (confidence >= 80) return <Target className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  const handleMatchToggle = (candidateId: string) => {
    setSelectedMatches((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    )
  }

  const handleSelectAll = (onlyHighConfidence = false) => {
    const candidates = onlyHighConfidence
      ? matchCandidates.filter((c) => c.confidence >= 95)
      : matchCandidates

    setSelectedMatches(candidates.map((c) => `${c.sale.id}-${c.providerReport.id}`))
  }

  const handleDeselectAll = () => {
    setSelectedMatches([])
  }

  const executeSelectedMatches = () => {
    const selectedCandidates = matchCandidates.filter((candidate) =>
      selectedMatches.includes(`${candidate.sale.id}-${candidate.providerReport.id}`)
    )
    onExecuteMatches(selectedCandidates)
  }

  const selectedCount = selectedMatches.length
  const autoMatchCount = matchCandidates.filter((c) => c.confidence >= 95).length
  const reviewCount = matchCandidates.filter((c) => c.confidence < 95).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[90vw] h-[85vh] p-0 flex flex-col">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Provider Match Vorschau
            </DialogTitle>
            <DialogDescription>
              {matchCandidates.length} Matching-Kandidaten gefunden. Wählen Sie aus, welche Matches
              ausgeführt werden sollen.
            </DialogDescription>
          </DialogHeader>

          {/* Summary Stats */}
          <div className="flex gap-2 mt-4 mb-4">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Zap className="w-3 h-3 mr-1" />
              {autoMatchCount} Auto-Match (≥95%)
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
              <AlertCircle className="w-3 h-3 mr-1" />
              {reviewCount} Review (&lt;95%)
            </Badge>
            <Badge variant="secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              {selectedCount} ausgewählt
            </Badge>
          </div>

          {/* Selection Controls */}
          <div className="flex gap-2 mb-4">
            <Button onClick={() => handleSelectAll(true)} variant="outline" size="sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Auto-Match auswählen
            </Button>
            <Button onClick={() => handleSelectAll(false)} variant="outline" size="sm">
              Alle auswählen
            </Button>
            <Button onClick={handleDeselectAll} variant="outline" size="sm">
              Alle abwählen
            </Button>
          </div>
        </div>

        {/* Match Candidates List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 min-h-0">
          {matchCandidates.map((candidate) => {
            const candidateId = `${candidate.sale.id}-${candidate.providerReport.id}`
            const isSelected = selectedMatches.includes(candidateId)

            return (
              <Card
                key={candidateId}
                className={`transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-300 bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Selection Checkbox */}
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleMatchToggle(candidateId)}
                      className="flex-shrink-0"
                    />

                    {/* Confidence Badge */}
                    <Badge
                      className={`${getConfidenceColor(candidate.confidence)} flex items-center gap-1`}
                    >
                      {getConfidenceIcon(candidate.confidence)}
                      {candidate.confidence}%
                    </Badge>

                    {/* Match Details */}
                    <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                      {/* Sale Info */}
                      <div className="space-y-1">
                        <div className="font-medium text-sm">POS Sale</div>
                        <div className="text-lg font-semibold">
                          {formatAmount(candidate.sale.total_amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateForDisplay(candidate.sale.created_at)} •{' '}
                          {candidate.sale.payment_display}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>

                      {/* Provider Report Info */}
                      <div className="space-y-1">
                        <div className="font-medium text-sm">Provider Report</div>
                        <div className="text-lg font-semibold">
                          {formatAmount(candidate.providerReport.gross_amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateForDisplay(candidate.providerReport.transaction_date)} •{' '}
                          {candidate.providerReport.provider_display}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {candidate.matchReasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-gray-500">
                    <div>
                      Betrag-Diff: {formatAmount(Math.abs(candidate.details.amountDifference))}
                    </div>
                    <div>Tage-Diff: {candidate.details.daysDifference}</div>
                    <div>Provider: {candidate.details.providerMatches ? '✅' : '❌'}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer with warnings and actions */}
        <div className="px-6 pb-6">
          {/* Warning for low confidence selections */}
          {selectedMatches.some((id) => {
            const candidate = matchCandidates.find(
              (c) => `${c.sale.id}-${c.providerReport.id}` === id
            )
            return candidate && candidate.confidence < 80
          }) && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sie haben Matches mit niedriger Confidence (&lt;80%) ausgewählt. Bitte überprüfen
                Sie diese sorgfältig.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose} disabled={isExecuting}>
              Abbrechen
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={executeSelectedMatches}
                disabled={selectedCount === 0 || isExecuting}
                className="min-w-[200px]"
              >
                {isExecuting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Führe {selectedCount} Matches aus...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {selectedCount} Matches ausführen
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
