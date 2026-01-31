import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/components/utils/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within SupabaseAuthProvider');
  }
  return context;
};

export function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apenas verificar sessão no Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Se tiver sessão, salva. Se não, não faz nada (não chama API antiga!)
      console.log('Sessão Supabase:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Mudança de auth:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
    signUp: (email, password) => supabase.auth.signUp({ email, password })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}