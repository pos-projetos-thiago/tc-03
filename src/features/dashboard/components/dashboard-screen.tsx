import React, { useEffect, useRef } from 'react';
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
import { formatCurrency } from '@/src/shared/utils/format-currency';
import { useDashboard } from '../hooks/use-dashboard';
import type { CategoryBreakdown } from '../types/dashboard-summary';
import { InvestmentChart } from './investment-chart';
import { RecentTransactionsSection } from './recent-transactions-section';
import { SummaryCard } from './summary-card';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

interface MovimentacaoRowProps {
  label: string;
  value: number;
  color: string;
  prefix?: string;
}

function MovimentacaoRow({ label, value, color, prefix = '' }: MovimentacaoRowProps) {
  return (
    <View style={styles.movRow}>
      <Text style={styles.movLabel}>{label}</Text>
      <Text style={[styles.movValue, { color }]}>
        {prefix}
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Tela principal do Dashboard.
 *
 * Animação de entrada via Animated (React Native core):
 *   - opacity: 0 → 1
 *   - translateY: 16 → 0
 * Disparada quando os dados terminam de carregar.
 */
export function DashboardScreen() {
  const { user } = useAuth();
  const { summary, isLoading, error, refresh } = useDashboard(user?.id ?? null);
  const insets = useSafeAreaInsets();

  // Animated values para fade-in + slide-up
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (!isLoading && summary) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset para re-animação ao atualizar
      fadeAnim.setValue(0);
      slideAnim.setValue(16);
    }
  }, [isLoading, summary, fadeAnim, slideAnim]);

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Carregando resumo financeiro…</Text>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Error
  // -------------------------------------------------------------------------
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ErrorMessage
          message={error}
          onRetry={refresh}
        />
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Empty / no data
  // -------------------------------------------------------------------------
  if (!summary) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Sem dados disponíveis.</Text>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Dados calculados
  // -------------------------------------------------------------------------
  const monthLabel = capitalize(formatReferenceMonth(summary.referenceMonth));

  // Combina recentTransactions + recentInvestments para a seção de recentes
  const allRecent = [...summary.recentTransactions, ...summary.recentInvestments];

  const investmentsData: CategoryBreakdown[] = summary.investmentsByCategory;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
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
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Cabeçalho                                                         */}
        {/* ---------------------------------------------------------------- */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>{monthLabel}</Text>
        </View>

        {/* ---------------------------------------------------------------- */}
        {/* Resumo financeiro — saldo e patrimônio (all-time)                */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Resumo financeiro">
          <View style={styles.cardRow}>
            <SummaryCard
              label="Saldo disponível"
              value={summary.balance}
              subtitle="Histórico completo"
              accentColor={summary.balance < 0 ? '#dc2626' : '#16a34a'}
            />
            <SummaryCard
              label="Patrimônio total"
              value={summary.netWorth}
              subtitle="Histórico completo"
              valueColor="#111827"
              accentColor="#0a7ea4"
            />
          </View>
          <SummaryCard
            label="Investido este mês"
            value={summary.totalInvested}
            subtitle={monthLabel}
            valueColor="#2563eb"
            accentColor="#2563eb"
          />
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Movimentação do mês                                              */}
        {/* ---------------------------------------------------------------- */}
        <Section title={`Movimentação — ${monthLabel}`}>
          <View style={styles.movCard}>
            <MovimentacaoRow
              label="Receitas"
              value={summary.totalIncome}
              color="#16a34a"
              prefix="+ "
            />
            <View style={styles.divider} />
            <MovimentacaoRow
              label="Despesas"
              value={summary.totalExpense}
              color="#dc2626"
              prefix="- "
            />
            <View style={styles.divider} />
            <MovimentacaoRow
              label="Investimentos"
              value={summary.totalInvested}
              color="#2563eb"
            />
          </View>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Investimentos por categoria + gráfico                            */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Investimentos">
          {summary.totalInvested > 0 ? (
            <View style={styles.investmentTotalRow}>
              <Text style={styles.investmentTotalLabel}>Total investido no mês</Text>
              <Text style={styles.investmentTotalValue}>
                {formatCurrency(summary.totalInvested)}
              </Text>
            </View>
          ) : null}

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Distribuição por categoria</Text>
            <InvestmentChart data={investmentsData} />
          </View>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* Transações recentes                                              */}
        {/* ---------------------------------------------------------------- */}
        <Section title="Transações recentes">
          <RecentTransactionsSection transactions={allRecent} />
        </Section>
      </ScrollView>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
  },

  // Cabeçalho
  header: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Seções
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },

  // Cards de resumo
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Movimentação
  movCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  movRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  movLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  movValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },

  // Investimentos
  investmentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  investmentTotalLabel: {
    fontSize: 13,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  investmentTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d4ed8',
  },

  // Gráfico
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
