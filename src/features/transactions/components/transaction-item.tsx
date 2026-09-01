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

interface TypeStyle {
  label: string;
  amountPrefix: string;
  accent: string;
}

const DESTRUCTIVE_COLOR = '#E05252';

function getTypeStyle(type: TransactionType, colors: ThemeColors): TypeStyle {
  switch (type) {
    case 'income':
      return { label: 'Depósito', amountPrefix: '+', accent: colors.income };
    case 'expense':
      return { label: 'Saque', amountPrefix: '−', accent: colors.expense };
    case 'investment':
      return { label: 'Investimento', amountPrefix: '', accent: colors.investment };
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
      <Ionicons name={icon} size={17} color={color} />
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

  const typeStyle = getTypeStyle(transaction.type, colors);
  const actionPressedColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';

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
      <View style={styles.topRow}>
        <View style={styles.typeIndicator}>
          <View style={[styles.typeDot, { backgroundColor: typeStyle.accent }]} />
          <Text style={[styles.typeLabel, { color: typeStyle.accent }]}>
            {typeStyle.label}
          </Text>
        </View>
        <Text style={[styles.amount, { color: typeStyle.accent }]}>
          {typeStyle.amountPrefix}
          {formattedAmount}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}

      <View style={styles.footerRow}>
        <Text style={styles.date}>{formattedDate}</Text>
        {(onPress || onDelete) && (
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
        )}
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
      gap: 4,
      ...(isCard
        ? {
            borderRadius: 4,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.border,
          }
        : {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          }),
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 2,
    },
    typeIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 1,
    },
    typeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    typeLabel: {
      fontSize: 11,
      fontWeight: '500',
      letterSpacing: 0.2,
    },
    amount: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.2,
      fontVariant: ['tabular-nums'],
      flexShrink: 0,
    },
    title: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      letterSpacing: -0.1,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
      gap: 12,
    },
    date: {
      fontSize: 12,
      color: colors.textMuted,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      flexShrink: 0,
    },
  });
}

const actionStyles = StyleSheet.create({
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
