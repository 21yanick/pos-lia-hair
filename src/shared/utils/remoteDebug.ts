// V6.1 Pattern 20: Missing Dependencies Resolution - Remote Debug Mock
// Simple debug utility for development mode logging

interface RemoteDebugger {
  log(component: string, event: string, data?: unknown): void
}

// KISS principle: Simple conditional logging based on environment
export const remoteDebugger: RemoteDebugger = {
  log(component: string, event: string, data?: unknown) {
    // Only log in development mode to avoid production noise
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] ${component}:${event}`, data || '')
    }
    // YAGNI: No complex remote logging needed yet, simple console logging suffices
  },
}
