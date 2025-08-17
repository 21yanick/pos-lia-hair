'use client'

import { useEffect, useRef, useState } from 'react'

interface BankSettlementConnectorProps {
  selectedItems: string[]
  highlightedItems?: string[] // Auto-highlighted potential matches
  highlightedScores?: Map<string, number> // Scores for highlighted items
  selectedBankTransaction?: string | null // For manual connections
  containerRef: React.RefObject<HTMLDivElement>
}

interface ConnectionLine {
  x1: number
  y1: number
  x2: number
  y2: number
  confidence: number
  isSelected: boolean
  isHighlighted: boolean
  matchType: 'single' | 'combination' | 'provider_bulk' | 'settlement_group'
  itemIds: string[]
}

export function BankSettlementConnector({
  selectedItems,
  highlightedItems = [],
  highlightedScores = new Map(),
  selectedBankTransaction,
  containerRef,
}: BankSettlementConnectorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [lines, setLines] = useState<ConnectionLine[]>([])

  useEffect(() => {
    const calculateLines = () => {
      if (!containerRef.current) {
        setLines([])
        return
      }

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newLines: ConnectionLine[] = []

      // Use manual selection only
      const bankTransactionId = selectedBankTransaction
      if (!bankTransactionId) {
        setLines([])
        return
      }

      // Find the selected bank transaction row
      const bankRow = container.querySelector(
        `[data-bank-id="${bankTransactionId}"]`
      ) as HTMLElement
      if (!bankRow) return

      const bankRect = bankRow.getBoundingClientRect()
      const bankY = bankRect.top - containerRect.top + bankRect.height / 2
      const bankX = bankRect.right - containerRect.left

      if (selectedItems.length > 0) {
        // Manual mode: Create simple connections for selected items
        selectedItems.forEach((itemId) => {
          const itemElement = container.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement
          if (itemElement) {
            const itemRect = itemElement.getBoundingClientRect()
            const itemY = itemRect.top - containerRect.top + itemRect.height / 2
            const itemX = itemRect.left - containerRect.left

            // Use real calculated score for selected items too
            const realScore = highlightedScores.get(itemId) || 100

            // console.log(`🎯 Creating connection line for SELECTED item ${itemId}: realScore=${realScore}`)

            newLines.push({
              x1: bankX,
              y1: bankY,
              x2: itemX,
              y2: itemY,
              confidence: realScore, // Use actual calculated score, not fake 100%
              isSelected: true,
              isHighlighted: highlightedItems.includes(itemId),
              matchType: 'single',
              itemIds: [itemId],
            })
          }
        })
      }

      // Highlighted-only items (not selected, but auto-highlighted as potential matches)
      if (highlightedItems.length > 0) {
        highlightedItems.forEach((itemId) => {
          // Skip if already covered by selected items
          if (selectedItems.includes(itemId)) {
            return
          }

          const itemElement = container.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement
          if (itemElement) {
            const itemRect = itemElement.getBoundingClientRect()
            const itemY = itemRect.top - containerRect.top + itemRect.height / 2
            const itemX = itemRect.left - containerRect.left

            // Use actual calculated score or fallback to 75
            const actualScore = highlightedScores.get(itemId) || 75

            // console.log(`🔗 Creating connection line for highlighted item ${itemId}: score=${actualScore}`)

            newLines.push({
              x1: bankX,
              y1: bankY,
              x2: itemX,
              y2: itemY,
              confidence: actualScore, // Use actual calculated score
              isSelected: false,
              isHighlighted: true,
              matchType: 'single',
              itemIds: [itemId],
            })
          }
        })
      }

      setLines(newLines)
    }

    // Calculate lines initially
    calculateLines()

    // Recalculate on window resize
    const handleResize = () => {
      setTimeout(calculateLines, 100) // Small delay to ensure DOM updates
    }

    window.addEventListener('resize', handleResize)

    // Also recalculate when container size changes (e.g., scrolling)
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  }, [selectedItems, highlightedItems, highlightedScores, selectedBankTransaction, containerRef])

  const getLineColor = (
    confidence: number,
    isSelected: boolean,
    isHighlighted: boolean,
    matchType: string
  ) => {
    // Show selected lines with full opacity, highlighted with lower opacity
    if (!isSelected && !isHighlighted) {
      return 'transparent'
    }

    // console.log(`🎨 Line color for confidence=${confidence}, selected=${isSelected}, highlighted=${isHighlighted}`)

    // Selected items get stronger colors
    if (isSelected) {
      if (confidence >= 90) {
        return '#22c55e' // Green-500 for excellent selected matches
      }
      if (confidence >= 80) {
        return '#3b82f6' // Blue-500 for good selected matches
      }
      if (confidence >= 70) {
        return '#f59e0b' // Amber-500 for fair selected matches
      }
      return '#6b7280' // Gray-500 for poor selected matches
    }

    // Highlighted items get softer colors
    if (isHighlighted) {
      if (confidence >= 90) {
        return '#16a34a' // Green-600 for excellent highlighted
      }
      if (confidence >= 80) {
        return '#2563eb' // Blue-600 for good highlighted
      }
      if (confidence >= 70) {
        return '#d97706' // Amber-600 for fair highlighted
      }
      return '#9ca3af' // Gray-400 for poor highlighted
    }

    return '#6b7280' // Default gray
  }

  const getLineWidth = (
    confidence: number,
    isSelected: boolean,
    isHighlighted: boolean,
    matchType: string
  ) => {
    if (!isSelected && !isHighlighted) return 0

    // Selected items get thicker lines
    if (isSelected) {
      if (confidence >= 90) return 4 // Thick for excellent
      if (confidence >= 80) return 3 // Medium for good
      return 2 // Thin for fair
    }

    // Highlighted items get thinner lines
    if (isHighlighted) {
      return 2 // Always thin for highlighted
    }

    return 2 // Default
  }

  const getLineStyle = (matchType: string) => {
    // Dashed lines for combinations to show they're multi-item
    if (matchType === 'combination') {
      return '5,5'
    }
    return undefined
  }

  const getLineLabel = (confidence: number, matchType: string, itemCount: number) => {
    const percentage = Math.round(confidence)

    // Simple percentage display for better clarity
    const label = `${percentage}%`

    if (matchType === 'settlement_group') {
      return `${label} Settlement`
    }
    if (matchType === 'combination') {
      return `${label} (${itemCount})`
    }
    return label
  }

  if (lines.length === 0) return null

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Gradient for settlement group lines */}
        <linearGradient id="settlementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--payment-twint))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--payment-twint))" stopOpacity="1" />
        </linearGradient>

        {/* Arrow marker for settlement groups */}
        <marker
          id="settlementArrow"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="hsl(var(--payment-twint))" />
        </marker>

        {/* Arrow marker for combinations */}
        <marker
          id="combinationArrow"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="hsl(var(--payment-sumup))" />
        </marker>

        {/* Arrow marker for singles */}
        <marker
          id="singleArrow"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
        </marker>

        {/* Arrow marker for selected items */}
        <marker
          id="selectedArrow"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
        </marker>
      </defs>

      {/* Connection lines */}
      {lines.map((line, index) => (
        <g key={`${line.itemIds.join('-')}-${index}`}>
          {/* Dynamic arrow marker for this specific line */}
          <marker
            id={`arrow-${line.itemIds.join('-')}-${index}`}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill={getLineColor(
                line.confidence,
                line.isSelected,
                line.isHighlighted,
                line.matchType
              )}
            />
          </marker>

          {/* Main line - render if selected OR highlighted */}
          {(line.isSelected || line.isHighlighted) && (
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={
                line.matchType === 'settlement_group'
                  ? 'url(#settlementGradient)'
                  : getLineColor(
                      line.confidence,
                      line.isSelected,
                      line.isHighlighted,
                      line.matchType
                    )
              }
              strokeWidth={getLineWidth(
                line.confidence,
                line.isSelected,
                line.isHighlighted,
                line.matchType
              )}
              strokeDasharray={getLineStyle(line.matchType)}
              markerEnd={`url(#arrow-${line.itemIds.join('-')}-${index})`}
              className="transition-all duration-300"
            />
          )}

          {/* Confidence badge in the middle of the line */}
          {(line.isSelected || line.isHighlighted) && (
            <g>
              <rect
                x={(line.x1 + line.x2) / 2 - 25}
                y={(line.y1 + line.y2) / 2 - 12}
                width="50"
                height="24"
                rx="12"
                fill={getLineColor(
                  line.confidence,
                  line.isSelected,
                  line.isHighlighted,
                  line.matchType
                )}
                className="transition-all duration-300"
                opacity="0.9"
              />
              <text
                x={(line.x1 + line.x2) / 2}
                y={(line.y1 + line.y2) / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {getLineLabel(line.confidence, line.matchType, line.itemIds.length)}
              </text>
            </g>
          )}

          {/* Visual indicator for settlement groups */}
          {(line.isSelected || line.isHighlighted) && line.matchType === 'settlement_group' && (
            <circle
              cx={line.x2 - 20}
              cy={line.y2}
              r="8"
              fill="hsl(var(--payment-twint))"
              className="transition-all duration-300"
              opacity="0.8"
            >
              <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}
    </svg>
  )
}
