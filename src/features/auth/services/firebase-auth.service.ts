import {
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { auth } from '@/src/lib/firebase/auth';
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

  async signUp(email: string, password: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    return this.mapUser(user);
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