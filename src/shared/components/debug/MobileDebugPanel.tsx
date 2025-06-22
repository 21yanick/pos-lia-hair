'use client'

import React, { useState, useEffect } from 'react'
import { remoteDebugger } from '@/shared/utils/remoteDebug'

export function MobileDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState(remoteDebugger.getLogs())
  const [isEnabled, setIsEnabled] = useState(remoteDebugger.getEnabled())

  useEffect(() => {
    const unsubscribe = remoteDebugger.subscribe(() => {
      setLogs(remoteDebugger.getLogs())
      setIsEnabled(remoteDebugger.getEnabled())
    })
    return unsubscribe
  }, [])

  if (!isEnabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => remoteDebugger.toggle()}
          className="bg-blue-500 text-white px-3 py-2 rounded-full text-sm"
        >
          🔍 Debug
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`${isOpen ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-2 rounded-full text-sm shadow-lg`}
        >
          {isOpen ? '✕' : '🔍'} {logs.length}
        </button>
      </div>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-40 overflow-hidden">
          <div className="bg-white h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Mobile Debug Logs</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => remoteDebugger.clear()}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No logs yet. Interact with the app to see debug info.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono text-sm font-bold text-blue-600">
                        {log.component}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="font-mono text-sm mb-2 text-green-700">
                      {log.event}
                    </div>
                    {log.data && (
                      <div className="bg-gray-100 p-2 rounded font-mono text-xs overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          {typeof log.data === 'string' 
                            ? log.data 
                            : JSON.stringify(log.data, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t bg-gray-100 space-y-2">
              <div className="text-sm text-gray-600 mb-2">Quick Tests:</div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    // Test PDF with data URL
                    import('@/shared/utils/testPdf').then(({ testPdf }) => {
                      testPdf.testPDFOpen('data-url')
                    })
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Test PDF (Data)
                </button>
                <button 
                  onClick={() => {
                    // Test PDF with public URL
                    import('@/shared/utils/testPdf').then(({ testPdf }) => {
                      testPdf.testPDFOpen('public-url')
                    })
                  }}
                  className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
                >
                  Test PDF (URL)
                </button>
                <button 
                  onClick={() => {
                    // Show current state
                    remoteDebugger.log('DEBUG_PANEL', 'CURRENT_STATE', {
                      url: window.location.href,
                      userAgent: navigator.userAgent,
                      storage: {
                        pdfReturnUrl: sessionStorage.getItem('pdf_return_url'),
                        pdfOrgBackup: sessionStorage.getItem('pdf_org_backup'),
                        pdfRestoreFlag: sessionStorage.getItem('pdf_restore_flag')
                      }
                    })
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Show State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}