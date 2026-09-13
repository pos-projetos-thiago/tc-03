import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/src/shared/utils/format-currency';

import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';

interface FinancialOverviewProps {
  balance: number;
  netWorth: number;
  totalInvested: number;
  monthLabel: string;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 20,
    },
    // Top row: balance + net worth
    row: {
      flexDirection: 'row',
      gap: 0,
    },
    metric: {
      flex: 1,
      gap: 4,
    },
    metricRight: {
      flex: 1,
      gap: 4,
      paddingLeft: 24,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: colors.border,
    },
    metricLabel: {
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    metricValue: {
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: -0.5,
      color: colors.text,
    },
    metricValueNegative: {
      color: colors.negative,
    },
    // Bottom row: divider + invested this month
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    investedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 16,
    },
    investedLabel: {
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    investedMonth: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    investedValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.accent,
      letterSpacing: -0.3,
    },
  });
}

export function FinancialOverview({
  balance,
  netWorth,
  totalInvested,
  monthLabel,
}: FinancialOverviewProps) {
  const colors = useDashboardColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Saldo</Text>
          <Text
            style={[
              styles.metricValue,
              balance < 0 && styles.metricValueNegative,
            ]}
          >
            {formatCurrency(balance)}
          </Text>
        </View>

        <View style={styles.metricRight}>
          <Text style={styles.metricLabel}>Patrimônio</Text>
          <Text
            style={[
              styles.metricValue,
              netWorth < 0 && styles.metricValueNegative,
            ]}
          >
            {formatCurrency(netWorth)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.investedRow}>
        <View>
          <Text style={styles.investedLabel}>Investido</Text>
          <Text style={styles.investedMonth}>{monthLabel}</Text>
        </View>
        <Text
          style={[
            styles.investedValue,
            { color: totalInvested > 0 ? colors.accent : colors.text },
          ]}
        >
          {formatCurrency(totalInvested)}
        </Text>
      </View>
    </View>
  );
}
