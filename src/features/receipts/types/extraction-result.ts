import type { TransactionType } from '@/src/features/transactions/types/transaction';

/**
 * Resultado estruturado retornado pelo serviço de extração por IA.
 * Todos os campos de transação são nullable — a IA retorna null
 * quando não consegue identificar a informação com segurança.
 */
export interface ExtractionResult {
  /** Tipo da transação identificada, ou null se indeterminado. */
  type: TransactionType | null;
  /** Valor monetário (sempre positivo), ou null se não encontrado. */
  amount: number | null;
  /** Categoria sugerida, ou null se não identificável. */
  category: string | null;
  /** Descrição resumida da transação, ou null. */
  description: string | null;
  /** Data no formato ISO 8601, ou null se não encontrada no documento. */
  date: string | null;
  /** Confiança geral da interpretação. */
  confidence: 'high' | 'medium' | 'low';
  /** Texto bruto extraído do documento (útil para debug e auditoria). */
  rawText: string | null;
}
