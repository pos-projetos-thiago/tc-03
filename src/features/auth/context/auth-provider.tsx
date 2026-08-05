import React, { useCallback, useEffect, useMemo, useReducer } from 'react';

import { authService } from '../services/firebase-auth.service';
import type { User } from '../types/user';
import { AuthContext } from './auth-context';

// ---------------------------------------------------------------------------
// State & Reducer
// ---------------------------------------------------------------------------

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  isLoading: true, // começa true: aguardando resolução do estado persistido pelo Firebase
  error: null,
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Assina as mudanças de estado do Firebase na montagem
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      dispatch({ type: 'SET_USER', payload: user });
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.signIn(email, password);
      // onAuthStateChanged cuida de atualizar o user no estado
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: mapFirebaseError(err) });
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.signUp(email, password);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: mapFirebaseError(err) });
    }
  }, []);

  const signOut = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.signOut();
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: mapFirebaseError(err) });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      isLoading: state.isLoading,
      error: state.error,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [state.user, state.isLoading, state.error, signIn, signUp, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Mapeia códigos de erro do Firebase para mensagens legíveis em português.
 * Adicione novos códigos conforme necessário.
 */
function mapFirebaseError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    switch ((err as { code: string }).code) {
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/user-disabled':
        return 'Esta conta foi desativada.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso.';
      case 'auth/weak-password':
        return 'A senha deve ter no mínimo 6 caracteres.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Falha de rede. Verifique sua conexão.';
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
