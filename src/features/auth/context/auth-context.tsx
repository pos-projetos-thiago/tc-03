import { createContext } from 'react';

import type { User } from '../types/user';

export interface AuthContextValue {
  /** Usuário autenticado. `null` quando não logado. */
  user: User | null;
  /** `true` enquanto o estado inicial de autenticação está sendo resolvido. */
  isLoading: boolean;
  /** Mensagem de erro da última operação de auth, ou `null`. */
  error: string | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  /** Limpa o erro atual. */
  clearError(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
