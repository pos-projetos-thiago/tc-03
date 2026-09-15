# ByteBank — Gerenciamento Financeiro Pessoal

![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_57-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Firestore](https://img.shields.io/badge/Cloud_Firestore-FF6D00?style=for-the-badge&logo=firebase&logoColor=white)
![Context API](https://img.shields.io/badge/Context_API-Gerenciamento_de_Estado-61DAFB?style=for-the-badge&logo=react&logoColor=black)

Aplicação mobile de gerenciamento financeiro desenvolvida com React Native, Expo e Firebase como parte do Tech Challenge — Fase 3 da pós-graduação PosTech FIAP.

## Funcionalidades

- Autenticação de usuários via Firebase Authentication
- Dashboard com visão geral do saldo, patrimônio e investimentos do mês
- Gráficos de movimentação mensal e distribuição da carteira de investimentos
- Animações de transição com a API `Animated` do React Native
- Listagem de transações com filtros por tipo, categoria e período
- Scroll infinito com paginação via Cloud Firestore
- Cadastro e edição de transações (depósito, saque, investimento)
- Validação avançada de campos com feedback inline
- Upload de recibos e documentos para Firebase Storage
- Importação de dados de transação via análise de documento por IA (Firebase AI Logic / Gemini)
- Suporte a tema claro e escuro

## Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Aplicativo Expo Go instalado no dispositivo (iOS ou Android)
- Conta no [Firebase Console](https://console.firebase.google.com)

## Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com).
2. Ative os seguintes serviços:
   - **Authentication** — habilite o provedor Email/Senha
   - **Cloud Firestore** — crie o banco em modo de produção ou teste
   - **Storage** — crie o bucket padrão
   - **AI Logic** (Firebase Vertex AI / Gemini) — necessário para o recurso de importação por IA
3. Registre um app Web no projeto Firebase e copie as credenciais geradas.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```bash
cp .env.example .env
```

Preencha com as credenciais do seu projeto Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## Instalação

```bash
npm install
```

## Executando o projeto

```bash
npx expo start --clear --tunnel
```

O modo `--tunnel` é recomendado para garantir que dispositivos físicos com Expo Go consigam se conectar independente da configuração de rede local.

Após o servidor iniciar, escaneie o QR code exibido no terminal com o aplicativo Expo Go.

## Observação sobre o polyfill de AbortSignal

O runtime Hermes (React Native 0.81 / Expo SDK 57) não implementa `AbortSignal.any()`, método utilizado internamente pelo Firebase AI Logic. O arquivo `src/polyfills/abort-signal-any.ts` fornece essa implementação e é carregado como primeiro import em `app/_layout.tsx`. Sem ele, o recurso de importação por IA falharia silenciosamente em dispositivos físicos.

## Estrutura do projeto

```
app/                    # Rotas (Expo Router — file-based routing)
  (auth)/               # Telas de autenticação
  (tabs)/               # Telas principais (Dashboard, Transações)
  transactions/         # Telas de criação e edição de transação
src/
  features/
    auth/               # Contexto, serviços e componentes de autenticação
    dashboard/          # Dashboard, gráficos e serviço de resumo financeiro
    receipts/           # Upload de recibos e extração via IA
    transactions/       # Listagem, formulário, filtros e serviço de transações
  lib/
    firebase/           # Configuração e serviços do Firebase
  shared/               # Componentes, hooks e utilitários compartilhados
constants/
  theme.ts              # Tokens de cor e tipografia (tema claro e escuro)
```

## Tecnologias

- [React Native](https://reactnative.dev) + [Expo SDK 57](https://expo.dev)
- [Expo Router](https://expo.github.io/router) — navegação baseada em arquivos
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Firebase AI Logic](https://firebase.google.com/docs/ai-logic) (Gemini)
- [expo-skia-charts](https://github.com/alexsuarezm/expo-skia-charts) — gráficos donut
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated) + [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler)
