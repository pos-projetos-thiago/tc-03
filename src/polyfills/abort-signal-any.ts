/**
 * Polyfill para `AbortSignal.any()`.
 *
 * Por que existe:
 *   O Firebase AI Logic (pacote `firebase/ai`) usa `AbortSignal.any()` internamente
 *   para combinar sinais de cancelamento nas requisições à API Gemini.
 *   `AbortSignal.any` é um método estático introduzido no padrão WHATWG em 2023 e
 *   ainda não está disponível no runtime Hermes usado pelo Expo SDK 54 / React Native 0.81.
 *   Em Node.js ≥ 20 e navegadores modernos o método já existe e este polyfill não faz nada.
 *
 * Compatibilidade:
 *   - Hermes (Expo Go / React Native 0.81): aplica o polyfill.
 *   - Node.js ≥ 20 / Web moderno: o guard `typeof AbortSignal.any !== 'function'`
 *     impede qualquer alteração — o polyfill é completamente inerte.
 */

// Guard de segurança: só polyfilla quando necessário.
if (
  typeof AbortSignal !== 'undefined' &&
  typeof AbortSignal.any !== 'function'
) {
  // Tipagem segura e localizada: o cast está circunscrito a este bloco.
  (AbortSignal as typeof AbortSignal & { any: (signals: AbortSignal[]) => AbortSignal }).any =
    function abortSignalAny(signals: AbortSignal[]): AbortSignal {
      const controller = new AbortController();

      for (const signal of signals) {
        // Se algum signal já está abortado, propaga imediatamente.
        if (signal.aborted) {
          // `reason` existe em ambientes modernos; usa fallback para Hermes < suporte total.
          const reason = (signal as AbortSignal & { reason?: unknown }).reason;
          controller.abort(reason);
          return controller.signal;
        }
      }

      // Registra listeners apenas nos signals que ainda não abortaram.
      const onAbort = (event: Event) => {
        if (!controller.signal.aborted) {
          const source = event.target as AbortSignal & { reason?: unknown };
          controller.abort(source?.reason);

          // Remove todos os listeners para evitar trabalho desnecessário
          // após o primeiro abort.
          for (const signal of signals) {
            signal.removeEventListener('abort', onAbort);
          }
        }
      };

      for (const signal of signals) {
        signal.addEventListener('abort', onAbort);
      }

      return controller.signal;
    };
}
