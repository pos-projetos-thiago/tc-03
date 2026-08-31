import { useCallback, useEffect, useState } from 'react';

import { dashboardService } from '../services/dashboard.service';
import type { DashboardSummary } from '../types/dashboard-summary';

interface UseDashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
}

interface UseDashboardResult extends UseDashboardState {
  refresh: () => void;
}

/**
 * Carrega o resumo financeiro do dashboard para o mês de referência.
 * Quando `referenceMonth` não é fornecido, usa o mês corrente.
 */
export function useDashboard(
  userId: string | null,
  referenceMonth?: Date,
): UseDashboardResult {
  const [state, setState] = useState<UseDashboardState>({
    summary: null,
    isLoading: false,
    error: null,
  });

  // Serializa o mês para dependência estável do useCallback
  const monthKey = referenceMonth
    ? `${referenceMonth.getUTCFullYear()}-${referenceMonth.getUTCMonth()}`
    : 'current';

  const load = useCallback(async () => {
    if (!userId) return;

    setState((prev) => ({
      summary: prev.summary,
      isLoading: true,
      error: null,
    }));

    try {
      const summary = await dashboardService.getSummary(userId, referenceMonth);
      setState({ summary, isLoading: false, error: null });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o resumo financeiro.';
      setState({ summary: null, isLoading: false, error: message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, monthKey]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, refresh: load };
}
