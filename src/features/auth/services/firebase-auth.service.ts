import {
  Auth,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  reload,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

import app from '@/src/lib/firebase/config';
import { getPasswordResetActionCodeSettings } from '../utils/password-reset-linking';
import type { IAuthService } from '../types/auth-service.interface';
import type { User } from '../types/user';

/**
 * Singleton do Auth — criado uma única vez com persistência AsyncStorage.
 * Usa getAuth() como fallback para o caso de hot-reload re-executar este módulo
 * quando o Auth já foi inicializado anteriormente na mesma sessão JS.
 */
function createAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    // auth/already-initialized: retorna a instância existente
    return getAuth(app);
  }
}

const authInstance: Auth = createAuth();

/**
 * Implementação do IAuthService usando o Firebase Authentication.
 * Mapeia os dados do SDK (FirebaseUser) para o modelo de domínio (User).
 */
class FirebaseAuthService implements IAuthService {
  async signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(authInstance, email, password);
    return this.mapUser(user);
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(authInstance, email, password);
    const trimmedName = name.trim();
    await updateProfile(user, { displayName: trimmedName });
    await reload(user);
    return this.mapUser(user);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await firebaseSendPasswordResetEmail(
      authInstance,
      email,
      getPasswordResetActionCodeSettings(),
    );
  }

  async verifyPasswordResetCode(oobCode: string): Promise<string> {
    return firebaseVerifyPasswordResetCode(authInstance, oobCode);
  }

  async confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    await firebaseConfirmPasswordReset(authInstance, oobCode, newPassword);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(authInstance);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(authInstance, (firebaseUser) => {
      callback(firebaseUser ? this.mapUser(firebaseUser) : null);
    });
  }

  private mapUser(firebaseUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
  }): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName,
    };
  }
}

export const authService: IAuthService = new FirebaseAuthService();
