import { Redirect, Stack } from 'expo-router';

// TODO Sprint 1: substituir pelo useAuth() real quando AuthProvider estiver implementado
// Por ora não há usuário autenticado, então este grupo é sempre acessível
const user = null;

export default function AuthLayout() {
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
