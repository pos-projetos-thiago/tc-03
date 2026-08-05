import { Redirect, Tabs } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/src/features/auth';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { LoadingSpinner } from '@/src/shared/components/loading-spinner';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const { user, isLoading } = useAuth();

  // Enquanto verifica sessão, não renderiza as tabs
  if (isLoading) return <LoadingSpinner fullScreen />;

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
