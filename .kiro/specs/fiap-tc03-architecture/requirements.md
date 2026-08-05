# Requirements Document

## Introduction

Este documento especifica os requisitos de arquitetura e estrutura de projeto para o Tech Challenge da FIAP (Fase 3), com foco em uma arquitetura intermediária que entrega todas as funcionalidades exigidas na Fase 3 enquanto minimiza a refatoração necessária na Fase 4.

A abordagem escolhida é uma **Feature-First Architecture com separação de responsabilidades em camadas**, onde cada feature encapsula sua própria UI, estado, serviços e tipos — sem implementar Clean Architecture completa, mas com os limites de dependência que tornam essa migração barata.

O sistema é um aplicativo de **finanças pessoais** (React Native + Expo) com autenticação, dashboard, CRUD de transações, filtros, paginação, upload de recibos e persistência no Firebase.

---

## Glossary

- **App**: A aplicação React Native como um todo, identificada pelo entry point `expo-router/entry`.
- **Feature**: Um módulo funcional autocontido (ex: `auth`, `transactions`, `dashboard`, `receipts`). Cada feature possui suas próprias pastas de `components`, `hooks`, `services` e `types`.
- **Screen**: Componente React que representa uma tela completa, localizado em `app/` e gerenciado pelo Expo Router.
- **Service**: Módulo responsável pela comunicação com serviços externos (Firebase Auth, Firestore, Storage). Não conhece React nem estado de UI.
- **Repository**: Abstração sobre o Service que expõe operações de domínio (ex: `getTransactions`, `saveTransaction`). Isola a UI do Firebase diretamente.
- **Context**: Provedor de estado global baseado em React Context API, localizado em `src/features/<feature>/context/`.
- **Hook**: Função React customizada que consome Context ou chama Repository para expor dados e ações à UI.
- **DTO (Data Transfer Object)**: Tipo TypeScript que representa dados como recebidos/enviados para o Firebase (sem regras de negócio).
- **Domain Model**: Tipo TypeScript que representa a entidade do domínio da aplicação (pode diferir do DTO).
- **Transaction**: Entidade financeira representando uma receita ou despesa, com campos: id, userId, type, amount, category, description, date, receiptUrl.
- **Receipt**: Arquivo de imagem (comprovante/recibo) associado a uma Transaction, armazenado no Firebase Storage.
- **Dashboard**: Tela de resumo financeiro exibindo saldo total, total de receitas, total de despesas e lista de transações recentes.
- **Firebase**: Conjunto de serviços do Google: Authentication, Cloud Firestore e Storage, utilizados como backend.
- **Firestore**: Banco de dados NoSQL do Firebase, utilizado para persistência de Transactions.
- **Firebase_Auth**: Serviço de autenticação do Firebase, utilizado para login/registro de usuários.
- **Firebase_Storage**: Serviço de armazenamento de arquivos do Firebase, utilizado para upload de Receipts.
- **Expo_Router**: Sistema de navegação file-based da Expo, onde cada arquivo em `app/` define uma rota.
- **Path_Alias**: Atalho `@/*` configurado no `tsconfig.json` para referenciar arquivos a partir da raiz do projeto.
- **Shared**: Pasta `src/shared/` contendo código reutilizável entre features (componentes, hooks, utils, tipos).
- **Mapper**: Função pura que converte entre DTO e Domain Model, localizada em `src/features/<feature>/mappers/`.
- **Filter**: Conjunto de critérios para filtrar Transactions (type, dateRange, category).
- **Pagination**: Mecanismo de carregamento incremental de Transactions usando cursores do Firestore (`startAfter`).

---

## Requirements

### Requirement 1: Estrutura de Pastas e Organização de Módulos

**User Story:** Como desenvolvedor, quero uma estrutura de pastas padronizada e orientada a features, para que cada módulo seja autocontido e a navegação entre Fase 3 e Fase 4 exija o mínimo de reorganização.

#### Acceptance Criteria

