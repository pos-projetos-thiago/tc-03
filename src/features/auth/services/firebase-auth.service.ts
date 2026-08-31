import {
  confirmPasswordReset as firebaseConfirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  reload,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
} from 'firebase/auth';

import { auth } from '@/src/lib/firebase/auth';
import { getPasswordResetActionCodeSettings } from '../utils/password-reset-linking';
import type { IAuthService } from '../types/auth-service.interface';
import type { User } from '../types/user';

/**
 * Implementação do IAuthService usando o Firebase Authentication.
 * Mapeia os dados do SDK (FirebaseUser) para o modelo de domínio (User).
 */
class FirebaseAuthService implements IAuthService {
  async signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return this.mapUser(user);
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const trimmedName = name.trim();
    await updateProfile(user, { displayName: trimmedName });
    await reload(user);
    return this.mapUser(user);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await firebaseSendPasswordResetEmail(
      auth,
      email,
      getPasswordResetActionCodeSettings(),
    );
  }

  async verifyPasswordResetCode(oobCode: string): Promise<string> {
    return firebaseVerifyPasswordResetCode(auth, oobCode);
  }

  async confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
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