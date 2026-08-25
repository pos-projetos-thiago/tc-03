import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TransactionItem } from '@/src/features/transactions';
import type { Transaction } from '@/src/features/transactions';

interface RecentTransactionsSectionProps {
  transactions: Transaction[];
}

/**
 * Exibe as transações recentes do Dashboard em modo readonly.
 * Ordena por data decrescente antes da exibição.
 * Reutiliza o TransactionItem existente sem ações de edição/exclusão.
 */
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
      {sorted.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
        // readonly: sem onPress nem onDelete
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
