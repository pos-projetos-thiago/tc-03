import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';

import app from './config';

/**
 * Firebase Auth no React Native/Expo exige persistência via AsyncStorage.
 * Sem isso, o SDK usa memória e pode falhar ou perder sessão no dispositivo.
 */
function createAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'auth/already-initialized'
    ) {
      return getAuth(app);
    }
    throw error;
  }
}

const auth: Auth = createAuth();

export { auth };
