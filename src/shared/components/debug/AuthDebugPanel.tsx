"use client"

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { supabase } from "@/shared/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function AuthDebugPanel() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!error) {
          setDbUser(data);
        } else {
          // console.log('Fehler beim Abrufen des DB-Benutzers:', error);
        }
      }
    } catch (err: any) {
      console.error('Fehler beim Laden der Benutzerdaten:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const synchronizeUser = async () => {
    if (!authUser) return;
    
    try {
      setSyncing(true);
      
      // console.log('Synchronisiere Benutzer...');
      const { error } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email,
          username: authUser.email.split('@')[0],
          email: authUser.email,
          role: 'admin',
          active: true
        });
        
      if (error) {
        // console.error('Synchronisierungsfehler:', error);
        throw error;
      }
      
      // console.log('Benutzer erfolgreich synchronisiert, lade Daten neu...');
      await loadUserData();
    } catch (err: any) {
      console.error('Fehler bei der Synchronisierung:', err);
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const isConfigOk = authUser && dbUser;

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Auth-Debug</CardTitle>
        {isConfigOk && (
          <div className="flex items-center text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Synchronisiert
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Lade Benutzerdaten...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Auth-Benutzer:</h3>
                <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto max-h-36">
                  {authUser ? JSON.stringify(authUser, null, 2) : "Nicht angemeldet"}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">DB-Benutzer:</h3>
                <pre className="text-xs bg-slate-50 p-2 rounded overflow-auto max-h-36">
                  {dbUser ? JSON.stringify(dbUser, null, 2) : "Nicht gefunden"}
                </pre>
              </div>
            </div>
            
            {!isConfigOk && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start mb-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Konfigurationsproblem</h4>
                  <p className="text-sm text-yellow-700">
                    Auth- und DB-Benutzer sind nicht synchronisiert. Dies verursacht Berechtigungsprobleme 
                    bei Datenbankoperationen.
                  </p>
                </div>
              </div>
            )}
            
            {!isConfigOk && authUser && (
              <Button 
                onClick={synchronizeUser} 
                disabled={syncing}
                className="w-full"
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Synchronisiere...
                  </>
                ) : (
                  "Benutzer synchronisieren"
                )}
              </Button>
            )}
            
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}