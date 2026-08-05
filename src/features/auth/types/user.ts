/** Domain model — representa o usuário autenticado na aplicação */
export interface User {
  id: string;
  email: string;
  displayName: string | null;
}
