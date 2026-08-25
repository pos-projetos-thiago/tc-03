import { useContext } from 'react';

import {
  TransactionContext,
  type TransactionContextValue,
} from '../context/transaction-context';

/**
 * Hook de acesso ao TransactionContext.
 *
 * Deve ser usado dentro de um <TransactionProvider>.
 * Lança erro descritivo se chamado fora do Provider para facilitar diagnóstico.
 */
export function useTransactionContext(): TransactionContextValue {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      'useTransactionContext deve ser usado dentro de um <TransactionProvider>',
    );
  }
  return context;
}
