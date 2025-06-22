'use client'

import React, { useState, useEffect } from 'react'
import { X, Download, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import { remoteDebugger } from '@/shared/utils/remoteDebug'

interface InlinePDFViewerProps {
  isOpen: boolean
  pdfUrl: string
  onClose: () => void
  title?: string
}

export function InlinePDFViewer({ isOpen, pdfUrl, onClose, title = 'PDF Dokument' }: InlinePDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    if (isOpen && pdfUrl) {
      remoteDebugger.log('InlinePDFViewer', 'OPEN', { pdfUrl: pdfUrl.substring(0, 100) + '...' })
      setIsLoading(true)
      setError(null)
    }
  }, [isOpen, pdfUrl])

  const handleIframeLoad = () => {
    remoteDebugger.log('InlinePDFViewer', 'IFRAME_LOADED', 'PDF loaded successfully')
    setIsLoading(false)
  }

  const handleIframeError = () => {
    remoteDebugger.log('InlinePDFViewer', 'IFRAME_ERROR', 'PDF failed to load in iframe')
    setError('PDF konnte nicht geladen werden')
    setIsLoading(false)
  }

  const handleDownload = () => {
    remoteDebugger.log('InlinePDFViewer', 'DOWNLOAD_CLICKED', 'User requested download')
    
    try {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${title}.pdf`
      link.click()
    } catch (error) {
      remoteDebugger.log('InlinePDFViewer', 'DOWNLOAD_ERROR', error)
      // Fallback: open in new tab
      window.open(pdfUrl, '_blank')
    }
  }

  const handleExternalOpen = () => {
    remoteDebugger.log('InlinePDFViewer', 'EXTERNAL_OPEN', 'User wants to open externally')
    window.open(pdfUrl, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Verkleinern"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-2">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Vergrößern"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Action Buttons */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
              title="Herunterladen"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleExternalOpen}
              className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
              title="Extern öffnen"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              title="Schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 relative bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">PDF wird geladen...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center p-6">
                <div className="text-red-600 text-lg font-semibold mb-2">{error}</div>
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    PDF herunterladen
                  </button>
                  <button
                    onClick={handleExternalOpen}
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Extern öffnen versuchen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PDF Iframe */}
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (zoom / 100)}%`,
              height: `${100 / (zoom / 100)}%`
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  )
}