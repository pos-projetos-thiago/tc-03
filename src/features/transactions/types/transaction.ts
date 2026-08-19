/** Tipo da operação financeira. */
export type TransactionType = 'income' | 'expense' | 'investment';

/** Domain model — entidade financeira da aplicação */
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;           // sempre positivo (> 0)
  category: string;
  description: string;
  date: string;             // ISO 8601
  receiptUrl: string | null;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>;
