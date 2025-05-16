'use client';

import { useContext } from 'react';
import { AuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { User, AuthError } from '@supabase/supabase-js';

interface AuthResponse {
  error: AuthError | null;
  data: any;
}

interface AuthHookReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (credentials: { email: string; password: string }) => Promise<AuthResponse>;
  signUp: (credentials: { 
    email: string; 
    password: string; 
    data: { 
      full_name: string; 
      faculdade: string; 
      disciplina: string 
    } 
  }) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<AuthResponse>;
}

export function useAuth(): AuthHookReturn {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const signInWithPassword = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      return { data, error };
    } catch (err) {
      return { data: null, error: err as AuthError };
    }
  };

  const signUp = async (credentials: { 
    email: string; 
    password: string; 
    data: { 
      full_name: string; 
      faculdade: string; 
      disciplina: string 
    } 
  }): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: credentials.data,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err as AuthError };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const sendPasswordResetEmail = async (email: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err as AuthError };
    }
  };

  return {
    user: context.user,
    isLoading: context.isLoading,
    isAuthenticated: context.isAuthenticated,
    signInWithPassword,
    signUp,
    signOut,
    sendPasswordResetEmail
  };
}

