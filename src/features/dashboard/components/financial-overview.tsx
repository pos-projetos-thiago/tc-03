import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/src/shared/utils/format-currency';

import { DashboardPalette } from './dashboard-palette';

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
}

function Metric({ label, value, caption, valueColor }: MetricProps) {
  const resolvedColor =
    valueColor ?? (value < 0 ? DashboardPalette.negative : DashboardPalette.textPrimary);

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

export function FinancialOverview({
  balance,
  netWorth,
  totalInvested,
  monthLabel,
}: FinancialOverviewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Metric
          label="Saldo disponível"
          value={balance}
          caption="Histórico completo"
        />
        <View style={styles.verticalDivider} />
        <Metric
          label="Patrimônio total"
          value={netWorth}
          caption="Histórico completo"
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: DashboardPalette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DashboardPalette.border,
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
    color: DashboardPalette.textMuted,
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  metricCaption: {
    fontSize: 11,
    color: DashboardPalette.textMuted,
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: DashboardPalette.divider,
    marginHorizontal: 20,
  },
  horizontalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DashboardPalette.divider,
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
    color: DashboardPalette.textMuted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  investedValue: {
    fontSize: 18,
    fontWeight: '600',
    color: DashboardPalette.accent,
    letterSpacing: -0.2,
  },
});
