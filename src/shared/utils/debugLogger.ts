/**
 * Debug logger for PDF return issues
 */

interface DebugState {
  timestamp: number
  component: string
  event: string
  data: any
}

class DebugLogger {
  private logs: DebugState[] = []
  private isEnabled = true // Enable for debugging

  log(component: string, event: string, data?: any) {
    if (!this.isEnabled) return

    const logEntry = {
      timestamp: Date.now(),
      component,
      event,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined
    }

    this.logs.push(logEntry)
    
    // Also log to console with clear formatting
    const time = new Date(logEntry.timestamp).toISOString().substring(11, 23)
    console.log(`🔍 [${time}] ${component} → ${event}`, data || '')

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100)
    }
  }

  getLogs(): DebugState[] {
    return [...this.logs]
  }

  getLogsSince(timestamp: number): DebugState[] {
    return this.logs.filter(log => log.timestamp > timestamp)
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  clear() {
    this.logs = []
    console.log('🔍 Debug logs cleared')
  }

  // Special method for critical state tracking
  trackState(component: string, state: any) {
    const stateString = Object.entries(state)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
    
    this.log(component, 'STATE', state)
  }
}

export const debugLogger = new DebugLogger()

// Make it globally accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).debugLogger = debugLogger
}