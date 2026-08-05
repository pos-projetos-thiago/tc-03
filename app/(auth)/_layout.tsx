import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/features/auth';
import { LoadingSpinner } from '@/src/shared/components/loading-spinner';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen />;

  // Se o usuário já estiver logado, redireciona direto para o app
  if (user) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
