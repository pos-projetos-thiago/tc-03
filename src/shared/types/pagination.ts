/**
 * Resultado paginado genérico.
 * `cursor` é opaco aqui intencionalmente: na Fase 3 será um DocumentSnapshot
 * do Firestore; na Fase 4 o tipo pode evoluir sem breaking change nos consumers.
 */
export interface PaginatedResult<T> {
  items: T[];
  cursor: unknown | null;
  hasMore: boolean;
}
