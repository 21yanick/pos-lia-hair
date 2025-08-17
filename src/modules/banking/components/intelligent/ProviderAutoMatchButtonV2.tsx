'use client'

import { AlertCircle, Brain, CheckCircle2, Eye, Loader2, RotateCcw, Zap } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { createProviderMatch, getProviderMatchSuggestions } from '../../services/bankingApi'
import type {
  ProviderAutoMatchResult,
  ProviderMatchCandidate,
  ProviderMatchResult,
} from '../../services/matchingTypes'
import { ProviderMatchPreview } from './ProviderMatchPreview'

interface ProviderAutoMatchButtonV2Props {
  onMatchComplete: () => void
  onAnalysisComplete?: (candidates: ProviderMatchCandidate[]) => void
  className?: string
}

type AnalysisPhase = 'idle' | 'analyzing' | 'preview' | 'executing' | 'completed'

export function ProviderAutoMatchButtonV2({
  onMatchComplete,
  onAnalysisComplete,
  className,
}: ProviderAutoMatchButtonV2Props) {
  const [phase, setPhase] = useState<AnalysisPhase>('idle')
  const [suggestions, setSuggestions] = useState<ProviderMatchResult | null>(null)
  const [lastResult, setLastResult] = useState<ProviderAutoMatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const startAnalysis = async () => {
    setPhase('analyzing')
    setError(null)
    setLastResult(null)

    try {
      const { data, error: apiError } = await getProviderMatchSuggestions()

      if (apiError || !data) {
        throw new Error(apiError?.message || 'Fehler beim Analysieren der Matches')
      }

      setSuggestions(data)
      setPhase('preview')

      // Notify parent about found candidates
      onAnalysisComplete?.(data.candidates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setPhase('idle')
    }
  }

  const openPreview = () => {
    setShowPreview(true)
  }

  const closePreview = () => {
    setShowPreview(false)
  }

  const executeSelectedMatches = async (selectedCandidates: ProviderMatchCandidate[]) => {
    setPhase('executing')
    setShowPreview(false)
    setError(null)

    try {
      const processedCandidates: ProviderMatchCandidate[] = []
      const errors: string[] = []
      let matchedPairs = 0

      // Execute matches one by one for better error handling
      for (const candidate of selectedCandidates) {
        try {
          const matchResult = await createProviderMatch(
            candidate.sale.id,
            candidate.providerReport.id
          )

          if (matchResult.success) {
            matchedPairs++
            processedCandidates.push(candidate)
          } else {
            errors.push(
              `Sale ${candidate.sale.id}: ${matchResult.error?.message || 'Unbekannter Fehler'}`
            )
          }
        } catch (error) {
          errors.push(
            `Sale ${candidate.sale.id}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
          )
        }
      }

      const result: ProviderAutoMatchResult = {
        success: errors.length === 0,
        matchedPairs,
        errors,
        processedCandidates,
      }

      setLastResult(result)
      setPhase('completed')

      if (matchedPairs > 0) {
        onMatchComplete()
      }

      if (errors.length > 0) {
        setError(`${matchedPairs} Matches erfolgreich, ${errors.length} Fehler`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setPhase('preview')
    }
  }

  const resetToIdle = () => {
    setPhase('idle')
    setSuggestions(null)
    setLastResult(null)
    setError(null)
  }

  // Get current state for UI
  const totalCandidates = suggestions?.summary.totalCandidates || 0
  const autoMatchCount = suggestions?.summary.autoMatchCount || 0
  const reviewCount = suggestions?.summary.reviewCount || 0

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Action Button */}
      <div className="flex items-center gap-3">
        {phase === 'idle' && (
          <Button onClick={startAnalysis} variant="outline" size="lg" className="flex-1">
            <Brain className="w-4 h-4 mr-2" />
            Intelligente Analyse starten
          </Button>
        )}

        {phase === 'analyzing' && (
          <Button disabled variant="outline" size="lg" className="flex-1">
            <Brain className="w-4 h-4 mr-2 animate-pulse" />
            Analysiere Matches...
          </Button>
        )}

        {phase === 'preview' && (
          <>
            <Button onClick={openPreview} variant="default" size="lg" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              {totalCandidates} Matches gefunden - Vorschau
            </Button>
            <Button onClick={resetToIdle} variant="outline" size="lg">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}

        {phase === 'executing' && (
          <Button disabled variant="default" size="lg" className="flex-1">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Führe Matches aus...
          </Button>
        )}

        {phase === 'completed' && (
          <Button onClick={resetToIdle} variant="outline" size="lg" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Neue Analyse
          </Button>
        )}
      </div>

      {/* Status Badges */}
      {phase === 'preview' && suggestions && (
        <div className="flex gap-2 flex-wrap">
          {autoMatchCount > 0 && (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <Zap className="w-3 h-3 mr-1" />
              {autoMatchCount} Auto-Match (≥95%)
            </Badge>
          )}
          {reviewCount > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              {reviewCount} Review erforderlich
            </Badge>
          )}
          {totalCandidates === 0 && (
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              Keine Matches gefunden
            </Badge>
          )}
        </div>
      )}

      {/* Success Message */}
      {phase === 'completed' && lastResult?.success && lastResult.matchedPairs > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Erfolgreich!</strong> {lastResult.matchedPairs} Provider-Matches automatisch
            erstellt.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Details */}
      {phase === 'preview' && suggestions && totalCandidates > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Intelligente Analyse</span>
          </div>
          <div className="space-y-1">
            <div>
              📊 <strong>{totalCandidates}</strong> Kandidaten gefunden
            </div>
            <div>
              🎯 Höchste Confidence: <strong>{suggestions.summary.highestConfidence}%</strong>
            </div>
            {autoMatchCount > 0 && (
              <div className="text-green-700 font-medium">
                ⚡ {autoMatchCount} Paare bereit für Auto-Match
              </div>
            )}
            <div className="text-blue-700 font-medium mt-2">
              👁️ Klicken Sie "Vorschau" um Details zu sehen und Matches auszuwählen
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {suggestions && (
        <ProviderMatchPreview
          isOpen={showPreview}
          onClose={closePreview}
          matchCandidates={suggestions.candidates}
          onExecuteMatches={executeSelectedMatches}
          isExecuting={phase === 'executing'}
        />
      )}
    </div>
  )
}
