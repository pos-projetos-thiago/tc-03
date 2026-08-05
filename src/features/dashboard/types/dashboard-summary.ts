import type { Transaction } from '@/src/features/transactions/types/transaction';

export interface DashboardSummary {
  balance: number;                      // totalIncome (all time) - totalExpense (all time)
  totalIncome: number;                  // soma de income do mês atual
  totalExpense: number;                 // soma de expense do mês atual
  recentTransactions: Transaction[];    // 5 mais recentes por date desc
}
