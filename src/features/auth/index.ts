// Tipos de domínio
export type { IAuthService } from './types/auth-service.interface';
export type { User } from './types/user';

// Contexto
export type { AuthContextValue } from './context/auth-context';

// Provider e hook
export { AuthProvider } from './context/auth-provider';
export { useAuth } from './hooks/use-auth';

// Serviço (exposto para testes e uso direto quando necessário)
export { authService } from './services/firebase-auth.service';
