import type { User } from './user';

/**
 * Contrato do serviço de autenticação.
 * Na Fase 4 qualquer implementação que respeite esta interface pode
 * substituir o authService sem alterar os hooks consumidores.
 */
export interface IAuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string, name: string): Promise<User>;
  sendPasswordResetEmail(email: string): Promise<void>;
  verifyPasswordResetCode(oobCode: string): Promise<string>;
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void>;
  signOut(): Promise<void>;
  /** Retorna uma função de cleanup (unsubscribe) */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