1. THE App SHALL organizar todo o código fonte de lógica em `src/`, separando-o dos arquivos de rotas em `app/`.
2. THE App SHALL organizar features em `src/features/<feature-name>/`, onde `<feature-name>` é um dos valores: `auth`, `transactions`, `dashboard`, `receipts`.
3. WHEN uma nova feature é criada, THE App SHALL conter dentro de `src/features/<feature-name>/` as subpastas: `components/`, `hooks/`, `services/`, `types/`, `context/` e `mappers/`.
4. THE App SHALL manter em `src/shared/` os recursos reutilizáveis entre features: `components/`, `hooks/`, `utils/` e `types/`.
5. THE App SHALL manter a pasta `app/` exclusivamente para arquivos de rota do Expo Router, sem lógica de negócio.
6. THE App SHALL manter em `src/lib/firebase/` os arquivos de inicialização do Firebase (`config.ts`, `auth.ts`, `firestore.ts`, `storage.ts`), acessíveis apenas por Services.
7. THE App SHALL manter em `src/lib/` qualquer outra configuração de biblioteca externa (ex: future Zustand stores).
8. THE App SHALL manter assets estáticos na pasta `assets/` na raiz do projeto, conforme convenção do Expo.

---

### Requirement 2: Regras de Dependência entre Camadas

**User Story:** Como desenvolvedor, quero regras de dependência claras e verificáveis entre as camadas, para que a UI nunca acople diretamente ao Firebase e a migração para Clean Architecture na Fase 4 seja trivial.

#### Acceptance Criteria

1. THE App SHALL garantir que arquivos em `app/` (Screens) não importem diretamente de `src/features/<feature>/services/` nem de `src/lib/firebase/`; importações de `src/features/<feature>/hooks/`, `src/features/<feature>/components/` e `src/shared/` são permitidas.
2. THE App SHALL garantir que arquivos em `src/features/<feature>/hooks/` importem de `src/features/<feature>/context/`, `src/features/<feature>/services/` e `src/shared/`, e nunca importem de `app/` nem de outra feature sem passar por `src/shared/`.
3. THE App SHALL garantir que arquivos em `src/features/<feature>/services/` importem de `src/lib/firebase/` e de `src/features/<feature>/types/`, e nunca importem de `src/features/<feature>/components/` nem de `app/`.
4. THE App SHALL garantir que arquivos em `src/features/<feature>/components/` importem apenas de `src/features/<feature>/hooks/`, `src/features/<feature>/types/`, `src/shared/components/` e `src/shared/hooks/` (nunca de `src/lib/firebase/` diretamente).
5. THE App SHALL garantir que arquivos em `src/shared/` não importem de nenhuma feature específica (`src/features/<feature>/`).
6. THE App SHALL garantir que arquivos em `src/lib/firebase/` não importem de features, hooks, components ou contexts da aplicação.
7. WHEN um desenvolvedor adicionar uma importação proibida, THE App SHALL sinalizar a violação via regras do ESLint (`import/no-restricted-paths` ou equivalente), antes do build.

---

### Requirement 3: Autenticação (Firebase Authentication)

**User Story:** Como usuário, quero me registrar e fazer login com e-mail e senha, para que eu possa acessar meus dados financeiros de forma segura e privada.

#### Acceptance Criteria

1. WHEN o usuário não está autenticado, THE App SHALL redirecionar todas as rotas protegidas para a rota `/auth/login`.
2. WHEN o usuário submete o formulário de login com e-mail e senha válidos, THE Firebase_Auth SHALL autenticar o usuário e THE App SHALL navegar para a rota `/(tabs)/dashboard`.
3. IF o usuário submete o formulário de login com credenciais inválidas, THEN THE App SHALL exibir uma mensagem de erro descritiva sem expor detalhes internos do Firebase.
4. WHEN o usuário submete o formulário de registro com e-mail e senha válidos (mínimo 6 caracteres), THE Firebase_Auth SHALL criar uma conta e THE App SHALL autenticar o usuário automaticamente.
5. IF o usuário tenta registrar com um e-mail já cadastrado, THEN THE App SHALL exibir a mensagem "Este e-mail já está em uso".
6. WHEN o usuário aciona o logout, THE Firebase_Auth SHALL encerrar a sessão e THE App SHALL redirecionar para `/auth/login`.
7. THE Auth_Context SHALL expor: `user` (objeto do usuário autenticado ou `null`), `isLoading` (booleano indicando verificação inicial) e as ações `signIn`, `signUp` e `signOut`.
8. WHILE `isLoading` é `true`, THE App SHALL exibir uma tela de splash/loading sem renderizar rotas protegidas.
9. THE Auth_Service SHALL ser o único módulo que importa de `src/lib/firebase/auth.ts`.
10. FOR ALL operações de Auth_Service, THE Auth_Service SHALL mapear erros do Firebase para mensagens legíveis em português antes de propagar ao chamador.

---

