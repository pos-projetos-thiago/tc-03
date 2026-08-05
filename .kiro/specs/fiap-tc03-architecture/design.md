# Design Document

## Overview

Este documento descreve a arquitetura técnica do Tech Challenge FIAP Fase 3 — um aplicativo de finanças pessoais em React Native (Expo SDK 54) com Firebase como backend.

A estratégia é uma **Feature-First Architecture com camadas internas por responsabilidade**. Não é Clean Architecture, mas respeita os mesmos limites de dependência. Na Fase 4, a migração se resume a mover arquivos para novas pastas (`domain/`, `infrastructure/`, `presentation/`) sem reescrever lógica.

---

## Architecture

### Princípio Central: Direção de Dependência

Toda decisão arquitetural parte de uma única regra:

```
UI → Hooks → Services → Firebase
```

Nenhuma camada conhece a camada acima dela. A UI (telas e componentes) nunca sabe que o Firebase existe. Os Services nunca sabem que há uma tela renderizando seus dados.

### Visão Geral das Camadas

```
┌─────────────────────────────────────────────────────┐
│  app/ (Rotas — Expo Router)                          │
│  Importa: hooks/, components/, shared/               │
│  NÃO importa: services/, lib/firebase/               │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  features/<f>/components/                            │
│  Importa: hooks/, types/, shared/                    │
│  NÃO importa: services/, lib/firebase/               │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  features/<f>/hooks/                                 │
│  Importa: context/, services/, types/, shared/       │
│  NÃO importa: app/, outra feature diretamente        │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  features/<f>/services/                              │
│  Importa: lib/firebase/, types/, mappers/            │
│  NÃO importa: components/, context/, app/            │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  lib/firebase/                                       │
│  Importa: firebase SDK apenas                        │
│  NÃO importa: nada do projeto                        │
└─────────────────────────────────────────────────────┘
```

Dependências proibidas:
- `features/A` → `features/B` (use `shared/` como ponte, ou Context provido no root)
- `shared/` → `features/` (shared é agnóstico de feature)
- `app/` → `services/` (use hooks como intermediário)
- `app/` → `lib/firebase/` (idem)
- `components/` → `lib/firebase/` (idem)

### Estrutura de Pastas Completa

```
tc-03/
│
├── app/                              # Expo Router — só rotas e layouts
│   ├── _layout.tsx                   # Root layout: monta todos os Providers
│   ├── (auth)/
│   │   ├── _layout.tsx               # Redireciona autenticados para /(tabs)
│   │   ├── login.tsx                 # Renderiza <LoginScreen />
│   │   └── register.tsx              # Renderiza <RegisterScreen />
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Tab bar (Dashboard + Transactions)
│   │   ├── dashboard.tsx             # Renderiza <DashboardScreen />
│   │   └── transactions.tsx          # Renderiza <TransactionListScreen />
│   └── transactions/
│       ├── new.tsx                   # Renderiza <TransactionFormScreen /> (criação)
│       └── [id].tsx                  # Renderiza <TransactionFormScreen /> (edição)
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── register-form.tsx
│   │   │   ├── context/
│   │   │   │   └── auth-context.tsx  # AuthContext + AuthProvider + useAuthContext
│   │   │   ├── hooks/
│   │   │   │   └── use-auth.ts       # Hook público: user, signIn, signUp, signOut
│   │   │   ├── mappers/
│   │   │   │   └── auth-mapper.ts    # firebaseUserToUser()
│   │   │   ├── services/
│   │   │   │   └── auth-service.ts   # signIn, signUp, signOut, onAuthStateChanged
│   │   │   ├── types/
│   │   │   │   ├── user.ts
│   │   │   │   ├── auth-dto.ts
│   │   │   │   └── auth-service.interface.ts
│   │   │   └── index.ts              # Barrel export público
│   │   │
│   │   ├── transactions/
│   │   │   ├── components/
│   │   │   │   ├── transaction-list.tsx
│   │   │   │   ├── transaction-card.tsx
│   │   │   │   ├── transaction-form.tsx
│   │   │   │   └── transaction-filters.tsx
│   │   │   ├── context/
│   │   │   │   └── transaction-context.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-transactions.ts
│   │   │   │   ├── use-transaction-filters.ts
│   │   │   │   └── use-transaction-pagination.ts
│   │   │   ├── mappers/
│   │   │   │   └── transaction-mapper.ts   # TransactionDTO ↔ Transaction
│   │   │   ├── services/
│   │   │   │   └── transaction-service.ts
│   │   │   ├── types/
│   │   │   │   ├── transaction.ts
│   │   │   │   ├── transaction-dto.ts
│   │   │   │   ├── transaction-filter.ts
│   │   │   │   └── transaction-service.interface.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── balance-card.tsx
│   │   │   │   ├── summary-row.tsx
│   │   │   │   └── recent-transactions.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-dashboard.ts
│   │   │   ├── types/
│   │   │   │   └── dashboard-summary.ts
│   │   │   └── index.ts
│   │   │
│   │   └── receipts/
│   │       ├── components/
│   │       │   ├── receipt-picker.tsx
│   │       │   └── receipt-preview.tsx
│   │       ├── hooks/
│   │       │   └── use-receipt-upload.ts
│   │       ├── services/
│   │       │   └── receipt-service.ts
│   │       ├── types/
│   │       │   ├── receipt.ts
│   │       │   └── receipt-service.interface.ts
│   │       └── index.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── button.tsx
│   │   │   ├── text-input.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── error-message.tsx
│   │   │   └── empty-state.tsx
│   │   ├── hooks/
│   │   │   └── use-debounce.ts
│   │   ├── utils/
│   │   │   ├── format-currency.ts
│   │   │   ├── format-date.ts
│   │   │   └── validators.ts
│   │   └── types/
│   │       └── pagination.ts
│   │
│   └── lib/
│       └── firebase/
│           ├── config.ts
│           ├── auth.ts
│           ├── firestore.ts
│           └── storage.ts
│
├── assets/
├── constants/
│   └── theme.ts
├── app.json
├── tsconfig.json
└── package.json
```

