import React, { useCallback, useMemo, useState } from 'react';

import { useAuth } from '@/src/features/auth';

import { useTransactions } from '../hooks/use-transactions';
import { DEFAULT_FILTER, type TransactionFilter } from '../types/transaction-filter';
import { TransactionContext } from './transaction-context';

interface TransactionProviderProps {
  children: React.ReactNode;
}

/**
 * Provedor global do estado de transações.
 *
 * Responsabilidades:
 * - Obtém o `userId` do AuthContext — reage automaticamente ao login/logout.
 * - Mantém o filtro ativo como estado local (não pertence ao domínio de negócio).
 * - Delega toda a lógica de paginação e fetch ao `useTransactions` existente,
 *   evitando duplicação de regras de negócio.
 * - Expõe o valor via `TransactionContext` para qualquer descendente.
 *
 * Colocado dentro do `AuthProvider` no _layout.tsx para que `useAuth()`
 * sempre resolva corretamente.
 */
export function TransactionProvider({ children }: TransactionProviderProps) {
  const { user } = useAuth();

  const [filter, setFilterState] = useState<TransactionFilter>(DEFAULT_FILTER);

  const {
    transactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
  } = useTransactions(user?.id ?? null, filter);

  /**
   * Atualiza o filtro.
   * `useTransactions` já reinicia a paginação automaticamente quando o
   * filtro muda (via `filterKey` na dependência do useCallback interno).
   */
  const setFilter = useCallback((newFilter: TransactionFilter) => {
    setFilterState(newFilter);
  }, []);

  const value = useMemo(
    () => ({
      transactions,
      isLoading,
      isLoadingMore,
      hasMore,
      error,
      filter,
      setFilter,
      refresh,
      loadMore,
    }),
    [transactions, isLoading, isLoadingMore, hasMore, error, filter, setFilter, refresh, loadMore],
  );

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