### Requirement 4: Dashboard Financeiro

**User Story:** Como usuário autenticado, quero visualizar um resumo financeiro na tela principal, para que eu possa entender rapidamente minha situação financeira atual.

#### Acceptance Criteria

1. WHEN o usuário acessa a rota `/(tabs)/dashboard`, THE Dashboard SHALL exibir: saldo total (receitas − despesas), total de receitas do período, total de despesas do período e lista das 5 transações mais recentes.
2. THE Dashboard SHALL calcular o saldo como a soma de todas as Transactions do tipo `income` menos a soma de todas as Transactions do tipo `expense`, pertencentes ao usuário autenticado.
3. WHEN não há Transactions cadastradas, THE Dashboard SHALL exibir saldo zero e uma mensagem "Nenhuma transação encontrada".
4. WHEN uma Transaction é criada, editada ou removida, THE Dashboard SHALL atualizar os totais automaticamente sem exigir reload manual.
5. THE Dashboard_Hook SHALL receber Transactions do Transaction_Service e calcular os totais localmente, sem expor lógica de cálculo para o componente de tela.
6. THE Dashboard_Hook SHALL expor: `balance`, `totalIncome`, `totalExpense`, `recentTransactions` e `isLoading`.
7. IF o carregamento do Dashboard falhar, THEN THE Dashboard SHALL exibir simultaneamente uma mensagem de erro descritiva e uma opção de tentar novamente.
8. THE Dashboard SHALL exibir valores monetários formatados em Real Brasileiro (BRL) com símbolo "R$", duas casas decimais e separador de milhar.

---

### Requirement 5: CRUD de Transações

**User Story:** Como usuário autenticado, quero criar, visualizar, editar e excluir transações financeiras, para que eu possa manter um registro preciso das minhas finanças.

#### Acceptance Criteria

1. WHEN o usuário acessa a rota `/(tabs)/transactions`, THE App SHALL exibir a lista de Transactions do usuário autenticado, ordenadas por data decrescente.
2. THE Transaction_Service SHALL garantir que cada Transaction possua os campos obrigatórios: `id` (string UUID), `userId` (string), `type` (`'income'` | `'expense'`), `amount` (number positivo), `category` (string), `description` (string), `date` (ISO 8601 string), `createdAt` (ISO 8601 string) e `updatedAt` (ISO 8601 string).
3. WHEN o usuário submete o formulário de criação com dados válidos, THE Transaction_Service SHALL persistir a Transaction no Firestore na coleção `users/{userId}/transactions` e THE App SHALL refletir a nova Transaction na lista.
4. IF o usuário submete o formulário de criação com `amount` menor ou igual a zero, THEN THE App SHALL exibir "O valor deve ser maior que zero" sem enviar nenhum dado ao Firestore nem executar nenhum processamento de backend.
5. IF o usuário submete o formulário de criação com `category` vazia, THEN THE App SHALL exibir "Selecione uma categoria" sem enviar nenhum dado ao Firestore nem executar nenhum processamento de backend.
6. WHEN o usuário seleciona uma Transaction existente e submete o formulário de edição com dados válidos, THE Transaction_Service SHALL atualizar o documento no Firestore e THE App SHALL refletir os dados atualizados.
7. WHEN o usuário confirma a exclusão de uma Transaction, THE Transaction_Service SHALL remover o documento do Firestore e THE App SHALL remover a Transaction da lista sem reload.
8. IF a operação de criação, edição ou exclusão no Firestore falhar, THEN THE App SHALL exibir uma mensagem de erro descritiva, manter o estado anterior da lista e não exibir mensagens de erro quando as operações forem concluídas com sucesso.
9. THE Transaction_Mapper SHALL converter entre `TransactionDTO` (formato Firestore, com `Timestamp` do Firebase) e `Transaction` (Domain Model, com `date` como string ISO 8601), sendo o único ponto de conversão no sistema.
10. FOR ALL TransactionDTOs retornados pelo Firestore, THE Transaction_Mapper SHALL produzir um Transaction com `date` em formato ISO 8601 válido (round-trip: DTO → Domain → DTO → Domain preserva os valores originais).

---

### Requirement 6: Filtros de Transações

**User Story:** Como usuário autenticado, quero filtrar minhas transações por tipo, categoria e período de datas, para que eu possa analisar grupos específicos de gastos e receitas.

#### Acceptance Criteria

