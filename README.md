# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start --tunnel
   ```

> **Nota para teste no iPhone via Expo Go (rede LAN):** em algumas configurações de rede, o modo LAN pode não funcionar no Expo Go mesmo que o iPhone consiga acessar a URL pelo navegador. Se o Expo Go exibir "the internet connection appears to be offline", use o modo Tunnel:
> ```bash
> npx expo start --clear --tunnel
> ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Funcionalidades validadas

### Importação de transação por IA (Gemini)

**Status:** ✅ Validado em produção (iPhone físico, Expo Go, agosto/2026)

O fluxo de importação de transação via IA foi testado com sucesso no iPhone físico com Expo Go, usando `npx expo start --clear --tunnel`:

- Arquivo TXT anexado com conteúdo `depositar 10 reais na conta`
- Gemini (modelo `gemini-3.5-flash-lite` via Firebase AI Logic / `GoogleAIBackend`) processou corretamente
- Os campos do formulário foram preenchidos automaticamente
- Nenhum erro de `AbortSignal.any`, `content://` / `expo-file-system` ou rate limiting (429)

**Polyfill necessário para Hermes (React Native 0.81 / Expo SDK 54):**
O Firebase AI Logic usa `AbortSignal.any()` internamente. O runtime Hermes do Expo SDK 54 / React Native 0.81 não implementa esse método. O arquivo `src/polyfills/abort-signal-any.ts` provê a implementação e é carregado como primeiro import em `app/_layout.tsx`.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
