import { useCallback, useState } from 'react';

import { transactionService } from '../services/firestore-transaction.service';
import type { CreateTransactionInput, Transaction } from '../types/transaction';

interface UseCreateTransactionResult {
  create: (data: CreateTransactionInput) => Promise<Transaction | null>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Encapsula a lógica de criação de uma transação via transactionService.
 * Retorna a transação criada em caso de sucesso, ou `null` em caso de erro.
 */
export function useCreateTransaction(): UseCreateTransactionResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: CreateTransactionInput): Promise<Transaction | null> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const transaction = await transactionService.create(data.userId, data);
        return transaction;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível salvar a transação.';
        setError(message);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { create, isSubmitting, error, clearError };
}
