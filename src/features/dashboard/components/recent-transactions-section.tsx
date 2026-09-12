import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TransactionItem } from '@/src/features/transactions';
import type { Transaction } from '@/src/features/transactions';

import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';

interface RecentTransactionsSectionProps {
  transactions: Transaction[];
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    list: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 4,
      backgroundColor: colors.surface,
      overflow: 'hidden',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: 16,
    },
    emptyContainer: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
    },
  });
}

export function RecentTransactionsSection({
  transactions,
}: RecentTransactionsSectionProps) {
  const colors = useDashboardColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
