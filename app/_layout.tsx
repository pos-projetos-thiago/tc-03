// Polyfill carregado antes de qualquer outro módulo.
// Deve ser o primeiro import para garantir que AbortSignal.any esteja disponível
// antes de qualquer inicialização do Firebase AI Logic.
import '@/src/polyfills/abort-signal-any';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { AuthProvider } from '@/src/features/auth';
import { TransactionProvider } from '@/src/features/transactions';
import { AppSplashScreen } from '@/src/components/app-splash-screen';

// Impede que a splash screen nativa seja ocultada automaticamente.
// O controle de ocultação é feito manualmente após a renderização completa.
SplashScreen.preventAutoHideAsync();

// Configura o comportamento de fade-out da splash nativa antes de qualquer render.
SplashScreen.setOptions({
  duration: 300,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Controla a exibição da splash screen customizada (React).
  // Permanece true enquanto o app ainda não terminou de inicializar.
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Aguarda pelo menos 2 frames para garantir que o AppSplashScreen
        // foi pintado antes de marcar como pronto.
        await new Promise<void>((resolve) => {
          // requestAnimationFrame não existe no RN; usa setTimeout com 0ms
          // para deixar o JS thread processar o render do AppSplashScreen.
          setTimeout(resolve, 2000);
        });
      } catch (error) {
        // Erros de inicialização não devem bloquear a splash.
        console.warn('Erro durante inicialização:', error);
      } finally {
        setIsReady(true);
        // Oculta a splash screen nativa com o fade configurado acima.
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Enquanto não estiver pronto, exibe a splash customizada React
  // (fundo tema-aware + logo SVG), que substitui visualmente a nativa.
  if (!isReady) {
    return <AppSplashScreen />;
  }

  return (
    <AuthProvider>
      {/* TransactionProvider dentro do AuthProvider para que useAuth() resolva corretamente */}
      <TransactionProvider>
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
      </TransactionProvider>
    </AuthProvider>
  );
}