### Proteção de Rotas

O Expo Router usa grupos de rotas para controle de acesso:

- `app/(auth)/` — acessível apenas por usuários **não autenticados**. O `_layout.tsx` verifica `useAuth().user` e redireciona para `/(tabs)/dashboard` se já logado.
- `app/(tabs)/` — acessível apenas por usuários **autenticados**. O `_layout.tsx` verifica `useAuth().user` e redireciona para `/(auth)/login` se não logado.
- Enquanto `isLoading === true`, ambos os layouts exibem `<LoadingSpinner />` sem renderizar filhos.

### Composição de Providers no Root Layout

```
app/_layout.tsx
  └── <AuthProvider>              ← estado de autenticação global
        └── <TransactionProvider> ← lista de transações compartilhada
              └── <Stack />       ← navegação Expo Router
```

O `TransactionProvider` é provido no root para que tanto a tela de transações quanto o dashboard consumam o mesmo estado sem requisição duplicada.

### Fluxo de Dados por Módulo

**Autenticação:**
```
app/(auth)/login.tsx
  └── <LoginForm />
        └── useAuth()
              └── AuthContext
                    └── authService.signIn()
                          └── src/lib/firebase/auth.ts
```

**Transações (lista paginada + filtros):**
```
app/(tabs)/transactions.tsx
  └── <TransactionListScreen />
        ├── useTransactionPagination()  ← busca paginada do Firestore
        │     └── transactionService.getPage(cursor, filter)
        └── useTransactionFilters()     ← filtragem client-side sobre o array
```

**Dashboard (derivação de estado):**
```
app/(tabs)/dashboard.tsx
  └── <DashboardScreen />
        └── useDashboard()
              └── consome TransactionContext (mesmo dados da lista)
                    └── deriva balance/totalIncome/totalExpense via reduce()
```

O dashboard não faz requisição própria ao Firestore. Consome o `TransactionContext` já populado, garantindo atualização automática quando uma transação é criada/editada/deletada.

**Upload de Recibo:**
```
<TransactionForm />
  └── useReceiptUpload()
        ├── receiptService.upload() → Firebase Storage → retorna URL
        └── transactionService.update({ receiptUrl }) → Firestore
```

---

## Components and Interfaces

### Interfaces de Service

Cada Service implementa uma interface TypeScript definida em `types/`. Esses contratos são o que torna a Fase 4 incremental — os Hooks dependem da interface, não da implementação.

**IAuthService**
```typescript
interface IAuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
```

