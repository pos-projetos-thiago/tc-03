import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/src/features/auth';
import { EmptyState } from '@/src/shared/components/empty-state';
import { ErrorMessage } from '@/src/shared/components/error-message';
import { LoadingSpinner } from '@/src/shared/components/loading-spinner';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';

import { useDeleteTransaction } from '../hooks/use-delete-transaction';
import { useTransactions } from '../hooks/use-transactions';
import { DEFAULT_FILTER, type TransactionFilter } from '../types/transaction-filter';
import type { Transaction } from '../types/transaction';
import { TransactionFilterBar } from './transaction-filter-bar';
import { TransactionItem } from './transaction-item';

/**
 * Tela principal de transações.
 *
 * - Recarrega via useFocusEffect ao voltar de criação ou edição,
 *   mas apenas se a tela já tiver sido montada (evita requisição dupla inicial).
 * - Suporta scroll infinito via onEndReached + loadMore.
 * - Suporta filtro por tipo, categoria e período.
 */
export function TransactionListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();

  const [filter, setFilter] = useState<TransactionFilter>(DEFAULT_FILTER);
  const [showFilters, setShowFilters] = useState(false);

  const {
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useTransactions(user?.id ?? null, filter);

  const { remove, isDeleting, error: deleteError } = useDeleteTransaction();

  const isFilterActive =
    filter.type !== null || filter.category !== null || filter.dateRange !== null;

  // Controla se a tela já foi montada para evitar refresh duplo na abertura
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

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

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

  function handleApplyFilter(newFilter: TransactionFilter) {
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

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  function renderFooter() {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.tint} />
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // Loading inicial (primeira carga sem filtro ativo)
  // -------------------------------------------------------------------------

  if (isLoading && transactions.length === 0 && !isFilterActive) {
    return <LoadingSpinner fullScreen />;
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Transações</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.filterToggle,
              isFilterActive && { borderColor: colors.tint },
            ]}
            onPress={() => setShowFilters((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showFilters ? 'Fechar filtros' : 'Abrir filtros'}
            accessibilityState={{ expanded: showFilters }}>
            <Text
              style={[
                styles.filterToggleText,
                { color: isFilterActive ? colors.tint : colors.icon },
              ]}>
              {isFilterActive ? '⊙ Filtros' : '⊙ Filtrar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/transactions/new')}
            disabled={isDeleting}
            accessibilityRole="button"
            accessibilityLabel="Nova transação">
            <Text style={styles.addButtonText}>+ Nova</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Painel de filtros (colapsável) */}
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
            onPress={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
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
                  : "Toque em '+ Nova' para adicionar sua primeira transação."
              }
            />
          ) : null
        }
        contentContainerStyle={
          transactions.length === 0 ? styles.emptyContent : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContent: {
    flex: 1,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
