import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, type ThemeColors } from '@/constants/theme';
import { useAuth } from '@/src/features/auth';
import { EmptyState } from '@/src/shared/components/empty-state';
import { ErrorMessage } from '@/src/shared/components/error-message';
import { LoadingSpinner } from '@/src/shared/components/loading-spinner';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';

import { useDeleteTransaction } from '../hooks/use-delete-transaction';
import { useTransactionContext } from '../hooks/use-transaction-context';
import { DEFAULT_FILTER } from '../types/transaction-filter';
import type { Transaction } from '../types/transaction';
import { GlassIconButton } from './glass-icon-button';
import { TransactionFilterBar } from './transaction-filter-bar';
import { TransactionItem } from './transaction-item';

/**
 * Tela principal de transações.
 *
 * - Consome o estado global de transações via TransactionContext,
 *   evitando instâncias isoladas de useTransactions por tela.
 * - Recarrega via useFocusEffect ao voltar de criação ou edição,
 *   mas apenas se a tela já tiver sido montada (evita requisição dupla inicial).
 * - Suporta scroll infinito via onEndReached + loadMore.
 * - Suporta filtro por tipo, categoria e período.
 */
export function TransactionListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [showFilters, setShowFilters] = useState(false);

  const {
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    filter,
    setFilter,
    refresh,
    loadMore,
  } = useTransactionContext();

  const { remove, isDeleting, error: deleteError } = useDeleteTransaction();

  const isFilterActive =
    filter.type !== null || filter.category !== null || filter.dateRange !== null;

  const hasMountedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }
      refresh();
    }, [refresh]),
  );

  function handleEdit(transaction: Transaction) {
    router.push({
      pathname: `/transactions/[id]`,
      params: {
        id: transaction.id,
        data: JSON.stringify(transaction),
      },
    });
  }

  function handleDeleteRequest(transaction: Transaction) {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Deseja excluir "${transaction.description}"? Esta ação não pode ser desfeita.`,
      );
      if (confirmed) void confirmDelete(transaction);
      return;
    }

    Alert.alert(
      'Excluir transação',
      `Deseja excluir "${transaction.description}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => void confirmDelete(transaction),
        },
      ],
    );
  }

  async function confirmDelete(transaction: Transaction) {
    if (!user) return;
    const success = await remove(transaction.id, user.id);
    if (success) {
      refresh();
    }
  }

  function handleApplyFilter(newFilter: Parameters<typeof setFilter>[0]) {
    setFilter(newFilter);
    setShowFilters(false);
  }

  function handleClearFilter() {
    setFilter(DEFAULT_FILTER);
    setShowFilters(false);
  }

  function handleEndReached() {
    if (hasMore && !isLoadingMore && !isLoading) {
      loadMore();
    }
  }

  function renderFooter() {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.tint} />
      </View>
    );
  }

  if (isLoading && transactions.length === 0 && !isFilterActive) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16 },
        ]}>
        <Text style={styles.title} numberOfLines={1}>
          Transações
        </Text>
        <View style={styles.headerActions}>
          <GlassIconButton
            icon="filter-outline"
            onPress={() => setShowFilters((value) => !value)}
            accessibilityLabel={showFilters ? 'Fechar filtros' : 'Filtrar'}
            colors={colors}
            isDark={isDark}
            isActive={isFilterActive || showFilters}
          />
          <GlassIconButton
            icon="add"
            onPress={() => router.push('/transactions/new')}
            accessibilityLabel="Nova transação"
            colors={colors}
            isDark={isDark}
            disabled={isDeleting}
          />
        </View>
      </View>

      {showFilters ? (
        <TransactionFilterBar
          filter={filter}
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
        />
      ) : null}

      {error && <ErrorMessage message={error} onRetry={refresh} />}
      {deleteError && <ErrorMessage message={deleteError} />}

      <FlatList<Transaction>
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            variant="card"
            onPress={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.tint}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !error ? (
            <EmptyState
              message={
                isFilterActive
                  ? 'Nenhum resultado para os filtros aplicados'
                  : 'Nenhuma transação encontrada'
              }
              description={
                isFilterActive
                  ? 'Tente ajustar ou limpar os filtros.'
                  : 'Toque no botão + para adicionar sua primeira transação.'
              }
            />
          ) : null
        }
        style={styles.list}
        contentContainerStyle={
          transactions.length === 0
            ? styles.emptyContent
            : styles.listContent
        }
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      gap: 12,
      backgroundColor: colors.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    title: {
      flex: 1,
      flexShrink: 1,
      fontSize: 26,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: -0.3,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
    },
    itemSeparator: {
      height: 10,
    },
    emptyContent: {
      flex: 1,
    },
    footerLoader: {
      paddingVertical: 20,
      alignItems: 'center',
    },
  });
}
