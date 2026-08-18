import { useCallback, useState } from 'react';

import { transactionService } from '../services/firestore-transaction.service';

interface UseDeleteTransactionResult {
  remove: (id: string, userId: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Encapsula a lógica de exclusão de uma transação via transactionService.
 * Retorna `true` em caso de sucesso, `false` em caso de erro.
 */
export function useDeleteTransaction(): UseDeleteTransactionResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: string, userId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      await transactionService.delete(id, userId);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível excluir a transação.';
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { remove, isDeleting, error, clearError };
}
