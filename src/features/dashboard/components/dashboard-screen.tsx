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
import { DashboardHeader } from './dashboard-header';
import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';
import { FinancialOverview } from './financial-overview';
import { InvestmentPortfolioChart } from './investment-portfolio-chart';
import { MonthlyMovementChart } from './monthly-movement-chart';
import { RecentTransactionsSection } from './recent-transactions-section';

function formatReferenceMonth(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    animatedContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      gap: 32,
    },
    centerContainer: {
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
    section: {
      gap: 16,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
      letterSpacing: 0.3,
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
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
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
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!isLoading && summary) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(12);
    }
  }, [isLoading, summary, fadeAnim, slideAnim]);

  if (isLoading && !summary) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Carregando resumo financeiro…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ErrorMessage message={error} onRetry={refresh} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Sem dados disponíveis.</Text>
      </View>
    );
  }

  const monthLabel = capitalize(formatReferenceMonth(summary.referenceMonth));
  const allRecent = [...summary.recentTransactions, ...summary.recentInvestments];

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader userName={user?.displayName} monthLabel={monthLabel} />

        <Section styles={styles}>
          <FinancialOverview
            balance={summary.balance}
            netWorth={summary.netWorth}
            totalInvested={summary.totalInvested}
            monthLabel={monthLabel}
          />
        </Section>

        <Section title="Movimentação do mês" styles={styles}>
          <MonthlyMovementChart
            totalIncome={summary.totalIncome}
            totalExpense={summary.totalExpense}
            totalInvested={summary.totalInvested}
          />
        </Section>

        <Section title="Carteira de investimentos" styles={styles}>
          <InvestmentPortfolioChart data={summary.investmentsByCategory} />
        </Section>

        <Section title="Atividade recente" styles={styles}>
          <RecentTransactionsSection transactions={allRecent} />
        </Section>
      </ScrollView>
    </Animated.View>
  );
}
