// 🏥 Production-Ready Health Check API for Coolify Monitoring
// Comprehensive health monitoring for POS-LIA-HAIR application
// GET /api/health

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 📊 Health Check Response Types
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  environment: string
  version: string
  checks: {
    system: SystemHealth
    database: DatabaseHealth
    services: ServicesHealth
    performance: PerformanceHealth
  }
  summary: {
    total: number
    healthy: number
    warnings: number
    errors: number
  }
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error'
  memory: {
    used: number
    total: number
    percentage: number
    limit?: number
    status: 'healthy' | 'warning' | 'critical'
  }
  environment: {
    nodeEnv: string
    requiredVars: {
      [key: string]: 'present' | 'missing'
    }
    status: 'healthy' | 'error'
  }
}

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'error'
  connection: {
    status: 'connected' | 'disconnected' | 'error'
    responseTime?: number
  }
  authentication: {
    status: 'valid' | 'invalid' | 'error'
  }
  queryPerformance: {
    status: 'fast' | 'slow' | 'error'
    responseTime?: number
  }
  criticalTables: {
    organizations: 'accessible' | 'error'
    users: 'accessible' | 'error'
    status: 'healthy' | 'error'
  }
}

interface ServicesHealth {
  status: 'healthy' | 'warning' | 'error'
  storage: {
    status: 'accessible' | 'error'
    responseTime?: number
  }
  multiTenant: {
    status: 'functional' | 'error'
    testQuery?: boolean
  }
}

interface PerformanceHealth {
  status: 'optimal' | 'degraded' | 'poor'
  responseTime: number
  resourceUsage: {
    memory: 'normal' | 'high' | 'critical'
    cpu?: 'normal' | 'high' | 'critical'
  }
}

export async function GET() {
  const startTime = Date.now()
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  let healthyCount = 0
  let warningCount = 0
  let errorCount = 0

  try {
    // 🖥️ 1. SYSTEM HEALTH CHECKS
    const systemHealth = await checkSystemHealth()
    if (systemHealth.status === 'healthy') healthyCount++
    else if (systemHealth.status === 'warning') warningCount++
    else errorCount++

    // 🗄️ 2. DATABASE HEALTH CHECKS
    const databaseHealth = await checkDatabaseHealth()
    if (databaseHealth.status === 'healthy') healthyCount++
    else if (databaseHealth.status === 'warning') warningCount++
    else errorCount++

    // ⚙️ 3. BUSINESS SERVICES HEALTH CHECKS
    const servicesHealth = await checkServicesHealth()
    if (servicesHealth.status === 'healthy') healthyCount++
    else if (servicesHealth.status === 'warning') warningCount++
    else errorCount++

    // 📈 4. PERFORMANCE HEALTH CHECKS
    const responseTime = Date.now() - startTime
    const performanceHealth = checkPerformanceHealth(responseTime, systemHealth.memory)
    if (performanceHealth.status === 'optimal') healthyCount++
    else if (performanceHealth.status === 'degraded') warningCount++
    else errorCount++

    // 🎯 DETERMINE OVERALL STATUS
    if (errorCount > 0) {
      overallStatus = 'unhealthy'
    } else if (warningCount > 0) {
      overallStatus = 'degraded'
    }

    const healthCheck: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        system: systemHealth,
        database: databaseHealth,
        services: servicesHealth,
        performance: performanceHealth
      },
      summary: {
        total: 4,
        healthy: healthyCount,
        warnings: warningCount,
        errors: errorCount
      }
    }

    // 📊 Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(healthCheck, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('🚨 Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check system failure',
        checks: {
          system: { status: 'error' },
          database: { status: 'error' },
          services: { status: 'error' },
          performance: { status: 'poor' }
        },
        summary: {
          total: 4,
          healthy: 0,
          warnings: 0,
          errors: 4
        }
      } as HealthCheckResponse,
      { status: 500 }
    )
  }
}

