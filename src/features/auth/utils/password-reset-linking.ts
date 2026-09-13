import * as Linking from 'expo-linking';
import type { ActionCodeSettings } from 'firebase/auth';

import {
  describeOobCode,
  getPathnameFromUrl,
  logPasswordResetDiagnostic,
  redactSensitiveUrl,
} from './password-reset-diagnostics';

/** Bundle/package do Expo Go — necessários para handleCodeInApp em desenvolvimento. */
const EXPO_GO_IOS_BUNDLE_ID = 'host.exp.Exponent';
const EXPO_GO_ANDROID_PACKAGE = 'host.exp.exponent';

function getFirebaseAuthDomain(): string {
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  if (!authDomain) {
    throw new Error('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN não configurado.');
  }
  return authDomain;
}

/**
 * Continue URL exigida pelo Firebase: HTTPS em domínio allowlisted.
 * O domínio `{project}.firebaseapp.com` já vem autorizado por padrão no Console.
 */
export function getPasswordResetContinueUrl(): string {
  return `https://${getFirebaseAuthDomain()}`;
}

/**
 * ActionCodeSettings compatíveis com Firebase Auth.
 *
 * Desenvolvimento (Expo Go): HTTPS + bundle/package do Expo Go.
 * Produção: HTTPS + bundle/package reais via env, ou link web seguro (sem in-app).
 */
export function getPasswordResetActionCodeSettings(): ActionCodeSettings {
  const continueUrl = getPasswordResetContinueUrl();

  if (__DEV__) {
    return {
      url: continueUrl,
      handleCodeInApp: true,
      iOS: { bundleId: EXPO_GO_IOS_BUNDLE_ID },
      android: {
        packageName: EXPO_GO_ANDROID_PACKAGE,
        installApp: false,
        minimumVersion: '1',
      },
    };
  }

  const iosBundleId = process.env.EXPO_PUBLIC_IOS_BUNDLE_ID?.trim();
  const androidPackage = process.env.EXPO_PUBLIC_ANDROID_PACKAGE?.trim();

  if (iosBundleId && androidPackage) {
    return {
      url: continueUrl,
      handleCodeInApp: true,
      iOS: { bundleId: iosBundleId },
      android: {
        packageName: androidPackage,
        installApp: true,
        minimumVersion: '1',
      },
    };
  }

  // Production build: configure EXPO_PUBLIC_IOS_BUNDLE_ID e EXPO_PUBLIC_ANDROID_PACKAGE
  // para abrir o app diretamente. Sem isso, o Firebase usa o fluxo web seguro (HTTPS).
  return {
    url: continueUrl,
    handleCodeInApp: false,
  };
}

type SearchParamValue = string | string[] | undefined;

function readParam(value: SearchParamValue): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && value[0]) return value[0];
  return null;
}

/** Extrai oobCode de parâmetros de rota/deep link do Expo Router. */
export function extractOobCodeFromParams(
  params: Record<string, SearchParamValue>,
): string | null {
  const direct = readParam(params.oobCode);
  if (direct) return direct;

  const link = readParam(params.link);
  if (link) return extractOobCodeFromUrl(link);

  return null;
}

/** Extrai oobCode de URLs completas (Firebase action link ou scheme do app). */
export function extractOobCodeFromUrl(url: string): string | null {
  const parsed = Linking.parse(url);
  const fromQuery = readParam(parsed.queryParams?.oobCode as SearchParamValue);
  const match = url.match(/[?&]oobCode=([^&]+)/);
  const fromRegex = match?.[1] ? decodeURIComponent(match[1]) : null;
  const result = fromQuery ?? fromRegex;

  logPasswordResetDiagnostic('extractOobCodeFromUrl', {
    inputUrl: redactSensitiveUrl(url),
    pathname: getPathnameFromUrl(url),
    parsedScheme: parsed.scheme ?? null,
    parsedHostname: parsed.hostname ?? null,
    foundViaLinkingParse: Boolean(fromQuery),
    foundViaRegex: Boolean(fromRegex),
    ...describeOobCode(result),
  });

  return result;
}

export function extractModeFromParams(
  params: Record<string, SearchParamValue>,
): string | null {
  return readParam(params.mode);
}

export function extractModeFromUrl(url: string): string | null {
  const parsed = Linking.parse(url);
  const fromQuery = readParam(parsed.queryParams?.mode as SearchParamValue);
  if (fromQuery) return fromQuery;

  const match = url.match(/[?&]mode=([^&]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);

  return null;
}
