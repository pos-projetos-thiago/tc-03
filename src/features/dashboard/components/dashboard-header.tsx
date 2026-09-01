import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';

interface DashboardHeaderProps {
  userName?: string | null;
  monthLabel: string;
}

function resolveGreetingName(userName?: string | null): string {
  const trimmed = userName?.trim();
  if (!trimmed) return 'Olá';
  const firstName = trimmed.split(/\s+/)[0];
  return `Olá, ${firstName}!`;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 6,
      paddingBottom: 8,
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
  });
}

export function DashboardHeader({ userName, monthLabel }: DashboardHeaderProps) {
  const colors = useDashboardColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{resolveGreetingName(userName)}</Text>
      <Text style={styles.title}>Resumo financeiro</Text>
      <Text style={styles.period}>{monthLabel}</Text>
    </View>
  );
}
