import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction, TransactionType } from '../types/transaction';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

// ---------------------------------------------------------------------------
// Config por tipo
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  TransactionType,
  { label: string; amountPrefix: string; amountColor: string; badgeBackground: string; badgeText: string }
> = {
  income: {
    label: 'DEPÓSITO',
    amountPrefix: '+',
    amountColor: '#16a34a',
    badgeBackground: '#dcfce7',
    badgeText: '#15803d',
  },
  expense: {
    label: 'SAQUE',
    amountPrefix: '-',
    amountColor: '#dc2626',
    badgeBackground: '#fee2e2',
    badgeText: '#b91c1c',
  },
  investment: {
    label: 'INVESTIMENTO',
    amountPrefix: '',
    amountColor: '#2563eb',
    badgeBackground: '#eff6ff',
    badgeText: '#1d4ed8',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Card de uma transação na lista.
 * Exibe badge com o tipo de operação (DEPÓSITO / SAQUE / INVESTIMENTO).
 * Usa Pressable para compatibilidade com mouse em React Native Web.
 */
export function TransactionItem({ transaction, onPress, onDelete }: TransactionItemProps) {
  const config = TYPE_CONFIG[transaction.type];

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
      {/* Corpo pressável */}
      <Pressable
        style={({ pressed }) => [styles.body, pressed && onPress ? styles.bodyPressed : null]}
        onPress={onPress ? () => onPress(transaction) : undefined}
        android_ripple={onPress ? { color: '#e5e7eb' } : undefined}
        accessibilityRole={onPress ? 'button' : 'none'}
        accessibilityLabel={
          onPress ? `Editar transação: ${transaction.description || transaction.category}` : undefined
        }>

        <View style={styles.info}>
          {/* Badge de tipo */}
          <View
            style={[styles.badge, { backgroundColor: config.badgeBackground }]}
            accessibilityRole="text"
            accessibilityLabel={config.label}>
            <Text style={[styles.badgeText, { color: config.badgeText }]}>
              {config.label}
            </Text>
          </View>

          {/* Categoria (primária) */}
          <Text style={styles.category} numberOfLines={1}>
            {transaction.category}
          </Text>

          {/* Descrição (secundária, só se existir) */}
          {transaction.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
          ) : null}

          {/* Data */}
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {/* Valor */}
        <Text style={[styles.amount, { color: config.amountColor }]}>
          {config.amountPrefix}
          {formattedAmount}
        </Text>
      </Pressable>

      {/* Botão de exclusão: receptor independente */}
      {onDelete ? (
        <Pressable
          style={({ pressed }) => [styles.deleteButton, pressed ? styles.deleteButtonPressed : null]}
          onPress={() => onDelete(transaction)}
          accessibilityRole="button"
          accessibilityLabel={`Excluir transação: ${transaction.description || transaction.category}`}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    paddingVertical: 12,
  },
  bodyPressed: {
    backgroundColor: '#f3f4f6',
  },
  info: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
  },
  date: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
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
