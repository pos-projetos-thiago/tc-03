// Polyfill carregado antes de qualquer outro módulo.
// Deve ser o primeiro import para garantir que AbortSignal.any esteja disponível
// antes de qualquer inicialização do Firebase AI Logic.
import '@/src/polyfills/abort-signal-any';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { AuthProvider } from '@/src/features/auth';

// TODO Sprint 2: descomentar quando TransactionProvider estiver implementado
// import { TransactionProvider } from '@/src/features/transactions';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="transactions/new"
            options={{ title: 'Nova transação', presentation: 'modal' }}
          />
          <Stack.Screen
            name="transactions/[id]"
            options={{ title: 'Editar transação' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
