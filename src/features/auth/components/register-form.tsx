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
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { validateEmail, validateName, validatePassword } from '@/src/shared/utils/validators';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/use-auth';

interface FieldError {
  name: string | null;
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
}

export function RegisterForm() {
  const { signUp, isLoading, error, clearError } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError>({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [submitted, setSubmitted] = useState(false);

  // Limpa erro do contexto ao desmontar
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  function validateConfirmPassword(value: string, pwd: string): string | null {
    if (!value) return 'Confirmação de senha é obrigatória';
    if (value !== pwd) return 'As senhas não coincidem';
    return null;
  }

  function handleNameChange(value: string) {
    setName(value);
    if (submitted) {
      setFieldErrors((prev) => ({ ...prev, name: validateName(value) }));
    }
    if (error) clearError();
  }

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
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
        confirmPassword: validateConfirmPassword(confirmPassword, value),
      }));
    }
    if (error) clearError();
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    if (submitted) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, password),
      }));
    }
    if (error) clearError();
  }

  async function handleSubmit() {
    setSubmitted(true);

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

    setFieldErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (nameError || emailError || passwordError || confirmPasswordError) return;

    await signUp(email, password, name.trim());
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
          <Text style={s.title}>Criar conta</Text>
          <Text style={s.subtitle}>Preencha os dados para se cadastrar</Text>
        </View>

        {/* Erro global do Firebase (retornado pelo AuthProvider) */}
        {error ? (
          <View style={s.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={s.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* Campo nome */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>Nome</Text>
          <TextInput
            style={[s.input, fieldErrors.name ? s.inputError : null]}
            value={name}
            onChangeText={handleNameChange}
            placeholder="Seu nome"
            placeholderTextColor={colors.icon}
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            accessibilityLabel="Campo de nome"
            accessibilityHint="Digite seu nome completo"
            editable={!isLoading}
          />
          {fieldErrors.name ? (
            <Text style={s.fieldError} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {fieldErrors.name}
            </Text>
          ) : null}
        </View>

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
            accessibilityHint="Digite seu endereço de e-mail para cadastro"
            editable={!isLoading}
          />
          {fieldErrors.email ? (
            <Text style={s.fieldError} accessibilityRole="alert" accessibilityLiveRegion="polite">
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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.icon}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              accessibilityLabel="Campo de senha"
              accessibilityHint="Digite uma senha com no mínimo 6 caracteres"
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
            <Text style={s.fieldError} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {fieldErrors.password}
            </Text>
          ) : null}
        </View>

        {/* Campo confirmação de senha */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>Confirmar senha</Text>
          <View style={[s.inputRow, fieldErrors.confirmPassword ? s.inputError : null]}>
            <TextInput
              style={s.inputFlex}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              placeholder="Repita a senha"
              placeholderTextColor={colors.icon}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              accessibilityLabel="Campo de confirmação de senha"
              accessibilityHint="Repita a senha digitada anteriormente"
              editable={!isLoading}
            />
            <Pressable
              onPress={() => setShowConfirmPassword((v) => !v)}
              style={s.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.icon}
              />
            </Pressable>
          </View>
          {fieldErrors.confirmPassword ? (
            <Text style={s.fieldError} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {fieldErrors.confirmPassword}
            </Text>
          ) : null}
        </View>

        {/* Botão Cadastrar */}
        <TouchableOpacity
          style={[s.button, isLoading && s.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Criar conta"
          accessibilityState={{ busy: isLoading, disabled: isLoading }}>
          {isLoading ? (
            <Text style={s.buttonText}>Criando conta…</Text>
          ) : (
            <Text style={s.buttonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        {/* Link para login */}
        <View style={s.footer}>
          <Text style={s.footerText}>Já tem uma conta? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel="Entrar"
              disabled={isLoading}>
              <Text style={[s.link, isLoading && s.linkDisabled]}>Entrar</Text>
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
