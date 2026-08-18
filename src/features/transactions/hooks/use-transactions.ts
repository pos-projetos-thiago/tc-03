import { useCallback, useEffect, useState } from 'react';

import { transactionService } from '../services/firestore-transaction.service';
import type { Transaction } from '../types/transaction';
import { DEFAULT_FILTER, type TransactionFilter } from '../types/transaction-filter';

interface UseTransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

interface UseTransactionsResult extends UseTransactionsState {
  refresh: () => void;
}

/**
 * Carrega a primeira página de transações do usuário autenticado.
 * Aceita filtro opcional; quando omitido usa DEFAULT_FILTER (sem filtro).
 * Paginação avançada será adicionada na Sprint 4.
 */
export function useTransactions(
  userId: string | null,
  filter: TransactionFilter = DEFAULT_FILTER,
): UseTransactionsResult {
  const [state, setState] = useState<UseTransactionsState>({
    transactions: [],
    isLoading: false,
    error: null,
  });

  // Serializa o filtro para usar como dependência estável do useCallback
  const filterKey = JSON.stringify(filter);

  const load = useCallback(async () => {
    if (!userId) return;

    setState({ transactions: [], isLoading: true, error: null });

    try {
      const result = await transactionService.getPage(userId, undefined, filter);
      setState({ transactions: result.items, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as transações.';
      setState({ transactions: [], isLoading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refresh: load };
}
