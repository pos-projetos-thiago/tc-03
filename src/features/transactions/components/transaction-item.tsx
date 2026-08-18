import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '../types/transaction';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

const INCOME_COLOR = '#16a34a';
const EXPENSE_COLOR = '#dc2626';

/**
 * Card de uma transação na lista.
 * Usa Pressable para ambos os receptores de toque (corpo e lixeira) para
 * garantir compatibilidade com mouse em React Native Web.
 */
export function TransactionItem({ transaction, onPress, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? INCOME_COLOR : EXPENSE_COLOR;
  const amountPrefix = isIncome ? '+' : '-';

  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedAmount = transaction.amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <View style={styles.container}>
      {/* Corpo pressável: ocupa todo o espaço menos o botão de exclusão */}
      <Pressable
        style={({ pressed }) => [styles.body, pressed && onPress ? styles.bodyPressed : null]}
        onPress={onPress ? () => onPress(transaction) : undefined}
        android_ripple={onPress ? { color: '#e5e7eb' } : undefined}
        accessibilityRole={onPress ? 'button' : 'none'}
        accessibilityLabel={
          onPress ? `Editar transação: ${transaction.description}` : undefined
        }>
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={styles.meta}>
            {transaction.category} · {formattedDate}
          </Text>
        </View>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}
          {formattedAmount}
        </Text>
      </Pressable>

      {/* Botão de exclusão: Pressable independente, fora do Pressable do corpo */}
      {onDelete ? (
        <Pressable
          style={({ pressed }) => [styles.deleteButton, pressed ? styles.deleteButtonPressed : null]}
          onPress={() => onDelete(transaction)}
          accessibilityRole="button"
          accessibilityLabel={`Excluir transação: ${transaction.description}`}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bodyPressed: {
    backgroundColor: '#f3f4f6',
  },
  info: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.5,
  },
  deleteIcon: {
    fontSize: 16,
  },
});
