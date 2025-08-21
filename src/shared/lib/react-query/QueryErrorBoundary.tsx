'use client'

import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import type React from 'react'
import { Component, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

interface QueryErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  isOnline: boolean
}

interface QueryErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * Error Boundary specifically designed for React Query errors
 *
 * Features:
 * - Graceful error handling for data fetching
 * - Network connectivity awareness
 * - User-friendly error messages
 * - Retry functionality
 * - Automatic error reporting
 */
export class QueryErrorBoundary extends Component<
  QueryErrorBoundaryProps,
  QueryErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: QueryErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  static getDerivedStateFromError(error: Error): Partial<QueryErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo,
    })

    // Log error for debugging
    // console.error('🚨 QueryErrorBoundary caught an error:', error, errorInfo)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo)
    }
  }

  handleOnline = () => {
    this.setState({ isOnline: true })

    // Auto-retry when coming back online
    if (this.state.hasError) {
      toast.success('Verbindung wiederhergestellt - Versuche erneut...')
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry()
      }, 1000)
    }
  }

  handleOffline = () => {
    this.setState({ isOnline: false })
    toast.error('Keine Internetverbindung')
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // Trigger a re-render by forcing a state update
    this.forceUpdate()
  }

  reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Here you would integrate with your error reporting service
    // e.g., Sentry, LogRocket, Bugsnag, etc.

    try {
      const _errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        isOnline: this.state.isOnline,
      }

      // In a real app, send this to your error tracking service
      // console.log('📊 Error Report:', errorReport)
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  getErrorMessage = (error: Error) => {
    // Parse common error types and provide user-friendly messages

    if (!this.state.isOnline) {
      return {
        title: 'Keine Internetverbindung',
        description: 'Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
        isNetworkError: true,
      }
    }

    // Network/API errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        title: 'Verbindungsfehler',
        description: 'Es gab ein Problem beim Laden der Daten. Bitte versuchen Sie es erneut.',
        isNetworkError: true,
      }
    }

    // Authentication errors
    if (
      error.message.includes('auth') ||
      error.message.includes('401') ||
      error.message.includes('403')
    ) {
      return {
        title: 'Anmeldung erforderlich',
        description: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
        isAuthError: true,
      }
    }

    // Organization/Permission errors
    if (error.message.includes('organization') || error.message.includes('permission')) {
      return {
        title: 'Zugriff verweigert',
        description: 'Sie haben keine Berechtigung für diese Aktion oder Organisation.',
        isPermissionError: true,
      }
    }

    // Generic errors
    return {
      title: 'Ein Fehler ist aufgetreten',
      description:
        error.message || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      isGenericError: true,
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default error UI
      const { title, description, isNetworkError, isAuthError, isPermissionError } =
        this.getErrorMessage(this.state.error)

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                {isNetworkError ? (
                  this.state.isOnline ? (
                    <Wifi className="h-5 w-5 text-destructive" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-destructive" />
                  )
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <CardTitle className="text-destructive">{title}</CardTitle>
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Entwicklerinfo</AlertTitle>
                  <AlertDescription className="text-xs font-mono">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  disabled={!this.state.isOnline && isNetworkError}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Erneut versuchen
                </Button>

                {(isAuthError || isPermissionError) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = '/login'
                    }}
                    className="flex-1"
                  >
                    Anmelden
                  </Button>
                )}
              </div>

              {/* Network Status */}
              {isNetworkError && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {this.state.isOnline ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      Offline
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier usage
export function QueryErrorWrapper({ children, ...props }: QueryErrorBoundaryProps) {
  return <QueryErrorBoundary {...props}>{children}</QueryErrorBoundary>
}

export default QueryErrorBoundary
