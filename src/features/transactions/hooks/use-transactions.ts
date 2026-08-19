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
 * Carrega transações do usuário autenticado com suporte a scroll infinito.
 *
 * - `refresh`: recarrega do início, descartando páginas anteriores.
 * - `loadMore`: carrega a próxima página e acumula aos itens existentes.
 *   Não faz nada se `hasMore` for false ou já houver uma carga em andamento.
 * - Quando o filtro muda, a paginação é resetada automaticamente.
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

  // Cursor opaco mantido em ref para não entrar em ciclos de dependência
  const cursorRef = useRef<unknown>(undefined);

  // Flag para impedir chamadas simultâneas de loadMore
  const isFetchingRef = useRef(false);

  // Serializa o filtro para dependência estável
  const filterKey = JSON.stringify(filter);

  // ---------------------------------------------------------------------------
  // Carrega a primeira página (ou recarrega do zero)
  // ---------------------------------------------------------------------------
  const load = useCallback(async () => {
    if (!userId) return;

    // Previne chamada simultânea
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

  // ---------------------------------------------------------------------------
  // Carrega a próxima página e acumula
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Dispara carga inicial e reseta quando filtro ou userId mudam
  // ---------------------------------------------------------------------------
  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    refresh: load,
    loadMore,
  };
}
