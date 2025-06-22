'use client'

import React, { useState, useEffect } from 'react'
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

// Dynamic imports to avoid build issues with canvas node bindings
// import { Viewer, Worker } from '@react-pdf-viewer/core'
// import '@react-pdf-viewer/core/lib/styles/index.css'
// import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
// import '@react-pdf-viewer/default-layout/lib/styles/index.css'

interface EnterprisePDFViewerProps {
  isOpen: boolean
  pdfUrl: string
  onClose: () => void
  title?: string
}

export function EnterprisePDFViewer({ 
  isOpen, 
  pdfUrl, 
  onClose, 
  title = 'PDF Dokument' 
}: EnterprisePDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [isPackageReady, setIsPackageReady] = useState(false)

  // Skip dynamic imports during build to avoid canvas node binding issues
  useEffect(() => {
    // Only try dynamic imports in browser environment
    if (typeof window === 'undefined') {
      setIsPackageReady(false)
      return
    }
    
    const checkPackages = async () => {
      try {
        // Check if packages are available without importing them during build
        setIsPackageReady(false) // Use fallback iframe viewer for now
      } catch (error) {
        console.warn('PDF viewer packages not available:', error)
        setIsPackageReady(false)
      }
    }
    
    checkPackages()
  }, [])

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setIsLoading(true)
      setError(null)
    }
  }, [isOpen, pdfUrl])

  const handleDownload = async () => {
    try {
      // Create download link
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${title}.pdf`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: open in new tab
      window.open(pdfUrl, '_blank')
    }
  }

  const handleExternalOpen = () => {
    window.open(pdfUrl, '_blank')
  }

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  // Show fallback iframe viewer if packages not ready
  if (!isPackageReady) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b">
            <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
              {title}
            </h3>
            <div className="flex items-center gap-2">
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
                <ExternalLink className="w-4 h-4" />
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

          {/* Fallback: Simple iframe */}
          <div className="flex-1 relative bg-gray-100">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">PDF wird geladen...</span>
                </div>
              </div>
            )}

            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('PDF konnte nicht geladen werden')
                setIsLoading(false)
              }}
              title={title}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="text-center p-6">
                  <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
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
                      Extern öffnen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Enhanced viewer with @react-pdf-viewer (will work after packages are installed)
  return (
    <EnhancedPDFViewer
      isOpen={isOpen}
      pdfUrl={pdfUrl}
      onClose={onClose}
      title={title}
    />
  )
}

// Enhanced viewer component (will be uncommented after package installation)
function EnhancedPDFViewer({ 
  isOpen, 
  pdfUrl, 
  onClose, 
  title 
}: EnterprisePDFViewerProps) {
  // This will be implemented once packages are available
  // const defaultLayoutPluginInstance = defaultLayoutPlugin()

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90">
      <div className="flex flex-col h-full">
        {/* Header with enhanced controls */}
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
              title="Herunterladen"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
              title="Extern öffnen"
            >
              <ExternalLink className="w-4 h-4" />
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

        {/* PDF Viewer Content */}
        <div className="flex-1 relative">
          {/* 
          TODO: Uncomment after package installation:
          
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={pdfUrl}
              plugins={[defaultLayoutPluginInstance]}
              onLoadSuccess={() => setIsLoading(false)}
              onLoadError={(error) => setError(error.message)}
            />
          </Worker>
          */}
          
          {/* Temporary fallback */}
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="text-lg mb-4">Enhanced PDF Viewer wird geladen...</div>
              <div className="text-sm opacity-75">
                @react-pdf-viewer packages werden installiert
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}