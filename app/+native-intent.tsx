import {
  describeOobCode,
  extractFirebaseErrorDetails,
  getPathnameFromUrl,
  logPasswordResetDiagnostic,
  redactSensitiveUrl,
} from '@/src/features/auth/utils/password-reset-diagnostics';
import {
  extractModeFromUrl,
  extractOobCodeFromUrl,
} from '@/src/features/auth/utils/password-reset-linking';

/**
 * Reescreve links do Firebase Auth (e-mail de recuperação) para a rota interna do app.
 */
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  const pathname = getPathnameFromUrl(path);
  const oobCode = extractOobCodeFromUrl(path);
  const mode = extractModeFromUrl(path);

  logPasswordResetDiagnostic('+native-intent:entrada', {
    initial,
    pathReceived: redactSensitiveUrl(path),
    pathname,
    mode,
    ...describeOobCode(oobCode),
  });

  try {
    if (oobCode && (!mode || mode === 'resetPassword')) {
      const rewritten = `/reset-password?oobCode=${encodeURIComponent(oobCode)}&mode=resetPassword`;

      logPasswordResetDiagnostic('+native-intent:reescrita', {
        targetRoute: '/reset-password',
        mode: 'resetPassword',
        ...describeOobCode(oobCode),
        rewrittenPath: redactSensitiveUrl(rewritten),
      });

      return rewritten;
    }
  } catch (error) {
    logPasswordResetDiagnostic('+native-intent:erro-parse', {
      pathname,
      ...extractFirebaseErrorDetails(error),
    });
  }

  logPasswordResetDiagnostic('+native-intent:sem-reescrita', {
    pathname,
    mode,
    ...describeOobCode(oobCode),
    returningPath: redactSensitiveUrl(path),
  });

  return path;
}
