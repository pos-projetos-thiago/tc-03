/**
 * Categorias válidas para transações do tipo 'investment'.
 * Usadas no formulário como picker e no dashboard para distribuição.
 */
export const INVESTMENT_CATEGORIES = [
  'Fundos Imobiliários',
  'Tesouro Direto',
  'Previdência Privada',
  'Bolsa de Valores',
] as const;

export type InvestmentCategory = (typeof INVESTMENT_CATEGORIES)[number];
