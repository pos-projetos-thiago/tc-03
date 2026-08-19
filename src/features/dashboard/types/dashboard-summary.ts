import type { Transaction } from '@/src/features/transactions/types/transaction';

/** Distribuição de valor por categoria. */
export interface CategoryBreakdown {
  category: string;
  total: number;
  /** Percentual em relação ao total do mesmo tipo (0–100). */
  percentage: number;
}

/**
 * Resumo financeiro calculado para o mês de referência.
 *
 * Semântica financeira:
 *   balance    = saldo disponível: income - expense - investment (all time)
 *   netWorth   = patrimônio total: income - expense (= balance + totalInvested histórico)
 *   Os campos totalIncome/totalExpense/totalInvested referem-se ao mês de referência.
 */
export interface DashboardSummary {
  /** Saldo disponível em conta (all time): income - expense - investment. */
  balance: number;
  /** Patrimônio total (all time): income - expense. Neutro a investimentos. */
  netWorth: number;
  /** Soma das receitas no mês de referência. */
  totalIncome: number;
  /** Soma das despesas no mês de referência. */
  totalExpense: number;
  /** Soma dos investimentos no mês de referência. */
  totalInvested: number;
  /**
   * Quantidade de operações de conta corrente (income + expense) no mês.
   * Investimentos não são contados aqui.
   */
  transactionCount: number;
  /** Cinco transações de conta corrente mais recentes do mês de referência. */
  recentTransactions: Transaction[];
  /** Distribuição de despesas por categoria no mês de referência. */
  expensesByCategory: CategoryBreakdown[];
  /** Distribuição de receitas por categoria no mês de referência. */
  incomeByCategory: CategoryBreakdown[];
  /** Distribuição de investimentos por categoria no mês de referência. */
  investmentsByCategory: CategoryBreakdown[];
  /** Cinco investimentos mais recentes do mês de referência. */
  recentInvestments: Transaction[];
  /** Mês de referência usado para os cálculos (primeiro dia do mês, UTC). */
  referenceMonth: Date;
}
