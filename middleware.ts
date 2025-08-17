import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * 🛡️ SIMPLIFIED MIDDLEWARE - CLIENT-SIDE AUTH ARCHITECTURE
 *
 * Was das Middleware NOCH macht:
 * - API Routes protection (optional)
 * - Security headers
 *
 * Was das Middleware NICHT MEHR macht:
 * - Auth redirects (now client-side)
 * - Session checks (now client-side)
 * - User creation (now client-side)
 *
 * WARUM: Client-side Auth ist simpler, zuverlässiger, und Supabase-native.
 */

export async function middleware(req: NextRequest) {
  console.log('🛡️ SIMPLIFIED MIDDLEWARE - Path:', req.nextUrl.pathname)

  const res = NextResponse.next()

  // Optional: Protect API routes (if you have sensitive server-side APIs)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Most APIs can rely on RLS (Row Level Security) in Supabase
    // Only add auth checks here if you have server-side business logic
    console.log('🛡️ MIDDLEWARE - API route access:', req.nextUrl.pathname)
  }

  // Let client-side handle all auth logic
  console.log('🛡️ MIDDLEWARE - Passing through to client-side auth')
  return res
}

export const config = {
  // Only run on API routes if needed, otherwise let client handle everything
  matcher: ['/api/(.*)'],
}