1. THE Transaction_List SHALL suportar filtros simultâneos por: `type` (`'income'` | `'expense'` | `null` para todos), `category` (string | `null` para todas) e `dateRange` (`{ start: Date; end: Date }` | `null` para todo período).
2. WHEN o usuário aplica um filtro, THE App SHALL atualizar a lista de Transactions exibida sem navegar para outra rota.
3. WHEN o usuário remove todos os filtros, THE Transaction_List SHALL exibir todas as Transactions do usuário.
4. THE Transaction_Filter_Hook SHALL aceitar um array de Transactions e um objeto Filter e retornar o array filtrado, sendo uma função pura sem efeitos colaterais.
5. FOR ALL combinações válidas de Filter aplicadas ao mesmo array de Transactions, THE Transaction_Filter_Hook SHALL retornar um subconjunto do array original (propriedade: `filtered.length <= original.length`).
6. WHEN o filtro `type` é `'income'`, THE Transaction_Filter_Hook SHALL retornar apenas Transactions com `type === 'income'`.
7. WHEN o filtro `dateRange` é aplicado, THE Transaction_Filter_Hook SHALL retornar apenas Transactions cuja `date` esteja dentro do intervalo inclusivo `[start, end]`.
8. THE Transaction_Filter_Hook SHALL ser testável de forma isolada, sem dependência de Context ou Firebase.

---

### Requirement 7: Paginação de Transações

**User Story:** Como usuário autenticado com muitas transações, quero que a lista carregue progressivamente, para que o app não bloqueie nem consuma memória excessiva.

#### Acceptance Criteria

1. THE Transaction_Service SHALL carregar Transactions em páginas de 20 itens, utilizando o cursor `startAfter` do Firestore baseado no campo `date`.
2. WHEN o usuário rola a lista até o final e `hasMore` é `true`, THE App SHALL carregar automaticamente a próxima página de Transactions e acrescentá-la à lista já exibida somente quando a próxima página contiver Transactions adicionais.
3. WHEN não há mais Transactions a carregar, THE App SHALL exibir uma mensagem "Todas as transações carregadas" e parar de fazer requisições ao Firestore.
4. THE Transaction_Pagination_Hook SHALL expor: `transactions` (array acumulado), `isLoading`, `hasMore` (booleano) e `loadMore` (função).
5. IF uma requisição de paginação falhar, THEN THE App SHALL exibir uma mensagem de erro e manter as Transactions já carregadas.
6. WHEN filtros são alterados, THE Transaction_Pagination_Hook SHALL reiniciar a paginação do início (cursor zerado) e descartar as Transactions da página anterior.
7. THE Transaction_Service SHALL aceitar um parâmetro `cursor` opcional para implementar `startAfter`; quando `cursor` for `undefined`, THE Transaction_Service SHALL retornar a primeira página.

---

### Requirement 8: Upload de Recibos (Firebase Storage)

**User Story:** Como usuário autenticado, quero anexar uma foto de comprovante a uma transação, para que eu tenha registro visual das minhas movimentações financeiras.

#### Acceptance Criteria

1. WHEN o usuário aciona o botão de anexar recibo em uma Transaction, THE App SHALL apresentar opções para selecionar imagem da galeria ou capturar foto com a câmera.
2. WHEN o usuário seleciona uma imagem, THE Receipt_Service SHALL fazer upload para Firebase_Storage no caminho `receipts/{userId}/{transactionId}/{timestamp}.{ext}` e retornar a URL pública do arquivo.
3. WHEN o upload é concluído com sucesso, THE Transaction_Service SHALL atualizar o campo `receiptUrl` da Transaction no Firestore com a URL retornada pelo Receipt_Service.
4. WHILE o upload estiver em progresso, THE App SHALL exibir um indicador de progresso percentual e bloquear nova submissão do formulário.
5. IF o arquivo selecionado exceder 5 MB, THEN THE App SHALL exibir "O arquivo deve ter no máximo 5 MB" sem iniciar o upload.
6. IF o upload para Firebase_Storage falhar, THEN THE App SHALL exibir uma mensagem de erro descritiva e manter o campo `receiptUrl` com o valor anterior.
7. WHEN uma Transaction com `receiptUrl` é exibida, THE App SHALL mostrar uma miniatura da imagem clicável que abre a imagem em tela cheia.
8. WHEN o usuário remove o recibo de uma Transaction, THE Receipt_Service SHALL deletar o arquivo do Firebase_Storage e THE Transaction_Service SHALL limpar o campo `receiptUrl` no Firestore.
9. THE Receipt_Service SHALL ser o único módulo que importa de `src/lib/firebase/storage.ts`.

