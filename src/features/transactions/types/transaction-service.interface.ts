import type { PaginatedResult } from '@/src/shared/types/pagination';
import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from './transaction';
import type { TransactionFilter } from './transaction-filter';

/**
 * Contrato do serviço de transações.
 * Na Fase 4 uma implementação de repositório substituirá este objeto
 * sem alterar nenhum hook consumidor.
 */
export interface ITransactionService {
  getPage(
    userId: string,
    cursor?: unknown,
    filter?: TransactionFilter,
  ): Promise<PaginatedResult<Transaction>>;

  create(userId: string, data: CreateTransactionInput): Promise<Transaction>;

  update(id: string, userId: string, data: UpdateTransactionInput): Promise<Transaction>;

  delete(id: string, userId: string): Promise<void>;

}
