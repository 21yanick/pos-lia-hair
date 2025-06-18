import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // ✅ MIGRATED: Use modern @supabase/ssr instead of deprecated auth-helpers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  );
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Multi-Tenant Architecture: Ensure users exist in database when accessing organization routes
  if (session && req.nextUrl.pathname.startsWith('/org/')) {
    try {
      // Check if user exists in users table
      const { error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // Create user if not found
      if (userError && userError.code === 'PGRST116') { // PGRST116 = Not found
        await supabase
          .from('users')
          .insert({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email,
            username: session.user.email?.split('@')[0] || 'unknown',
            email: session.user.email || '',
            role: 'admin',
            active: true
          });
      }
    } catch (err) {
      console.error('Middleware: User sync error:', err);
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};