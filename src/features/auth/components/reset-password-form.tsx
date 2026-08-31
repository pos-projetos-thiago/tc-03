import { Link, router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { LoadingSpinner } from '@/src/shared/components/loading-spinner';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { validatePassword } from '@/src/shared/utils/validators';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/use-auth';
import {
  describeOobCode,
  getPathnameFromUrl,
  logPasswordResetDiagnostic,
  redactSensitiveUrl,
} from '../utils/password-reset-diagnostics';
import {
  extractModeFromParams,
  extractModeFromUrl,
  extractOobCodeFromParams,
  extractOobCodeFromUrl,
} from '../utils/password-reset-linking';

interface FieldError {
  password: string | null;
  confirmPassword: string | null;
}

type ScreenState = 'verifying' | 'ready' | 'invalid' | 'success';

export function ResetPasswordForm() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const incomingUrl = Linking.useLinkingURL();
  const { verifyPasswordResetCode, confirmPasswordReset } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const oobCodeFromParams = useMemo(
    () => extractOobCodeFromParams(params),
    [params],
  );

  const oobCode = useMemo(() => {
    return oobCodeFromParams ?? (incomingUrl ? extractOobCodeFromUrl(incomingUrl) : null);
  }, [oobCodeFromParams, incomingUrl]);

  const mode = useMemo(() => {
    return (
      extractModeFromParams(params) ??
      (incomingUrl ? extractModeFromUrl(incomingUrl) : null)
    );
  }, [params, incomingUrl]);

  const [screenState, setScreenState] = useState<ScreenState>('verifying');
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({
    password: null,
    confirmPassword: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyLink() {
      logPasswordResetDiagnostic('reset-password:verify-inicio', {
        routeName: 'reset-password',
        incomingUrl: incomingUrl ? redactSensitiveUrl(incomingUrl) : null,
        incomingPathname: incomingUrl ? getPathnameFromUrl(incomingUrl) : null,
        paramKeys: Object.keys(params),
        mode,
        oobCodeFromParams: describeOobCode(oobCodeFromParams),
        oobCodeFinal: describeOobCode(oobCode),
      });

      if (!oobCode) {
        logPasswordResetDiagnostic('reset-password:sem-oobCode', {
          routeName: 'reset-password',
          mode,
        });
        if (!cancelled) {
          setLinkError('Link de recuperação inválido ou incompleto.');
          setScreenState('invalid');
        }
        return;
      }

      if (mode && mode !== 'resetPassword') {
        logPasswordResetDiagnostic('reset-password:mode-invalido', {
          routeName: 'reset-password',
          mode,
          ...describeOobCode(oobCode),
        });
        if (!cancelled) {
          setLinkError('Este link não é válido para redefinição de senha.');
          setScreenState('invalid');
        }
        return;
      }

      logPasswordResetDiagnostic('reset-password:verify-chamada', {
        routeName: 'reset-password',
        mode: mode ?? 'resetPassword',
        ...describeOobCode(oobCode),
      });

      try {
        const email = await verifyPasswordResetCode(oobCode);
        logPasswordResetDiagnostic('reset-password:verify-sucesso', {
          routeName: 'reset-password',
          emailDomain: email.includes('@') ? email.split('@')[1] : null,
          ...describeOobCode(oobCode),
        });
        if (!cancelled) {
          setAccountEmail(email);
          setScreenState('ready');
        }
      } catch (err) {
        logPasswordResetDiagnostic('reset-password:verify-falha-ui', {
          routeName: 'reset-password',
          ...describeOobCode(oobCode),
          uiErrorMessage: err instanceof Error ? err.message : String(err),
        });
        if (!cancelled) {
          setLinkError(err instanceof Error ? err.message : 'Link de recuperação inválido.');
          setScreenState('invalid');
        }
      }
    }

    verifyLink();

    return () => {
      cancelled = true;
    };
  }, [mode, oobCode, oobCodeFromParams, incomingUrl, params, verifyPasswordResetCode]);

  function validateConfirmPassword(value: string, pwd: string): string | null {
    if (!value) return 'Confirmação de senha é obrigatória';
    if (value !== pwd) return 'As senhas não coincidem';
    return null;
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (submitted) {
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
        confirmPassword: validateConfirmPassword(confirmPassword, value),
      }));
    }
    if (submitError) setSubmitError(null);
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    if (submitted) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, password),
      }));
    }
    if (submitError) setSubmitError(null);
  }

  async function handleSubmit() {
    if (!oobCode || screenState !== 'ready') return;

    setSubmitted(true);

    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
    setFieldErrors({ password: passwordError, confirmPassword: confirmPasswordError });

    if (passwordError || confirmPasswordError) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await confirmPasswordReset(oobCode, password);
      setScreenState('success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const s = makeStyles(colors);

  if (screenState === 'verifying') {
    return (
      <View style={s.flex}>
        <View style={s.verifyingContainer}>
          <LoadingSpinner size="large" />
          <Text style={s.verifyingText}>Validando link de recuperação…</Text>
        </View>
      </View>
    );
  }

  if (screenState === 'invalid') {
    return (
      <View style={s.flex}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <Text style={s.title}>Link inválido</Text>
            <Text style={s.subtitle}>
              {linkError ?? 'Não foi possível validar o link de recuperação.'}
            </Text>
          </View>
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={s.button} accessibilityRole="button">
              <Text style={s.buttonText}>Solicitar novo link</Text>
            </TouchableOpacity>
          </Link>
          <View style={s.footer}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity accessibilityRole="link">
                <Text style={s.link}>Voltar para login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screenState === 'success') {
    return (
      <View style={s.flex}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <Text style={s.title}>Senha redefinida</Text>
            <Text style={s.subtitle}>
              Sua nova senha foi salva com sucesso. Agora você já pode entrar no Byte Bank.
            </Text>
          </View>
          <TouchableOpacity
            style={s.button}
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="button">
            <Text style={s.buttonText}>Ir para login</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Nova senha</Text>
          <Text style={s.subtitle}>
            {accountEmail
              ? `Defina uma nova senha para ${accountEmail}.`
              : 'Defina sua nova senha para continuar.'}
          </Text>
        </View>

        {submitError ? (
          <View style={s.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={s.errorBannerText}>{submitError}</Text>
          </View>
        ) : null}

        <View style={s.fieldWrapper}>
          <Text style={s.label}>Nova senha</Text>
          <View style={[s.inputRow, fieldErrors.password ? s.inputError : null]}>
            <TextInput
              style={s.inputFlex}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.icon}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              editable={!isSubmitting}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={s.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.icon}
              />
            </Pressable>
          </View>
          {fieldErrors.password ? (
            <Text style={s.fieldError} accessibilityRole="alert">
              {fieldErrors.password}
            </Text>
          ) : null}
        </View>

        <View style={s.fieldWrapper}>
          <Text style={s.label}>Confirmar nova senha</Text>
          <View style={[s.inputRow, fieldErrors.confirmPassword ? s.inputError : null]}>
            <TextInput
              style={s.inputFlex}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              placeholder="Repita a nova senha"
              placeholderTextColor={colors.icon}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!isSubmitting}
            />
            <Pressable
              onPress={() => setShowConfirmPassword((v) => !v)}
              style={s.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={
                showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'
              }>
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.icon}
              />
            </Pressable>
          </View>
          {fieldErrors.confirmPassword ? (
            <Text style={s.fieldError} accessibilityRole="alert">
              {fieldErrors.confirmPassword}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[s.button, isSubmitting && s.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}>
          {isSubmitting ? (
            <Text style={s.buttonText}>Salvando…</Text>
          ) : (
            <Text style={s.buttonText}>Salvar nova senha</Text>
          )}
        </TouchableOpacity>

        <View style={s.footer}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity accessibilityRole="link" disabled={isSubmitting}>
              <Text style={[s.link, isSubmitting && s.linkDisabled]}>Voltar para login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: (typeof Colors)['light']) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
      gap: 8,
    },
    header: {
      marginBottom: 24,
      gap: 4,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      color: colors.icon,
    },
    errorBanner: {
      backgroundColor: '#fef2f2',
      borderWidth: 1,
      borderColor: '#fca5a5',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    errorBannerText: {
      color: '#b91c1c',
      fontSize: 14,
      textAlign: 'center',
    },
    fieldWrapper: {
      gap: 4,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.background,
    },
    inputFlex: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    inputError: {
      borderColor: '#ef4444',
    },
    fieldError: {
      fontSize: 12,
      color: '#ef4444',
    },
    eyeButton: {
      padding: 4,
    },
    button: {
      height: 50,
      backgroundColor: colors.tint,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    link: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.tint,
    },
    linkDisabled: {
      opacity: 0.5,
    },
    verifyingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    verifyingText: {
      fontSize: 15,
      color: colors.icon,
    },
  });
}
