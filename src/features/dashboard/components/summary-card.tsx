import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/src/shared/utils/format-currency';

interface SummaryCardProps {
  label: string;
  value: number;
  subtitle?: string;
  /** Override da cor do valor. Se omitida, aplica verde para positivo e vermelho para negativo. */
  valueColor?: string;
  /** Cor de destaque na borda esquerda do card. */
  accentColor?: string;
}

/**
 * Card reutilizável para exibir um valor financeiro com label e subtítulo opcional.
 * Aplica cor negativa automaticamente quando value < 0, salvo override de valueColor.
 */
export function SummaryCard({
  label,
  value,
  subtitle,
  valueColor,
  accentColor = '#0a7ea4',
}: SummaryCardProps) {
  const resolvedColor =
    valueColor ?? (value < 0 ? '#dc2626' : '#111827');

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, { color: resolvedColor }]} numberOfLines={1}>
        {formatCurrency(value)}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
