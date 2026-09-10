import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { validateEmail } from '@/src/shared/utils/validators';
import { useAuth } from '../hooks/use-auth';

export function ForgotPasswordForm() {
  const { sendPasswordResetEmail, isLoading, error, clearError } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (submitted) {
      setEmailError(validateEmail(value));
    }
    if (error) clearError();
  }

  async function handleSubmit() {
    setSubmitted(true);

    const validationError = validateEmail(email);
    setEmailError(validationError);

    if (validationError || emailSent) return;

    const success = await sendPasswordResetEmail(email.trim());
    if (success) {
      setEmailSent(true);
    }
  }

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={s.title}>Recuperar senha</Text>
          <Text style={s.subtitle}>
            Digite seu e-mail e enviaremos as instruções para você criar uma nova senha.
          </Text>
        </View>

        {error ? (
          <View style={s.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={s.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {emailSent ? (
          <View style={s.successBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={s.successBannerText}>
              Se existir uma conta associada a este e-mail, enviaremos um link para redefinir sua
              senha no aplicativo Byte Bank.
            </Text>
          </View>
        ) : null}

        <View style={s.fieldWrapper}>
          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={[s.input, emailError ? s.inputError : null]}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="seu@email.com"
            placeholderTextColor={colors.icon}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            accessibilityLabel="Campo de e-mail"
            accessibilityHint="Digite o e-mail cadastrado na sua conta"
            editable={!isLoading && !emailSent}
          />
          {emailError ? (
            <Text style={s.fieldError} accessibilityRole="alert">
              {emailError}
            </Text>
          ) : null}
        </View>

        {!emailSent ? (
          <TouchableOpacity
            style={[s.button, isLoading && s.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Enviar instruções de recuperação"
            accessibilityState={{ busy: isLoading, disabled: isLoading }}>
            {isLoading ? (
              <Text style={s.buttonText}>Enviando…</Text>
            ) : (
              <Text style={s.buttonText}>Enviar instruções</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <View style={s.footer}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Voltar para login"
              disabled={isLoading}>
              <Text style={[s.link, isLoading && s.linkDisabled]}>Voltar para login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
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
    successBanner: {
      backgroundColor: '#f0fdf4',
      borderWidth: 1,
      borderColor: '#86efac',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    successBannerText: {
      color: '#166534',
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
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.background,
    },
    inputError: {
      borderColor: '#ef4444',
    },
    fieldError: {
      fontSize: 12,
      color: '#ef4444',
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
  });
}
