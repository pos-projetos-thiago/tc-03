/**
 * Logs temporários para diagnóstico do fluxo de recuperação de senha.
 * NÃO registrar apiKey, oobCode completo, senhas ou tokens.
 */

const LOG_PREFIX = '[PasswordResetDiag]';

/** Desativado após diagnóstico — reative apenas se precisar investigar novamente. */
export const PASSWORD_RESET_DIAGNOSTICS_ENABLED = false;

export function redactSensitiveUrl(url: string): string {
  return url
    .replace(/([?&]apiKey=)[^&]+/gi, '$1[REDACTED]')
    .replace(/([?&]oobCode=)[^&]+/gi, '$1[REDACTED]')
    .replace(/([?&]token=)[^&]+/gi, '$1[REDACTED]')
    .replace(/([?&]access_token=)[^&]+/gi, '$1[REDACTED]');
}

export function getPathnameFromUrl(url: string): string | null {
  try {
    if (/^https?:\/\//i.test(url)) {
      return new URL(url).pathname;
    }
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) {
      const withoutScheme = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
      const pathPart = withoutScheme.split('?')[0] ?? '';
      return pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
    }
    return url.split('?')[0] ?? null;
  } catch {
    return url.split('?')[0] ?? null;
  }
}

export function describeOobCode(oobCode: string | null | undefined) {
  return {
    oobCodePresent: Boolean(oobCode),
    oobCodeLength: oobCode?.length ?? 0,
  };
}

export function extractFirebaseErrorDetails(err: unknown): {
  errCode: string | null;
  errMessage: string | null;
  errName: string | null;
} {
  if (typeof err === 'object' && err !== null) {
    const record = err as { code?: unknown; message?: unknown; name?: unknown };
    return {
      errCode: typeof record.code === 'string' ? record.code : null,
      errMessage: typeof record.message === 'string' ? record.message : null,
      errName: typeof record.name === 'string' ? record.name : null,
    };
  }

  return {
    errCode: null,
    errMessage: typeof err === 'string' ? err : null,
    errName: null,
  };
}

/** Mensagem temporária de diagnóstico exposta na UI/log. */
export function formatDiagnosticFirebaseError(err: unknown): string {
  const { errCode, errMessage, errName } = extractFirebaseErrorDetails(err);

  if (errCode || errMessage) {
    return `[DIAG] ${errCode ?? 'sem-code'} — ${errMessage ?? errName ?? 'sem mensagem'}`;
  }

  return `[DIAG] Erro desconhecido — ${String(err)}`;
}

export function logPasswordResetDiagnostic(
  step: string,
  details: Record<string, unknown>,
): void {
  if (!PASSWORD_RESET_DIAGNOSTICS_ENABLED) return;
  console.warn(`${LOG_PREFIX} ${step}`, details);
}
