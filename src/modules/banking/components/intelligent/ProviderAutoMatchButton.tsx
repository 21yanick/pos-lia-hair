'use client'

import { AlertCircle, Brain, CheckCircle2, Loader2, Zap } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import { executeAutoProviderMatch, getProviderMatchSuggestions } from '../../services/bankingApi'
import type { ProviderAutoMatchResult, ProviderMatchResult } from '../../services/matchingTypes'

interface ProviderAutoMatchButtonProps {
  onMatchComplete: () => void
  className?: string
}

export function ProviderAutoMatchButton({
  onMatchComplete,
  className,
}: ProviderAutoMatchButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [suggestions, setSuggestions] = useState<ProviderMatchResult | null>(null)
  const [lastResult, setLastResult] = useState<ProviderAutoMatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 🔒 SECURITY: Multi-Tenant Organization Context
  const { currentOrganization } = useCurrentOrganization()

  const analyzeSuggestions = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      // 🔒 CRITICAL SECURITY: Organization required for multi-tenant security
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt. Bitte wählen Sie eine Organization.')
      }

      const { data, error: apiError } = await getProviderMatchSuggestions(currentOrganization.id)

      if (apiError || !data) {
        // Type-safe error message extraction (Clean Architecture)
        const errorMessage =
          typeof apiError === 'object' && apiError !== null && 'message' in apiError
            ? String(apiError.message)
            : 'Fehler beim Analysieren der Matches'
        throw new Error(errorMessage)
      }

      setSuggestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const executeAutoMatch = async () => {
    if (!suggestions?.autoMatchable?.length) {
      setError('Keine Auto-Match Kandidaten verfügbar')
      return
    }

    setIsMatching(true)
    setError(null)

    try {
      // 🔒 CRITICAL SECURITY: Organization required for multi-tenant security
      if (!currentOrganization) {
        throw new Error('Keine Organization ausgewählt. Bitte wählen Sie eine Organization.')
      }

      const { data, error: apiError } = await executeAutoProviderMatch(
        currentOrganization.id, // ✅ SECURITY: Organization-scoped execution
        suggestions.autoMatchable
      )

      if (apiError || !data) {
        // Type-safe error message extraction (Clean Architecture)
        const errorMessage =
          typeof apiError === 'object' && apiError !== null && 'message' in apiError
            ? String(apiError.message)
            : 'Fehler beim Auto-Matching'
        throw new Error(errorMessage)
      }

      setLastResult(data)

      if (data.success && data.matchedPairs > 0) {
        // Reset suggestions after successful match
        setSuggestions(null)
        onMatchComplete()
      }

      if (data.errors.length > 0) {
        setError(`${data.matchedPairs} Matches erfolgreich, ${data.errors.length} Fehler`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setIsMatching(false)
    }
  }

  // Get current state for UI - Clean Architecture: Explicit null-safety
  const autoMatchCount = suggestions?.summary.autoMatchCount ?? 0
  const reviewCount = suggestions?.summary.reviewCount ?? 0
  const hasAutoMatches = Boolean(autoMatchCount > 0)
  const hasReviewMatches = reviewCount > 0

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Action Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={suggestions ? executeAutoMatch : analyzeSuggestions}
          disabled={isAnalyzing || isMatching || (Boolean(suggestions) && !hasAutoMatches)}
          variant={hasAutoMatches ? 'default' : 'outline'}
          size="lg"
          className="flex-1"
        >
          {isAnalyzing ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              Analysiere Matches...
            </>
          ) : isMatching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Führe Auto-Match aus...
            </>
          ) : suggestions ? (
            hasAutoMatches ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Auto-Match: {autoMatchCount} Paare
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Keine Auto-Matches
              </>
            )
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Intelligente Analyse
            </>
          )}
        </Button>

        {/* Refresh Analysis Button */}
        {suggestions && (
          <Button onClick={analyzeSuggestions} disabled={isAnalyzing} variant="outline" size="lg">
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Status Badges */}
      {suggestions && (
        <div className="flex gap-2 flex-wrap">
          {hasAutoMatches && (
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {autoMatchCount} Auto-Match (≥95%)
            </Badge>
          )}
          {hasReviewMatches && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              {reviewCount} Review erforderlich
            </Badge>
          )}
          {!hasAutoMatches && !hasReviewMatches && (
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              Keine Matches gefunden
            </Badge>
          )}
        </div>
      )}

      {/* Success Message */}
      {lastResult?.success && lastResult.matchedPairs > 0 && (
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
      {suggestions && suggestions.summary.totalCandidates > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-800">Intelligente Analyse</span>
          </div>
          <div className="space-y-1">
            <div>
              📊 <strong>{suggestions.summary.totalCandidates}</strong> Kandidaten gefunden
            </div>
            <div>
              🎯 Höchste Confidence: <strong>{suggestions.summary.highestConfidence}%</strong>
            </div>
            {hasAutoMatches && (
              <div className="text-green-700 font-medium">
                ⚡ {autoMatchCount} Paare bereit für Auto-Match
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
