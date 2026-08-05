export interface TransactionFilter {
  type: 'income' | 'expense' | null;
  category: string | null;
  dateRange: { start: Date; end: Date } | null;
}

export const DEFAULT_FILTER: TransactionFilter = {
  type: null,
  category: null,
  dateRange: null,
};
