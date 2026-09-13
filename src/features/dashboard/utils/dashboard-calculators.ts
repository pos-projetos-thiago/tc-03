import type { Transaction, TransactionType } from '@/src/features/transactions/types/transaction';
import type { CategoryBreakdown } from '../types/dashboard-summary';

/** Soma os valores de todas as transações do tipo especificado. */
export function sumByType(
  transactions: Transaction[],
  type: TransactionType,
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + t.amount, 0);
}

/**
 * Saldo disponível: income - expense - investment (histórico completo).
 * Investimentos reduzem o saldo disponível mas não o patrimônio.
 */
export function calculateBalance(allTransactions: Transaction[]): number {
  return (
    sumByType(allTransactions, 'income') -
    sumByType(allTransactions, 'expense') -
    sumByType(allTransactions, 'investment')
  );
}

/**
 * Patrimônio líquido: income - expense.
 * Investimentos são neutros — representam realocação, não gasto.
 */
export function calculateNetWorth(allTransactions: Transaction[]): number {
  return sumByType(allTransactions, 'income') - sumByType(allTransactions, 'expense');
}

/**
 * Agrupa transações por categoria e calcula total e percentual de cada uma.
 * O percentual é relativo ao total geral do conjunto recebido.
 */
export function buildCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  if (transactions.length === 0) return [];

  const totals = new Map<string, number>();

  for (const t of transactions) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }

  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0);

  return [...totals.entries()]
    .map(([category, total]) => ({
      category,
      total,
      percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Retorna o primeiro instante do mês (UTC) para uma data de referência. */
export function startOfMonth(ref: Date): Date {
  return new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1, 0, 0, 0, 0));
}

/** Retorna o último instante do mês (UTC) para uma data de referência. */
export function endOfMonth(ref: Date): Date {
  return new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
}
