import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';

import type { Transaction, TransactionType } from '../types/transaction';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  /** `card` para a lista principal; `embedded` para uso dentro de containers no Dashboard. */
  variant?: 'card' | 'embedded';
}

interface TypeMeta {
  label: string;
  amountPrefix: string;
  amountColor: string;
}

const DESTRUCTIVE_COLOR = '#E05252';

function getTypeMeta(type: TransactionType, colors: ThemeColors): TypeMeta {
  switch (type) {
    case 'income':
      return { label: 'Depósito', amountPrefix: '+', amountColor: colors.income };
    case 'expense':
      return { label: 'Saque', amountPrefix: '−', amountColor: colors.expense };
    case 'investment':
      // Investimentos são neutros — nem positivo nem negativo.
      // Usar textSecondary evita adicionar uma terceira cor de destaque na lista.
      return { label: 'Investimento', amountPrefix: '', amountColor: colors.textSecondary };
  }
}

interface ActionIconButtonProps {
  icon: 'create-outline' | 'trash-outline';
  onPress: () => void;
  accessibilityLabel: string;
  color: string;
  pressedColor: string;
}

function ActionIconButton({
  icon,
  onPress,
  accessibilityLabel,
  color,
  pressedColor,
}: ActionIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [
        actionStyles.actionButton,
        pressed && { backgroundColor: pressedColor },
      ]}>
      <Ionicons name={icon} size={16} color={color} />
    </Pressable>
  );
}

export function TransactionItem({
  transaction,
  onPress,
  onDelete,
  variant = 'embedded',
}: TransactionItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const styles = useMemo(() => createStyles(colors, variant), [colors, variant]);

  const meta = getTypeMeta(transaction.type, colors);
  const actionPressedColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedAmount = transaction.amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const title = transaction.category;
  const subtitle = transaction.description?.trim();

  return (
    <View style={styles.container}>
      {/* Primary row: category title + amount */}
      <View style={styles.primaryRow}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[styles.amount, { color: meta.amountColor }]}
          numberOfLines={1}
        >
          {meta.amountPrefix}{formattedAmount}
        </Text>
      </View>

      {/* Optional description */}
      {subtitle ? (
        <Text style={styles.description} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}

      {/* Footer: type label + date + actions */}
      <View style={styles.footerRow}>
        <Text style={styles.typeLabel}>{meta.label}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.date}>{formattedDate}</Text>

        {(onPress || onDelete) ? (
          <View style={styles.actions}>
            {onPress ? (
              <ActionIconButton
                icon="create-outline"
                onPress={() => onPress(transaction)}
                accessibilityLabel={`Editar transação: ${subtitle || title}`}
                color={colors.textMuted}
                pressedColor={actionPressedColor}
              />
            ) : null}
            {onDelete ? (
              <ActionIconButton
                icon="trash-outline"
                onPress={() => onDelete(transaction)}
                accessibilityLabel={`Excluir transação: ${subtitle || title}`}
                color={DESTRUCTIVE_COLOR}
                pressedColor={actionPressedColor}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, variant: 'card' | 'embedded') {
  const isCard = variant === 'card';

  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 3,
      ...(isCard
        ? {
          borderRadius: 4,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        }
        : {}),
    },
    primaryRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
      letterSpacing: -0.1,
    },
    amount: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.3,
      fontVariant: ['tabular-nums'],
      flexShrink: 0,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 17,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 5,
    },
    typeLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    dot: {
      fontSize: 12,
      color: colors.textMuted,
    },
    date: {
      fontSize: 12,
      color: colors.textMuted,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 0,
      flexShrink: 0,
    },
  });
}

const actionStyles = StyleSheet.create({
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
