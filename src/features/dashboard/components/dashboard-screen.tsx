import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/src/features/auth';
import { ErrorMessage } from '@/src/shared/components/error-message';
import { LoadingSpinner } from '@/src/shared/components/loading-spinner';

import { useDashboard } from '../hooks/use-dashboard';
import { ChartTabsContainer } from './chart-tabs-container';
import { DashboardHeader } from './dashboard-header';
import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';
import { FinancialOverview } from './financial-overview';
import { RecentTransactionsSection } from './recent-transactions-section';

/**
 * Formata o mês de referência como "Setembro de 2026".
 * O Intl.DateTimeFormat pt-BR retorna "setembro de 2026" (tudo minúsculo),
 * por isso apenas a primeira letra é capitalizada, preservando o "de" minúsculo.
 */
function formatReferenceMonth(date: Date): string {
  const raw = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 24,
      gap: 36,
    },
    // State containers
    stateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      padding: 24,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 8,
    },
    emptyText: {
      fontSize: 15,
      color: colors.textMuted,
    },
    // Section structure
    section: {
      gap: 14,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    // Divider between top metrics and the rest
    topDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
  });
}

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}

function Section({ title, children, styles }: SectionProps) {
  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function DashboardScreen() {
  const colors = useDashboardColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const { summary, isLoading, error, refresh } = useDashboard(user?.id ?? null);
  const insets = useSafeAreaInsets();

  const hasMountedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }
      refresh();
    }, [refresh]),
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (!isLoading && summary) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(10);
    }
  }, [isLoading, summary, fadeAnim, slideAnim]);

  if (isLoading && !summary) {
    return (
      <View style={styles.stateContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Carregando…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <ErrorMessage message={error} onRetry={refresh} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.emptyText}>Sem dados disponíveis.</Text>
      </View>
    );
  }

  const monthLabel = formatReferenceMonth(summary.referenceMonth);
  const allRecent = [...summary.recentTransactions, ...summary.recentInvestments];

  return (
    <Animated.View
      style={[
        styles.root,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 48,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <DashboardHeader
          userId={user?.id}
          userName={user?.displayName}
          monthLabel={monthLabel}
        />

        {/* Financial metrics — no section title, speaks for itself */}
        <Section styles={styles}>
          <FinancialOverview
            balance={summary.balance}
            netWorth={summary.netWorth}
            totalInvested={summary.totalInvested}
            monthLabel={monthLabel}
          />
        </Section>

        <View style={styles.topDivider} />

        {/* Charts */}
        <Section title="Análise" styles={styles}>
          <ChartTabsContainer
            totalIncome={summary.totalIncome}
            totalExpense={summary.totalExpense}
            totalInvested={summary.totalInvested}
            investmentsByCategory={summary.investmentsByCategory}
          />
        </Section>

        {/* Activity */}
        <Section title="Atividade recente" styles={styles}>
          <RecentTransactionsSection transactions={allRecent} />
        </Section>
      </ScrollView>
    </Animated.View>
  );
}
