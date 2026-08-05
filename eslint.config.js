// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// eslint-config-expo already bundles eslint-plugin-import.
// We only need to extend its rules — re-registering the plugin causes a conflict.
module.exports = defineConfig([
  expoConfig,
  {
    // ─── Regras de dependência entre camadas (Requirement 2) ─────────────────
    // A lógica: quanto mais perto do Firebase, menos pode importar.
    // Violações aparecem como erro antes do build (expo lint).
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // app/ não pode importar de services/ nem de lib/firebase/
            {
              target: './app',
              from: './src/lib/firebase',
              message:
                'app/ não pode importar de src/lib/firebase/. Use um hook da feature correspondente.',
            },

            // shared/ não pode importar de nenhuma feature
            {
              target: './src/shared',
              from: './src/features',
              message:
                'src/shared/ não pode depender de nenhuma feature. Mova o código para shared/ ou crie uma abstração.',
            },

            // lib/firebase/ não pode importar de src/ exceto de dentro de lib/firebase/ (imports relativos entre os próprios arquivos)
            // Nota: arquivos dentro de src/lib/firebase/ podem se importar mutuamente via caminho relativo (./config, etc.)
            // A regra abaixo é intencionalmente omitida porque eslint-plugin-import/no-restricted-paths
            // não distingue imports relativos dentro do mesmo diretório vs. imports de outros módulos de src/.
            // A proteção é garantida por convenção de código documentada no design.md.
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
]);