---

### Requirement 9: Persistência e Segurança dos Dados no Firestore

**User Story:** Como usuário autenticado, quero que meus dados sejam privados e persistidos com segurança, para que nenhum outro usuário possa acessar minhas transações.

#### Acceptance Criteria

1. THE Firestore SHALL organizar dados na estrutura de subcoleção `users/{userId}/transactions/{transactionId}`, garantindo isolamento por usuário em nível de banco de dados.
2. THE Firestore Security Rules SHALL negar leitura e escrita em `users/{userId}/transactions` para qualquer `request.auth.uid` diferente de `{userId}`.
3. THE Transaction_Service SHALL incluir o `userId` do usuário autenticado em cada operação de escrita, obtido do Auth_Context.
4. THE Transaction_Service SHALL filtrar todas as queries ao Firestore com a cláusula `where('userId', '==', currentUser.uid)`, mesmo que as Security Rules já garantam o isolamento.
5. IF o usuário não estiver autenticado ao chamar qualquer método do Transaction_Service, THEN THE Transaction_Service SHALL lançar um erro `'Usuário não autenticado'` sem realizar a requisição ao Firestore.

---

### Requirement 10: Preparação para Clean Architecture (Fase 4)

**User Story:** Como desenvolvedor, quero que a arquitetura da Fase 3 estabeleça abstrações e limites de dependência que tornem a migração para Clean Architecture na Fase 4 uma refatoração incremental, não uma reescrita.

#### Acceptance Criteria

1. THE App SHALL definir interfaces TypeScript para cada Service na pasta `src/features/<feature>/types/` (ex: `ITransactionService`, `IAuthService`, `IReceiptService`), de modo que a implementação Firebase possa ser trocada por outra sem alterar os Hooks ou Components que as consomem.
2. THE App SHALL separar tipos de domínio (`Transaction`, `User`, `Receipt`) de DTOs de infraestrutura (`TransactionDTO`, `FirebaseUser`) em arquivos distintos dentro de `src/features/<feature>/types/`.
3. THE App SHALL implementar Mappers como funções puras (sem dependências de React, Firebase ou Context) em `src/features/<feature>/mappers/`, de forma que possam ser movidos para uma camada de domínio na Fase 4 sem alteração.
4. THE App SHALL manter Contexts com responsabilidade única: cada Context gerencia o estado de exatamente uma feature, sem acumular estado de features diferentes.
5. THE App SHALL estruturar cada Service como um objeto ou classe com métodos nomeados por operações de domínio (ex: `getTransactions`, `createTransaction`) — nunca expondo primitivas do Firebase (ex: `doc()`, `collection()`) fora de `src/lib/firebase/` ou `src/features/<feature>/services/`.
6. THE App SHALL evitar lógica de negócio inline em componentes de tela (`app/`); toda lógica de cálculo, transformação e validação SHALL residir em Hooks ou Services.
7. WHERE o estado global de uma feature crescer em complexidade, THE App SHALL estruturar o Context de forma que possa ser substituído por um store Zustand na Fase 4 sem alterar os Hooks consumidores (padrão: Hook expõe a mesma interface independente da fonte de estado).
8. THE App SHALL documentar explicitamente, em `src/features/<feature>/services/`, qual interface cada Service implementa, usando o comentário `// implements I<Feature>Service` acima da declaração.

---

### Requirement 11: Qualidade e Convenções de Código

**User Story:** Como desenvolvedor, quero convenções de código consistentes e verificáveis, para que o projeto mantenha qualidade à medida que a equipe cresce.

#### Acceptance Criteria

1. THE App SHALL usar TypeScript em modo `strict: true` em todos os arquivos `.ts` e `.tsx`, sem uso de `any` explícito.
2. THE App SHALL usar o Path_Alias `@/*` para todas as importações entre módulos, nunca utilizando caminhos relativos que atravessem mais de dois níveis de diretório (ex: `../../`).
3. THE App SHALL nomear arquivos de componentes React em `kebab-case.tsx`, funções de componente em `PascalCase` e hooks customizados com prefixo `use` em `camelCase`.
4. THE App SHALL exportar cada feature por meio de um arquivo `index.ts` (barrel export) em `src/features/<feature>/`, expondo somente as APIs públicas da feature para consumo externo.
5. WHEN um componente recebe props, THE App SHALL definir o tipo das props em uma interface TypeScript nomeada `<ComponentName>Props` no mesmo arquivo do componente.
6. THE App SHALL configurar o ESLint com regras que impeçam importações que violem as regras de dependência entre features definidas no Requirement 2, sem restringir o uso de caminhos relativos dentro da mesma feature.
7. THE App SHALL tratar erros assíncronos em todos os Hooks com try/catch, expondo o estado de erro via propriedade `error` tipada como `string | null`.

