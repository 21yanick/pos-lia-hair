/**
 * Remote Debug System for Mobile Devices
 * Shows debug info directly in the UI
 */

interface DebugEntry {
  timestamp: number
  component: string
  event: string
  data: any
}

class RemoteDebugger {
  private logs: DebugEntry[] = []
  private isEnabled = typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    window.location.search.includes('debug=true') ||
    window.location.hostname !== 'localhost' // Always enable on deployed versions
  )
  private maxLogs = 50
  
  log(component: string, event: string, data?: any) {
    if (!this.isEnabled) return

    const entry = {
      timestamp: Date.now(),
      component,
      event,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined
    }

    this.logs.unshift(entry) // Add to beginning
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Also log to console for desktop
    console.log(`🔍 ${component} → ${event}`, data || '')
    
    // Trigger UI update if debug panel is mounted
    this.notifyUpdate()
  }

  private updateCallbacks: Set<() => void> = new Set()
  
  subscribe(callback: () => void) {
    this.updateCallbacks.add(callback)
    return () => this.updateCallbacks.delete(callback)
  }
  
  private notifyUpdate() {
    this.updateCallbacks.forEach(callback => callback())
  }

  getLogs(): DebugEntry[] {
    return [...this.logs]
  }

  clear() {
    this.logs = []
    this.notifyUpdate()
  }

  getEnabled(): boolean {
    return this.isEnabled
  }

  toggle() {
    this.isEnabled = !this.isEnabled
    if (this.isEnabled) {
      this.log('RemoteDebugger', 'ENABLED', 'Debug logging activated')
    }
    this.notifyUpdate()
  }
}

export const remoteDebugger = new RemoteDebugger()

// Make globally accessible
if (typeof window !== 'undefined') {
  (window as any).remoteDebugger = remoteDebugger
}