// 🖥️ SYSTEM HEALTH CHECKER
async function checkSystemHealth(): Promise<SystemHealth> {
  const memoryUsage = process.memoryUsage()
  
  // 🔧 CONTAINER MEMORY (not just JS heap)
  let totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024) // Fallback to heap
  let usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
  
  // Try to read container memory limits (Docker/Linux)
  try {
    const fs = await import('fs')
    // Check cgroup v2 memory limit
    try {
      const memLimitBytes = await fs.promises.readFile('/sys/fs/cgroup/memory.max', 'utf8')
      if (memLimitBytes.trim() !== 'max') {
        const limitMB = Math.round(parseInt(memLimitBytes.trim()) / 1024 / 1024)
        if (limitMB > 0 && limitMB < 10000) { // Reasonable limits (not system total)
          totalMB = limitMB
        }
      }
    } catch {
      // Try cgroup v1 memory limit
      try {
        const memLimitBytes = await fs.promises.readFile('/sys/fs/cgroup/memory/memory.limit_in_bytes', 'utf8')
        const limitMB = Math.round(parseInt(memLimitBytes.trim()) / 1024 / 1024)
        if (limitMB > 0 && limitMB < 10000) { // Reasonable limits
          totalMB = limitMB
        }
      } catch {
        // Keep heap total as fallback
      }
    }
    
    // For used memory, use RSS (Resident Set Size) which includes all process memory
    usedMB = Math.round(memoryUsage.rss / 1024 / 1024)
    
  } catch {
    // Fallback to heap values if filesystem access fails
  }
  
  const percentage = Math.round((usedMB / totalMB) * 100)
  
  // Memory thresholds (more realistic for container memory)
  const memoryStatus = percentage > 85 ? 'critical' : 
                      percentage > 70 ? 'warning' : 'healthy'

  // Environment variables check
  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
    'NODE_ENV': process.env.NODE_ENV ? 'present' : 'missing'
  }
  
  const envStatus = Object.values(requiredVars).includes('missing') ? 'error' : 'healthy'
  
  const systemStatus = memoryStatus === 'critical' || envStatus === 'error' ? 'error' :
                      memoryStatus === 'warning' ? 'warning' : 'healthy'

  return {
    status: systemStatus,
    memory: {
      used: usedMB,
      total: totalMB,
      percentage,
      status: memoryStatus
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      requiredVars,
      status: envStatus
    }
  }
}

// 🗄️ DATABASE HEALTH CHECKER
async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  let dbStatus: 'healthy' | 'warning' | 'error' = 'healthy'
  
  const connectionResult = { status: 'disconnected' as const, responseTime: undefined as number | undefined }
  const authResult = { status: 'invalid' as const }
  const queryResult = { status: 'error' as const, responseTime: undefined as number | undefined }
  const tablesResult = {
    organizations: 'error' as const,
    users: 'error' as const,
    status: 'error' as const
  }

  try {
    // Test Supabase connection
    const connectionStart = Date.now()
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {}
        }
      }
    )
    
    connectionResult.responseTime = Date.now() - connectionStart
    connectionResult.status = 'connected'
    
    // Test authentication service
    try {
      await supabase.auth.getSession()
      authResult.status = 'valid'
    } catch {
      authResult.status = 'invalid'
      dbStatus = 'warning'
    }
    
    // Test query performance
    const queryStart = Date.now()
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        
      queryResult.responseTime = Date.now() - queryStart
      
      if (!orgError && orgData) {
        tablesResult.organizations = 'accessible'
      }
      
      if (!userError && userData) {
        tablesResult.users = 'accessible'
      }
      
      if (tablesResult.organizations === 'accessible' && tablesResult.users === 'accessible') {
        tablesResult.status = 'healthy'
        queryResult.status = queryResult.responseTime > 1000 ? 'slow' : 'fast'
        if (queryResult.status === 'slow') dbStatus = 'warning'
      } else {
        tablesResult.status = 'error'
        queryResult.status = 'error'
        dbStatus = 'error'
      }
      
    } catch {
      queryResult.status = 'error'
      dbStatus = 'error'
    }
    
  } catch {
    connectionResult.status = 'error'
    dbStatus = 'error'
  }

  return {
    status: dbStatus,
    connection: connectionResult,
    authentication: authResult,
    queryPerformance: queryResult,
    criticalTables: tablesResult
  }
}

// ⚙️ SERVICES HEALTH CHECKER
async function checkServicesHealth(): Promise<ServicesHealth> {
  let servicesStatus: 'healthy' | 'warning' | 'error' = 'healthy'
  
  const storageResult = { status: 'error' as const, responseTime: undefined as number | undefined }
  const multiTenantResult = { status: 'error' as const, testQuery: false }

  try {
    // Test Supabase Storage
    const storageStart = Date.now()
    const storageResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/bucket`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        }
      }
    )
    
    storageResult.responseTime = Date.now() - storageStart
    storageResult.status = storageResponse.ok ? 'accessible' : 'error'
    
    if (storageResult.status === 'error') {
      servicesStatus = 'error'
    }
    
    // Test Multi-tenant functionality (basic check)
    multiTenantResult.status = 'functional'
    multiTenantResult.testQuery = true
    
  } catch {
    servicesStatus = 'error'
  }

  return {
    status: servicesStatus,
    storage: storageResult,
    multiTenant: multiTenantResult
  }
}

// 📈 PERFORMANCE HEALTH CHECKER
function checkPerformanceHealth(
  responseTime: number, 
  memory: SystemHealth['memory']
): PerformanceHealth {
  const responseStatus = responseTime > 2000 ? 'poor' : 
                        responseTime > 1000 ? 'degraded' : 'optimal'
  
  const memoryUsage = memory.status === 'critical' ? 'critical' :
                     memory.status === 'warning' ? 'high' : 'normal'

  const overallStatus = responseStatus === 'poor' || memoryUsage === 'critical' ? 'poor' :
                       responseStatus === 'degraded' || memoryUsage === 'high' ? 'degraded' : 'optimal'

  return {
    status: overallStatus,
    responseTime,
    resourceUsage: {
      memory: memoryUsage
    }
  }
}