---

## Apêndice: Estrutura de Pastas Proposta

```
tc-03/
├── app/                          # Expo Router — apenas rotas e layouts
│   ├── _layout.tsx               # Root layout (providers globais)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx         # Delega para src/features/dashboard
│   │   └── transactions.tsx      # Delega para src/features/transactions
│   └── transactions/
│       ├── [id].tsx              # Detalhe/edição
│       └── new.tsx               # Criação
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/       # LoginForm, RegisterForm
│   │   │   ├── context/          # AuthContext, AuthProvider
│   │   │   ├── hooks/            # useAuth
│   │   │   ├── mappers/          # firebaseUserToUser()
│   │   │   ├── services/         # authService.ts (implements IAuthService)
│   │   │   ├── types/            # User, IAuthService, AuthDTO
│   │   │   └── index.ts          # barrel export
│   │   │
│   │   ├── transactions/
│   │   │   ├── components/       # TransactionList, TransactionForm, TransactionCard
│   │   │   ├── context/          # TransactionContext, TransactionProvider
│   │   │   ├── hooks/            # useTransactions, useTransactionFilters, useTransactionPagination
│   │   │   ├── mappers/          # transactionMapper.ts (DTO ↔ Domain)
│   │   │   ├── services/         # transactionService.ts (implements ITransactionService)
│   │   │   ├── types/            # Transaction, TransactionDTO, ITransactionService, Filter
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/       # BalanceCard, SummaryChart, RecentTransactions
│   │   │   ├── hooks/            # useDashboard
│   │   │   ├── types/            # DashboardSummary
│   │   │   └── index.ts
│   │   │
│   │   └── receipts/
│   │       ├── components/       # ReceiptPicker, ReceiptPreview
│   │       ├── hooks/            # useReceiptUpload
│   │       ├── services/         # receiptService.ts (implements IReceiptService)
│   │       ├── types/            # Receipt, IReceiptService
│   │       └── index.ts
│   │
│   ├── shared/
│   │   ├── components/           # Button, Input, Modal, LoadingSpinner, ErrorMessage
│   │   ├── hooks/                # useDebounce, useLocalStorage
│   │   ├── utils/                # formatCurrency, formatDate, validators
│   │   └── types/                # ApiResponse<T>, PaginatedResult<T>
│   │
│   └── lib/
│       └── firebase/
│           ├── config.ts         # initializeApp()
│           ├── auth.ts           # getAuth()
│           ├── firestore.ts      # getFirestore()
│           └── storage.ts        # getStorage()
│
├── assets/                       # Imagens, fontes, ícones
├── constants/                    # theme.ts (Colors, Fonts)
├── app.json
├── tsconfig.json
└── package.json
```

## Apêndice: Regras de Dependência (Diagrama)

```
app/ (Screens)
  └── importa → src/features/<feature>/hooks/
  └── importa → src/features/<feature>/components/
  └── importa → src/shared/

src/features/<feature>/components/
  └── importa → src/features/<feature>/hooks/
  └── importa → src/features/<feature>/types/
  └── importa → src/shared/

src/features/<feature>/hooks/
  └── importa → src/features/<feature>/context/
  └── importa → src/features/<feature>/services/
  └── importa → src/features/<feature>/types/
  └── importa → src/shared/

src/features/<feature>/services/
  └── importa → src/lib/firebase/
  └── importa → src/features/<feature>/types/
  └── importa → src/features/<feature>/mappers/

src/features/<feature>/mappers/
  └── importa → src/features/<feature>/types/  (apenas tipos)

src/shared/
  └── NÃO importa de src/features/

src/lib/firebase/
  └── NÃO importa de src/features/ nem src/shared/

❌ PROIBIDO:
  - app/ → src/features/<feature>/services/
  - app/ → src/lib/firebase/
  - components/ → src/lib/firebase/
  - src/shared/ → src/features/<any>/
  - src/features/A/ → src/features/B/  (comunicação direta entre features)
```
