// API pública da feature transactions
export type { CreateTransactionInput, Transaction, TransactionType, UpdateTransactionInput } from './types/transaction';
export { DEFAULT_FILTER } from './types/transaction-filter';
export type { TransactionFilter } from './types/transaction-filter';
export type { ITransactionService } from './types/transaction-service.interface';
export { INVESTMENT_CATEGORIES } from './types/transaction-investment-categories';
export type { InvestmentCategory } from './types/transaction-investment-categories';

// Serviço (exposto para hooks e testes)
export { transactionService } from './services/firestore-transaction.service';

// Context — estado global de transações (Context API)
export type { TransactionContextValue } from './context/transaction-context';
export { TransactionProvider } from './context/transaction-provider';

// Hooks
export { useCreateTransaction } from './hooks/use-create-transaction';
export { useDeleteTransaction } from './hooks/use-delete-transaction';
export { useEditTransaction } from './hooks/use-edit-transaction';
export { useTransactionContext } from './hooks/use-transaction-context';
export { useTransactions } from './hooks/use-transactions';

// Componentes de apresentação
export { TransactionFilterBar } from './components/transaction-filter-bar';
export { TransactionForm } from './components/transaction-form';
export { TransactionItem } from './components/transaction-item';
export { TransactionListScreen } from './components/transaction-list-screen';