**ITransactionService**
```typescript
interface ITransactionService {
  getPage(
    userId: string,
    cursor?: unknown,
    filter?: TransactionFilter
  ): Promise<PaginatedResult<Transaction>>;
  create(
    userId: string,
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction>;
  update(
    id: string,
    userId: string,
    data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Transaction>;
  delete(id: string, userId: string): Promise<void>;
}
```

**IReceiptService**
```typescript
interface IReceiptService {
  upload(
    userId: string,
    transactionId: string,
    file: { uri: string; name: string; mimeType: string }
  ): Promise<{ url: string; progress: number }>;
  delete(userId: string, transactionId: string, fileName: string): Promise<void>;
}
```

### Hooks Públicos por Feature

**useAuth** (src/features/auth/hooks/use-auth.ts)
```typescript
interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
```

**useTransactions** (src/features/transactions/hooks/use-transactions.ts)
```typescript
interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  createTransaction(data: CreateTransactionInput): Promise<void>;
  updateTransaction(id: string, data: UpdateTransactionInput): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
}
```

**useTransactionPagination** (src/features/transactions/hooks/use-transaction-pagination.ts)
```typescript
interface UseTransactionPaginationReturn {
  transactions: Transaction[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore(): Promise<void>;
}
```

**useTransactionFilters** (src/features/transactions/hooks/use-transaction-filters.ts)
```typescript
interface UseTransactionFiltersReturn {
  filter: TransactionFilter;
  filteredTransactions: Transaction[];
  setFilter(filter: Partial<TransactionFilter>): void;
  clearFilters(): void;
}
```

**useDashboard** (src/features/dashboard/hooks/use-dashboard.ts)
```typescript
interface UseDashboardReturn {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}
```

**useReceiptUpload** (src/features/receipts/hooks/use-receipt-upload.ts)
```typescript
interface UseReceiptUploadReturn {
  uploadProgress: number | null;   // 0–100, null quando inativo
  isUploading: boolean;
  error: string | null;
  uploadReceipt(
    transactionId: string,
    file: ImagePickerAsset
  ): Promise<string>;              // retorna a URL pública
  removeReceipt(
    transactionId: string,
    fileName: string
  ): Promise<void>;
}
```

### Barrel Exports (API pública de cada feature)

Cada `index.ts` expõe apenas o necessário para consumo externo:

```typescript
// src/features/auth/index.ts
export { AuthProvider } from './context/auth-context';
export { useAuth } from './hooks/use-auth';
export type { User } from './types/user';

// src/features/transactions/index.ts
export { TransactionProvider } from './context/transaction-context';
export { useTransactions } from './hooks/use-transactions';
export { useTransactionPagination } from './hooks/use-transaction-pagination';
export { useTransactionFilters } from './hooks/use-transaction-filters';
export { TransactionList } from './components/transaction-list';
export { TransactionForm } from './components/transaction-form';
export type { Transaction, TransactionFilter } from './types/transaction';

// src/features/dashboard/index.ts
export { useDashboard } from './hooks/use-dashboard';
export { BalanceCard } from './components/balance-card';
export { RecentTransactions } from './components/recent-transactions';

// src/features/receipts/index.ts
export { useReceiptUpload } from './hooks/use-receipt-upload';
export { ReceiptPicker } from './components/receipt-picker';
export { ReceiptPreview } from './components/receipt-preview';
```

---

## Data Models

### Domain Models

```typescript
// src/features/auth/types/user.ts
interface User {
  id: string;
  email: string;
  displayName: string | null;
}

// src/features/transactions/types/transaction.ts
interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;           // sempre positivo, > 0
  category: string;
  description: string;
  date: string;             // ISO 8601: "2025-08-04T10:30:00.000Z"
  receiptUrl: string | null;
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}

// src/features/transactions/types/transaction-filter.ts
interface TransactionFilter {
  type: 'income' | 'expense' | null;
  category: string | null;
  dateRange: { start: Date; end: Date } | null;
}

// src/features/receipts/types/receipt.ts
interface Receipt {
  transactionId: string;
  userId: string;
  url: string;
  fileName: string;
  uploadedAt: string;       // ISO 8601
}

// src/features/dashboard/types/dashboard-summary.ts
interface DashboardSummary {
  balance: number;          // totalIncome - totalExpense (all time)
  totalIncome: number;      // soma income do mês atual
  totalExpense: number;     // soma expense do mês atual
  recentTransactions: Transaction[];  // 5 mais recentes por date desc
}

// src/shared/types/pagination.ts
interface PaginatedResult<T> {
  items: T[];
  cursor: unknown | null;   // DocumentSnapshot na Fase 3; tipo evolui na Fase 4
  hasMore: boolean;
}
```

