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

interface MetricProps {
  label: string;
  value: number;
  caption: string;
  valueColor?: string;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}

function Metric({ label, value, caption, valueColor, styles, colors }: MetricProps) {
  const resolvedColor =
    valueColor ?? (value < 0 ? colors.negative : colors.text);

  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: resolvedColor }]}>
        {formatCurrency(value)}
      </Text>
      <Text style={styles.metricCaption}>{caption}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 4,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    metric: {
      flex: 1,
      gap: 6,
    },
    metricLabel: {
      fontSize: 12,
      color: colors.textMuted,
      letterSpacing: 0.3,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: -0.2,
    },
    metricCaption: {
      fontSize: 11,
      color: colors.textMuted,
    },
    verticalDivider: {
      width: StyleSheet.hairlineWidth,
      alignSelf: 'stretch',
      backgroundColor: colors.divider,
      marginHorizontal: 20,
    },
    horizontalDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.divider,
      marginVertical: 20,
    },
    investedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    investedCaption: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
      textTransform: 'capitalize',
    },
    investedValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.accent,
      letterSpacing: -0.2,
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
        <Metric
          label="Saldo disponível"
          value={balance}
          caption="Histórico completo"
          styles={styles}
          colors={colors}
        />
        <View style={styles.verticalDivider} />
        <Metric
          label="Patrimônio total"
          value={netWorth}
          caption="Histórico completo"
          styles={styles}
          colors={colors}
        />
      </View>

      <View style={styles.horizontalDivider} />

      <View style={styles.investedRow}>
        <View>
          <Text style={styles.metricLabel}>Investido no mês</Text>
          <Text style={styles.investedCaption}>{monthLabel}</Text>
        </View>
        <Text style={styles.investedValue}>{formatCurrency(totalInvested)}</Text>
      </View>
    </View>
  );
}
