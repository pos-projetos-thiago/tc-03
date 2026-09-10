import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

import { Colors, type ThemeColors } from '@/constants/theme';
import { isFirebaseConfigured } from '@/src/lib/firebase/config';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { validateEmail, validatePassword } from '@/src/shared/utils/validators';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/use-auth';

interface FieldError {
  email: string | null;
  password: string | null;
}

export function LoginForm() {
  const { signIn, isLoading, error, clearError } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({ email: null, password: null });
  const [submitted, setSubmitted] = useState(false);

  // Limpa erro do contexto ao desmontar ou ao usuário começar a digitar
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (submitted) {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
    if (error) clearError();
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (submitted) {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
    if (error) clearError();
  }

  async function handleSubmit() {
    setSubmitted(true);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setFieldErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    await signIn(email, password);
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

        {/* Cabeçalho */}
        <View style={s.header}>
          <Text style={s.title}>Bem-vindo</Text>
          <Text style={s.subtitle}>Entre na sua conta para continuar</Text>
        </View>

        {/* Erro global do Firebase (retornado pelo AuthProvider) */}
        {!isFirebaseConfigured() ? (
          <View style={s.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={s.errorBannerText}>
              Firebase não configurado. Crie o arquivo .env com EXPO_PUBLIC_FIREBASE_* (copie de
              .env.example), preencha com os dados do projeto e reinicie com npx expo start --clear
              --tunnel.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={s.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={s.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* Campo e-mail */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={[s.input, fieldErrors.email ? s.inputError : null]}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="seu@email.com"
            placeholderTextColor={colors.icon}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            accessibilityLabel="Campo de e-mail"
            accessibilityHint="Digite seu endereço de e-mail"
            editable={!isLoading}
          />
          {fieldErrors.email ? (
            <Text style={s.fieldError} accessibilityRole="alert">
              {fieldErrors.email}
            </Text>
          ) : null}
        </View>

        {/* Campo senha */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>Senha</Text>
          <View style={[s.inputRow, fieldErrors.password ? s.inputError : null]}>
            <TextInput
              style={s.inputFlex}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Sua senha"
              placeholderTextColor={colors.icon}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              accessibilityLabel="Campo de senha"
              accessibilityHint="Digite sua senha"
              editable={!isLoading}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={s.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
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
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity
              style={s.forgotPasswordLink}
              accessibilityRole="link"
              accessibilityLabel="Esqueci minha senha"
              disabled={isLoading}>
              <Text style={[s.forgotPasswordText, isLoading && s.linkDisabled]}>
                Esqueci minha senha
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Botão Entrar */}
        <TouchableOpacity
          style={[s.button, isLoading && s.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Entrar"
          accessibilityState={{ busy: isLoading, disabled: isLoading }}>
          {isLoading ? (
            <Text style={s.buttonText}>Entrando…</Text>
          ) : (
            <Text style={s.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Link para cadastro */}
        <View style={s.footer}>
          <Text style={s.footerText}>Não tem uma conta? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Criar conta"
              disabled={isLoading}>
              <Text style={[s.link, isLoading && s.linkDisabled]}>Criar conta</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    forgotPasswordLink: {
      alignSelf: 'flex-end',
      marginTop: 4,
    },
    forgotPasswordText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.tint,
    },
    eyeButton: {
      padding: 4,
    },
    eyeIcon: {
      fontSize: 18,
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
    footerText: {
      fontSize: 14,
      color: colors.icon,
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
