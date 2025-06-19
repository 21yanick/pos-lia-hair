// Health Check API for Coolify Monitoring
// GET /api/health

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        server: 'healthy',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          limit: process.env.NODE_OPTIONS?.includes('max-old-space-size') 
            ? parseInt(process.env.NODE_OPTIONS.match(/--max-old-space-size=(\d+)/)?.[1] || '0') 
            : null
        }
      }
    };

    // Optional: Check Supabase connection (if needed)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabaseCheck = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          }
        });
        
        healthCheck.checks = {
          ...healthCheck.checks,
          supabase: supabaseCheck.ok ? 'healthy' : 'unhealthy'
        };
      } catch (error) {
        healthCheck.checks = {
          ...healthCheck.checks,
          supabase: 'error'
        };
      }
    }

    return NextResponse.json(healthCheck, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      }, 
      { status: 500 }
    );
  }
}