### DTOs (formato Firestore)

```typescript
// src/features/transactions/types/transaction-dto.ts
interface TransactionDTO {
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Timestamp;          // Firebase Timestamp — única diferença do Domain Model
  receiptUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
// O `id` não está no DTO: vem do DocumentSnapshot.id
```

A única diferença estrutural entre `Transaction` e `TransactionDTO` são os campos de data (`Timestamp` vs `string ISO 8601`). O Mapper é o único ponto de conversão no sistema (Req 5.9).

### Estrutura do Firestore

```
users/
  {userId}/
    transactions/
      {transactionId}   ← TransactionDTO

Firebase Storage:
  receipts/{userId}/{transactionId}/{timestamp}.{ext}
```

Isolamento por usuário garantido em dois níveis: Security Rules no Firestore (nega acesso se `request.auth.uid !== userId`) e filtro `where('userId', '==', uid)` em todas as queries do `transactionService`.

### Mapeamento Fase 3 → Fase 4

| Artefato (Fase 3) | Camada (Fase 4) | Mudança necessária |
|---|---|---|
| `types/transaction.ts` | Domain — Entity | Nenhuma (mover de pasta) |
| `types/*.interface.ts` | Domain — Repository interface | Nenhuma (mover de pasta) |
| `mappers/` | Domain — Mapper | Nenhuma (função pura, zero dependências) |
| `services/` | Infrastructure — Repository impl. | Renomear + mover pasta |
| `lib/firebase/` | Infrastructure — Firebase adapter | Nenhuma |
| `context/` | Presentation — State / Zustand store | Substituir provider interno |
| `hooks/` | Presentation — ViewModel/Hook | Interface pública não muda |
| `components/` | Presentation — View | Nenhuma |
| `app/` | Presentation — Router | Nenhuma |
| `shared/` | Shared Kernel | Nenhuma |

---

## Error Handling

### Padrão de Erro nos Hooks

Todos os hooks assíncronos expõem `error: string | null`. O estado de erro é limpo no início de cada nova operação.

```typescript
// padrão adotado em todos os hooks
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

async function doOperation() {
  setError(null);
  setIsLoading(true);
  try {
    await service.doSomething();
  } catch (e) {
    setError(e instanceof Error ? e.message : 'Erro desconhecido');
  } finally {
    setIsLoading(false);
  }
}
```

### Mapeamento de Erros Firebase → Português

O `authService` é o único ponto que traduz erros do Firebase SDK para mensagens legíveis:

| Código Firebase | Mensagem exibida |
|---|---|
| `auth/user-not-found` | "E-mail não encontrado" |
| `auth/wrong-password` | "Senha incorreta" |
| `auth/email-already-in-use` | "Este e-mail já está em uso" |
| `auth/weak-password` | "A senha deve ter no mínimo 6 caracteres" |
| `auth/invalid-email` | "E-mail inválido" |
| `auth/network-request-failed` | "Sem conexão. Verifique sua internet" |
| (qualquer outro) | "Erro de autenticação. Tente novamente" |

O `transactionService` e o `receiptService` seguem o mesmo padrão: nunca propagam códigos internos do Firebase para os hooks.

### Estratégia de Estado em Caso de Falha

- **Criação/edição/exclusão de transação**: em caso de falha, o estado local é revertido (optimistic update não é usado na Fase 3; o estado só é atualizado após confirmação do Firestore).
- **Paginação**: em caso de falha no `loadMore`, as transações já carregadas são preservadas e `hasMore` permanece `true` (usuário pode tentar novamente).
- **Upload de recibo**: em caso de falha, `receiptUrl` permanece com o valor anterior. Sem rollback parcial — o arquivo não enviado não precisa ser deletado.

---

## Correctness Properties

Propriedades invariantes que devem ser verdadeiras em qualquer estado válido da aplicação:

### Property 1: Isolamento de dados por usuário
`transactions` exibidas na UI pertencem exclusivamente ao `user.id` do usuário autenticado. Nenhuma transação de outro usuário aparece na lista, mesmo que as Security Rules do Firestore falhem — o filtro `where('userId', '==', uid)` na query é a segunda linha de defesa.

