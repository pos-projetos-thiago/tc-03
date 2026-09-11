import React, { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/src/features/auth';
import { UserAvatar } from '@/src/shared/components/user-avatar';

import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';

interface DashboardHeaderProps {
  userId?: string | null;
  userName?: string | null;
  monthLabel: string;
}

function resolveFirstName(userName?: string | null): string {
  const trimmed = userName?.trim();

  if (!trimmed) return 'Usuário';

  return trimmed.split(/\s+/)[0];
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 6,
      paddingBottom: 8,
    },
    greetingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    greetingTextBlock: {
      flex: 1,
      gap: 2,
    },
    greeting: {
      fontSize: 14,
      color: colors.textMuted,
      letterSpacing: 0.2,
    },
    title: {
      fontSize: 26,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.3,
    },
    period: {
      fontSize: 14,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    logoutButton: {
      padding: 8,
      marginRight: -4,
    },
  });
}

export function DashboardHeader({ userId, userName, monthLabel }: DashboardHeaderProps) {
  const colors = useDashboardColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { signOut } = useAuth();

  const firstName = resolveFirstName(userName);

  const handleLogout = useCallback(() => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  return (
    <View style={styles.container}>
      <View style={styles.greetingRow}>
        {userId ? <UserAvatar userId={userId} size={52} /> : null}

        <View style={styles.greetingTextBlock}>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.title}>{firstName}!</Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          accessibilityLabel="Sair da conta"
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={22}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.period}>{monthLabel}</Text>
    </View>
  );
}
