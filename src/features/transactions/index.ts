// API pública da feature transactions
export type { CreateTransactionInput, Transaction, UpdateTransactionInput } from './types/transaction';
export { DEFAULT_FILTER } from './types/transaction-filter';
export type { TransactionFilter } from './types/transaction-filter';
export type { ITransactionService } from './types/transaction-service.interface';

// Serviço (exposto para hooks e testes)
export { transactionService } from './services/firestore-transaction.service';

// Hooks
export { useCreateTransaction } from './hooks/use-create-transaction';
export { useDeleteTransaction } from './hooks/use-delete-transaction';
export { useEditTransaction } from './hooks/use-edit-transaction';
export { useTransactions } from './hooks/use-transactions';

// Componentes de apresentação
export { TransactionFilterBar } from './components/transaction-filter-bar';
export { TransactionForm } from './components/transaction-form';
export { TransactionItem } from './components/transaction-item';
export { TransactionListScreen } from './components/transaction-list-screen';