**Validates: Requirements 9.2, 9.4**

### Property 2: Subconjunto de filtros
`filteredTransactions.length <= transactions.length` para qualquer combinação válida de `TransactionFilter`. Filtros só removem itens, nunca adicionam.

**Validates: Requirements 6.5**

### Property 3: Round-trip de data sem perda
`transactionMapper.toDTO(transactionMapper.toDomain(dto)).date` produz o mesmo `Timestamp` que `dto.date` (tolerância: milissegundos do arredondamento ISO 8601). A conversão `Timestamp → ISO 8601 → Timestamp` é idempotente.

**Validates: Requirements 5.10**

### Property 4: Monotonicidade da paginação
Após cada `loadMore()` bem-sucedido, `transactions.length` aumenta ou permanece igual; nunca decresce. Exceção: quando filtros são alterados, a lista é reiniciada do zero (cursor zerado), o que é uma operação intencional, não uma violação.

**Validates: Requirements 7.2, 7.6**

### Property 5: Autenticação como pré-condição de I/O
Qualquer chamada a `transactionService` ou `receiptService` com usuário não autenticado lança `'Usuário não autenticado'` sem realizar qualquer requisição ao Firestore ou Firebase Storage.

**Validates: Requirements 9.5**

### Property 6: Saldo consistente com transações
`balance = Σ(income) - Σ(expense)` onde a soma é sobre todas as transações do usuário carregadas no estado. O valor exibido no dashboard é sempre derivável a partir da lista de transações visível, sem estado independente.

**Validates: Requirements 4.2, 4.4**

---

## Testing Strategy

### O que testar na Fase 3

A arquitetura facilita testes granulares porque as camadas são desacopladas:

**Mappers** (prioridade alta — função pura, zero setup):
- `transactionMapper.toDomain(dto)` produz ISO 8601 válido
- `transactionMapper.toDTO(domain)` produz Timestamp correto
- Round-trip preserva valores

**Hooks de filtro** (prioridade alta — sem dependências externas):
- `useTransactionFilters` com cada tipo de filtro individualmente
- `useTransactionFilters` com filtros combinados
- Propriedade de subconjunto (`filtered.length <= original.length`)

**Services** (prioridade média — requer mock do Firebase):
- `authService.signIn` mapeia erros corretamente
- `transactionService.getPage` passa `startAfter` corretamente
- `transactionService` lança erro se `userId` ausente

**Componentes** (prioridade baixa na Fase 3 — foco na Fase 4):
- Verificar renderização de estados vazios, loading e erro

### Estrutura de Testes (quando implementados)

```
src/
  features/
    transactions/
      mappers/
        __tests__/
          transaction-mapper.test.ts
      hooks/
        __tests__/
          use-transaction-filters.test.ts
    auth/
      services/
        __tests__/
          auth-service.test.ts
```

---

## Decisões Intencionalmente Simplificadas (sem overengineering)

Para deixar claro o que foi propositalmente omitido:

- **Sem Use Cases / Interactors**: lógica de negócio fica nos Hooks e Services. Na Fase 4 sobe para Use Cases na camada de domínio.
- **Sem injeção de dependência em runtime**: Services são objetos literais importados diretamente pelos Hooks. A interface existe em TypeScript para orientar a Fase 4, sem binding em runtime.
- **Filtros client-side para `dateRange`**: evita índice composto no Firestore. Pode virar query server-side na Fase 4.
- **Context API em vez de Zustand**: suficiente para a Fase 3. A estrutura dos hooks garante que a troca seja transparente para os consumidores.
- **Sem cache offline**: `AsyncStorage` só para preferências de UI, não para dados do Firestore. Cache é requisito da Fase 4.

---

## Dependências a Instalar

| Pacote | Motivo |
|---|---|
| `firebase` | SDK principal (Auth, Firestore, Storage) |
| `expo-image-picker` | Seleção de imagem da galeria/câmera |
| `@react-native-async-storage/async-storage` | Persistência local de preferências de UI |
| `eslint-plugin-import` | Verificação das regras de dependência via ESLint |

**Não instalar agora** (reservado para Fase 4): `zustand`, `@tanstack/react-query`, `react-native-mmkv`.
