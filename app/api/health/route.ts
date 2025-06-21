// 🏥 Simple Health Check API for Coolify Monitoring
// Basic health monitoring for POS-LIA-HAIR application
// GET /api/health

import { NextResponse } from 'next/server'

// 📊 Simple Health Check Response
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  environment: string
  version: string
  message: string
}

export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}