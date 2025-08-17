'use client'

import { useEffect, useRef, useState } from 'react'
import type { ProviderMatchCandidate } from '../../services/matchingTypes'

interface ProviderMatchConnectorProps {
  matchCandidates: ProviderMatchCandidate[]
  selectedMatches: string[]
  containerRef: React.RefObject<HTMLDivElement>
}

interface ConnectionLine {
  x1: number
  y1: number
  x2: number
  y2: number
  confidence: number
  isSelected: boolean
  matchId: string
}

export function ProviderMatchConnector({
  matchCandidates,
  selectedMatches,
  containerRef,
}: ProviderMatchConnectorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [lines, setLines] = useState<ConnectionLine[]>([])

  useEffect(() => {
    const calculateLines = () => {
      if (!containerRef.current || matchCandidates.length === 0) {
        setLines([])
        return
      }

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()

      const newLines: ConnectionLine[] = []

      matchCandidates.forEach((candidate) => {
        const matchId = `${candidate.sale.id}-${candidate.providerReport.id}`
        const isSelected = selectedMatches.includes(matchId)

        // Find the sale row
        const saleRow = container.querySelector(
          `[data-sale-id="${candidate.sale.id}"]`
        ) as HTMLElement
        // Find the provider row
        const providerRow = container.querySelector(
          `[data-provider-id="${candidate.providerReport.id}"]`
        ) as HTMLElement

        if (saleRow && providerRow) {
          const saleRect = saleRow.getBoundingClientRect()
          const providerRect = providerRow.getBoundingClientRect()

          // Calculate positions relative to container
          const saleY = saleRect.top - containerRect.top + saleRect.height / 2
          const providerY = providerRect.top - containerRect.top + providerRect.height / 2

          // X positions: end of left table to start of right table
          const saleX = saleRect.right - containerRect.left
          const providerX = providerRect.left - containerRect.left

          newLines.push({
            x1: saleX,
            y1: saleY,
            x2: providerX,
            y2: providerY,
            confidence: candidate.confidence,
            isSelected,
            matchId,
          })
        }
      })

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
  }, [matchCandidates, selectedMatches, containerRef])

  const getLineColor = (confidence: number, isSelected: boolean) => {
    // Only show selected lines now
    if (!isSelected) {
      return 'transparent' // Hide unselected lines
    }

    if (confidence >= 95) {
      return 'hsl(var(--success))' // Success color for high confidence
    }
    if (confidence >= 80) {
      return 'hsl(var(--chart-1))' // Chart-1 for medium-high confidence
    }
    if (confidence >= 60) {
      return 'hsl(var(--chart-2))' // Chart-2 for medium confidence
    }
    return 'hsl(var(--muted-foreground))'
  }

  const getLineWidth = (confidence: number, isSelected: boolean) => {
    if (!isSelected) return 0 // No width for transparent lines

    if (confidence >= 95) return 4 // Thicker for high confidence
    if (confidence >= 80) return 3
    return 2
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
      {/* Connection lines */}
      {lines.map((line, index) => (
        <g key={`${line.matchId}-${index}`}>
          {/* Main line - only render if selected */}
          {line.isSelected && (
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={getLineColor(line.confidence, line.isSelected)}
              strokeWidth={getLineWidth(line.confidence, line.isSelected)}
              className="transition-all duration-300"
            />
          )}

          {/* Arrow head for selected lines */}
          {line.isSelected && (
            <polygon
              points={`${line.x2 - 8},${line.y2 - 4} ${line.x2},${line.y2} ${line.x2 - 8},${line.y2 + 4}`}
              fill={getLineColor(line.confidence, line.isSelected)}
              className="transition-all duration-300"
            />
          )}

          {/* Confidence badge in the middle of the line */}
          {line.isSelected && (
            <g>
              <rect
                x={(line.x1 + line.x2) / 2 - 20}
                y={(line.y1 + line.y2) / 2 - 10}
                width="40"
                height="20"
                rx="10"
                fill={getLineColor(line.confidence, line.isSelected)}
                className="transition-all duration-300"
              />
              <text
                x={(line.x1 + line.x2) / 2}
                y={(line.y1 + line.y2) / 2 + 4}
                textAnchor="middle"
                fontSize="12"
                fill="white"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {line.confidence}%
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}
