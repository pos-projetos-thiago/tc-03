import { transactionService } from '@/src/features/transactions/services/firestore-transaction.service';
import type { Transaction } from '@/src/features/transactions/types/transaction';
import type { DashboardSummary } from '../types/dashboard-summary';
import {
  buildCategoryBreakdown,
  calculateBalance,
  calculateNetWorth,
  endOfMonth,
  startOfMonth,
  sumByType,
} from '../utils/dashboard-calculators';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECENT_COUNT = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Busca todas as páginas de um filtro usando o cursor do transactionService.
 * Necessário para cálculos de totais que não podem depender do PAGE_SIZE fixo.
 */
async function fetchAllPages(
  userId: string,
  filter: Parameters<typeof transactionService.getPage>[2],
): Promise<Transaction[]> {
  const all: Transaction[] = [];
  let cursor: unknown = undefined;

  do {
    const page = await transactionService.getPage(userId, cursor, filter);
    all.push(...page.items);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor !== undefined);

  return all;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Calcula o resumo financeiro do dashboard para o mês de referência.
 *
 * Estratégia de consulta (3 buscas em paralelo):
 *   1. Transações de conta corrente do mês (income + expense via filtro de data)
 *   2. Investimentos do mês (investment via filtro de data + type)
 *   3. Todo o histórico (para saldo disponível e patrimônio all-time)
 *
 * Não acessa o Firestore diretamente — delega ao transactionService,
 * preservando a substituibilidade planejada para a Fase 4.
 *
 * Semântica financeira:
 *   balance  = income(all) - expense(all) - investment(all)  → saldo disponível
 *   netWorth = income(all) - expense(all)                    → patrimônio total
 */
async function getSummary(
  userId: string,
  referenceMonth: Date = new Date(),
): Promise<DashboardSummary> {
  const monthStart = startOfMonth(referenceMonth);
  const monthEnd = endOfMonth(referenceMonth);

  const dateRange = { start: monthStart, end: monthEnd };

  // Busca paralela: todas as transações do mês + histórico completo
  const [monthTransactions, allTransactions] = await Promise.all([
    fetchAllPages(userId, { type: null, category: null, dateRange }),
    fetchAllPages(userId, { type: null, category: null, dateRange: null }),
  ]);

  // Separa conta corrente de investimentos dentro do mês
  const monthCurrentAccount = monthTransactions.filter((t) => t.type !== 'investment');
  const monthInvestments = monthTransactions.filter((t) => t.type === 'investment');

  const totalIncome = sumByType(monthTransactions, 'income');
  const totalExpense = sumByType(monthTransactions, 'expense');
  const totalInvested = sumByType(monthTransactions, 'investment');

  const balance = calculateBalance(allTransactions);
  const netWorth = calculateNetWorth(allTransactions);

  return {
    balance,
    netWorth,
    totalIncome,
    totalExpense,
    totalInvested,
    transactionCount: monthCurrentAccount.length,
    recentTransactions: monthCurrentAccount.slice(0, RECENT_COUNT),
    expensesByCategory: buildCategoryBreakdown(
      monthTransactions.filter((t) => t.type === 'expense'),
    ),
    incomeByCategory: buildCategoryBreakdown(
      monthTransactions.filter((t) => t.type === 'income'),
    ),
    investmentsByCategory: buildCategoryBreakdown(monthInvestments),
    recentInvestments: monthInvestments.slice(0, RECENT_COUNT),
    referenceMonth: monthStart,
  };
}

export const dashboardService = { getSummary };
