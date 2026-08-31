import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TransactionItem } from '@/src/features/transactions';
import type { Transaction } from '@/src/features/transactions';

import { DashboardPalette } from './dashboard-palette';

interface RecentTransactionsSectionProps {
  transactions: Transaction[];
}

export function RecentTransactionsSection({
  transactions,
}: RecentTransactionsSectionProps) {
  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  if (sorted.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma transação neste mês</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {sorted.map((transaction, index) => (
        <View key={transaction.id}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <TransactionItem transaction={transaction} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DashboardPalette.border,
    borderRadius: 4,
    backgroundColor: DashboardPalette.surface,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DashboardPalette.divider,
    marginLeft: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DashboardPalette.border,
    borderRadius: 4,
    backgroundColor: DashboardPalette.surface,
  },
  emptyText: {
    fontSize: 14,
    color: DashboardPalette.textMuted,
  },
});
