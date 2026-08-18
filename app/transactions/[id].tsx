import { useLocalSearchParams } from 'expo-router';

import { TransactionForm } from '@/src/features/transactions/components/transaction-form';
import type { Transaction } from '@/src/features/transactions/types/transaction';

/**
 * Tela de edição de transação.
 * Recebe os dados da transação serializada em JSON via params.
 */
export default function EditTransactionScreen() {
  const { data } = useLocalSearchParams<{ id: string; data: string }>();

  const initialData: Transaction | undefined = data
    ? (JSON.parse(data) as Transaction)
    : undefined;

  return <TransactionForm initialData={initialData} />;
}
