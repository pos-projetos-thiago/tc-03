import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { Redirect, Tabs } from 'expo-router';

// TODO Sprint 1: substituir pelo useAuth() real
const user = null;
const isLoading = false;

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  // Enquanto verifica sessão, não renderiza as tabs
  if (isLoading) return null;

  // Usuário não autenticado: redireciona para login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="list.bullet" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
