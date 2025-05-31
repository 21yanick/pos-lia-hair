import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Umleitung für die alte Abschlüsse-Übersichtsseite zu Tagesabschlüssen
  if (req.nextUrl.pathname === '/reports') {
    return NextResponse.redirect(new URL('/reports/daily', req.url));
  }

  // Wenn nicht eingeloggt und Zugriff auf geschützte Route versucht wird
  if (!session && req.nextUrl.pathname.startsWith('/(auth)')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Wenn eingeloggt, versuche Benutzer in der users-Tabelle zu finden oder zu erstellen
  if (session && req.nextUrl.pathname.startsWith('/(auth)')) {
    try {
      // Prüfen, ob der Benutzer in der users-Tabelle existiert
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // Wenn kein Benutzer gefunden wurde, erstelle einen
      if (userError && userError.code === 'PGRST116') { // PGRST116 = Not found
        console.log('Middleware: Benutzer nicht in der Datenbank, erstelle...');
        
        // Benutzer anlegen
        await supabase
          .from('users')
          .insert({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email,
            username: session.user.email?.split('@')[0] || 'unknown',
            email: session.user.email || '',
            role: 'admin', // Standardrolle für neue Benutzer
            active: true
          });
          
        console.log('Middleware: Benutzer erstellt');
      }
    } catch (err) {
      console.error('Middleware: Fehler bei der Benutzersynchronisierung:', err);
      // Wir leiten hier nicht um, sondern lassen die Anfrage durchgehen,
      // damit der Client-Code die Synchronisierung nochmal versuchen kann
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};