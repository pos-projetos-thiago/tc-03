import { useCallback, useEffect, useRef, useState } from 'react';

import { transactionService } from '../services/firestore-transaction.service';
import type { Transaction } from '../types/transaction';
import { DEFAULT_FILTER, type TransactionFilter } from '../types/transaction-filter';

interface UseTransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
}

interface UseTransactionsResult extends UseTransactionsState {
  refresh: () => void;
  loadMore: () => void;
}

/**
 * Carrega transações do usuário com suporte a scroll infinito.
 * `refresh` recarrega do início; `loadMore` acumula a próxima página.
 * Quando o filtro muda, a paginação é resetada automaticamente.
 */
export function useTransactions(
  userId: string | null,
  filter: TransactionFilter = DEFAULT_FILTER,
): UseTransactionsResult {
  const [state, setState] = useState<UseTransactionsState>({
    transactions: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    error: null,
  });

  const cursorRef = useRef<unknown>(undefined);
  const isFetchingRef = useRef(false);
  const filterKey = JSON.stringify(filter);

  const load = useCallback(async () => {
    if (!userId) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    cursorRef.current = undefined;

    setState((prev) => ({
      ...prev,
      transactions: [],
      isLoading: true,
      isLoadingMore: false,
      error: null,
    }));

    try {
      const result = await transactionService.getPage(userId, undefined, filter);
      cursorRef.current = result.hasMore ? result.cursor : undefined;
      setState({
        transactions: result.items,
        isLoading: false,
        isLoadingMore: false,
        hasMore: result.hasMore,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as transações.';
      setState({
        transactions: [],
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        error: message,
      });
    } finally {
      isFetchingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterKey]);

  const loadMore = useCallback(async () => {
    if (!userId) return;
    if (isFetchingRef.current) return;
    if (!cursorRef.current) return;

    isFetchingRef.current = true;

    setState((prev) => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const result = await transactionService.getPage(userId, cursorRef.current, filter);
      cursorRef.current = result.hasMore ? result.cursor : undefined;
      setState((prev) => ({
        ...prev,
        transactions: [...prev.transactions, ...result.items],
        isLoadingMore: false,
        hasMore: result.hasMore,
      }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar mais transações.';
      setState((prev) => ({ ...prev, isLoadingMore: false, error: message }));
    } finally {
      isFetchingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    refresh: load,
    loadMore,
  };
}
