import { createContext } from 'react';

import type { Transaction } from '../types/transaction';
import type { TransactionFilter } from '../types/transaction-filter';

/**
 * Contrato público exposto pelo TransactionProvider.
 *
 * Decisões de design:
 * - `filter` e `setFilter` ficam aqui para que qualquer consumidor (ex: tela
 *   de transações) possa ler/alterar o filtro ativo sem prop drilling.
 * - `refresh` e `loadMore` são expostos para que a tela possa disparar
 *   recargas após criar, editar ou excluir uma transação.
 * - Mantido agnóstico à implementação — na Fase 4 o Provider pode ser
 *   trocado sem alterar nenhum consumidor.
 */
export interface TransactionContextValue {
  /** Lista de transações já carregadas (página acumulada). */
  transactions: Transaction[];
  /** `true` durante o carregamento da primeira página. */
  isLoading: boolean;
  /** `true` durante o carregamento de páginas adicionais (scroll infinito). */
  isLoadingMore: boolean;
  /** `true` quando há mais páginas disponíveis no Firestore. */
  hasMore: boolean;
  /** Mensagem de erro da última operação, ou `null`. */
  error: string | null;
  /** Filtro atualmente aplicado à listagem. */
  filter: TransactionFilter;
  /** Atualiza o filtro e reinicia a paginação do zero. */
  setFilter: (filter: TransactionFilter) => void;
  /** Recarrega a primeira página descartando o estado atual. */
  refresh: () => void;
  /** Carrega a próxima página e acumula ao estado atual. */
  loadMore: () => void;
}

export const TransactionContext = createContext<TransactionContextValue | null>(null);
