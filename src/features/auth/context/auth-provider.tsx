import React, { useCallback, useEffect, useMemo, useReducer } from 'react';

import { authService } from '../services/firebase-auth.service';
import { isFirebaseConfigured } from '@/src/lib/firebase/config';
import {
  describeOobCode,
  extractFirebaseErrorDetails,
  formatDiagnosticFirebaseError,
  logPasswordResetDiagnostic,
  PASSWORD_RESET_DIAGNOSTICS_ENABLED,
} from '../utils/password-reset-diagnostics';
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
    if (!isFirebaseConfigured()) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          'Firebase não configurado. Crie o arquivo .env com EXPO_PUBLIC_FIREBASE_* e reinicie o Expo.',
      });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.signIn(email, password);
      // onAuthStateChanged cuida de atualizar o user no estado
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: mapFirebaseError(err) });
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!isFirebaseConfigured()) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          'Firebase não configurado. Crie o arquivo .env com EXPO_PUBLIC_FIREBASE_* e reinicie o Expo.',
      });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.signUp(email, password, name);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: mapFirebaseError(err) });
    }
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string): Promise<boolean> => {
    if (!isFirebaseConfigured()) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          'Firebase não configurado. Crie o arquivo .env com EXPO_PUBLIC_FIREBASE_* e reinicie o Expo.',
      });
      return false;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authService.sendPasswordResetEmail(email);
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    } catch (err) {
      if (isPasswordResetEnumerationError(err)) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      }
      dispatch({ type: 'SET_ERROR', payload: mapFirebaseError(err) });
      return false;
    }
  }, []);

  const verifyPasswordResetCode = useCallback(async (oobCode: string): Promise<string> => {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Firebase não configurado. Crie o arquivo .env com EXPO_PUBLIC_FIREBASE_* e reinicie o Expo.',
      );
    }

    logPasswordResetDiagnostic('auth-provider:verify-inicio', {
      ...describeOobCode(oobCode),
    });

    try {
      const email = await authService.verifyPasswordResetCode(oobCode);
      logPasswordResetDiagnostic('auth-provider:verify-sucesso', {
        emailDomain: email.includes('@') ? email.split('@')[1] : null,
        ...describeOobCode(oobCode),
      });
      return email;
    } catch (err) {
      logPasswordResetDiagnostic('auth-provider:verify-erro-firebase', {
        ...describeOobCode(oobCode),
        ...extractFirebaseErrorDetails(err),
      });
      throw new Error(mapFirebaseError(err));
    }
  }, []);

  const confirmPasswordReset = useCallback(async (oobCode: string, newPassword: string) => {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Firebase não configurado. Crie o arquivo .env com EXPO_PUBLIC_FIREBASE_* e reinicie o Expo.',
      );
    }
    try {
      await authService.confirmPasswordReset(oobCode, newPassword);
    } catch (err) {
      throw new Error(mapFirebaseError(err));
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
      sendPasswordResetEmail,
      verifyPasswordResetCode,
      confirmPasswordReset,
      signOut,
      clearError,
    }),
    [
      state.user,
      state.isLoading,
      state.error,
      signIn,
      signUp,
      sendPasswordResetEmail,
      verifyPasswordResetCode,
      confirmPasswordReset,
      signOut,
      clearError,
    ],
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
function isPasswordResetEnumerationError(err: unknown): boolean {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    return (err as { code: string }).code === 'auth/user-not-found';
  }
  return false;
}

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
      case 'auth/invalid-api-key':
        return 'Configuração Firebase inválida. Verifique o arquivo .env e reinicie o Expo.';
      case 'auth/expired-action-code':
        return 'Este link de recuperação expirou. Solicite um novo e-mail.';
      case 'auth/invalid-action-code':
        return 'Este link de recuperação é inválido ou já foi utilizado.';
      case 'auth/invalid-continue-uri':
      case 'auth/unauthorized-continue-uri':
        return 'URL de recuperação não autorizada. Verifique o domínio allowlisted no Firebase Console.';
      case 'auth/missing-ios-bundle-id':
      case 'auth/missing-android-pkg-name':
        return 'Configuração de recuperação incompatível com este ambiente de execução.';
      default:
        if (PASSWORD_RESET_DIAGNOSTICS_ENABLED) {
          logPasswordResetDiagnostic('auth-provider:erro-nao-mapeado', extractFirebaseErrorDetails(err));
          return formatDiagnosticFirebaseError(err);
        }
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  if (PASSWORD_RESET_DIAGNOSTICS_ENABLED) {
    logPasswordResetDiagnostic('auth-provider:erro-sem-code', { rawError: String(err) });
    return formatDiagnosticFirebaseError(err);
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}
