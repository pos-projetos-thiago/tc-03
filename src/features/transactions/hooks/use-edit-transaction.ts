import { useCallback, useState } from 'react';

import { transactionService } from '../services/firestore-transaction.service';
import type { Transaction, UpdateTransactionInput } from '../types/transaction';

interface UseEditTransactionResult {
  edit: (id: string, userId: string, data: UpdateTransactionInput) => Promise<Transaction | null>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Encapsula a lógica de edição de uma transação via transactionService.
 * Retorna a transação atualizada em caso de sucesso, ou `null` em caso de erro.
 */
export function useEditTransaction(): UseEditTransactionResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const edit = useCallback(
    async (
      id: string,
      userId: string,
      data: UpdateTransactionInput,
    ): Promise<Transaction | null> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const transaction = await transactionService.update(id, userId, data);
        return transaction;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível atualizar a transação.';
        setError(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { edit, isSubmitting, error, clearError };
}
