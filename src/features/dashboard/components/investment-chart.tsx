import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/src/shared/utils/format-currency';
import type { CategoryBreakdown } from '../types/dashboard-summary';

interface InvestmentChartProps {
  data: CategoryBreakdown[];
}

/** Cores para cada posição da categoria (cíclico). */
const BAR_COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea'];

/**
 * Gráfico de barras horizontais nativo (sem biblioteca externa).
 * Cada barra é proporcional ao `percentage` do CategoryBreakdown.
 */
export function InvestmentChart({ data }: InvestmentChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhum investimento encontrado</Text>
        <Text style={styles.emptyDescription}>
          Registre sua primeira transação de investimento para visualizar a distribuição por categoria.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const color = BAR_COLORS[index % BAR_COLORS.length];
        const barWidth = `${Math.max(item.percentage, 2)}%` as const;

        return (
          <View key={item.category} style={styles.row}>
            {/* Linha de meta-informação: categoria + percentual + valor */}
            <View style={styles.rowHeader}>
              <View style={styles.categoryRow}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
              <View style={styles.metaRight}>
                <Text style={[styles.percentage, { color }]}>{item.percentage}%</Text>
                <Text style={styles.amount}>{formatCurrency(item.total)}</Text>
              </View>
            </View>

            {/* Barra proporcional */}
            <View style={styles.trackContainer}>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    { width: barWidth, backgroundColor: color },
                  ]}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  row: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  metaRight: {
    alignItems: 'flex-end',
    gap: 1,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '700',
  },
  amount: {
    fontSize: 11,
    color: '#6b7280',
  },
  trackContainer: {
    width: '100%',
  },
  track: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
});
