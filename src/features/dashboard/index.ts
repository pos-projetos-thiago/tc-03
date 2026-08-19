// Tipos de domínio
export type { CategoryBreakdown, DashboardSummary } from './types/dashboard-summary';

// Utilitários de cálculo (expostos para testes)
export {
  buildCategoryBreakdown,
  calculateBalance,
  endOfMonth,
  startOfMonth,
  sumByType,
} from './utils/dashboard-calculators';

// Serviço
export { dashboardService } from './services/dashboard.service';

// Hook
export { useDashboard } from './hooks/use-dashboard';

// Componentes
export { DashboardScreen } from './components/dashboard-screen';
