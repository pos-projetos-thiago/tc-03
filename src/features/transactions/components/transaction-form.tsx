import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { useAuth } from '@/src/features/auth';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { validateAmount } from '@/src/shared/utils/validators';

import { useCreateTransaction } from '../hooks/use-create-transaction';
import { useEditTransaction } from '../hooks/use-edit-transaction';
import { useReceiptUpload } from '../hooks/use-receipt-upload';
import type { Transaction, TransactionType } from '../types/transaction';
import { INVESTMENT_CATEGORIES } from '../types/transaction-investment-categories';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateDescription(value: string): string | null {
  if (value.trim().length > 120) return 'Descrição deve ter no máximo 120 caracteres';
  return null;
}

function validateCategory(value: string): string | null {
  if (!value.trim()) return 'Categoria é obrigatória';
  if (value.trim().length > 60) return 'Categoria deve ter no máximo 60 caracteres';
  return null;
}

/** Aceita DD/MM/AAAA e devolve ISO 8601, ou null se inválido. */
function parseDateInput(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T12:00:00.000Z`);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Converte ISO 8601 para DD/MM/AAAA para exibição no campo. */
function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function validateDate(value: string): string | null {
  if (!value.trim()) return 'Data é obrigatória';
  if (!parseDateInput(value)) return 'Data inválida. Use o formato DD/MM/AAAA';
  return null;
}

function todayAsInput(): string {
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const m = String(today.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${today.getFullYear()}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldErrors {
  type: string | null;
  amount: string | null;
  category: string | null;
  description: string | null;
  date: string | null;
}

const EMPTY_ERRORS: FieldErrors = {
  type: null,
  amount: null,
  category: null,
  description: null,
  date: null,
};

interface TransactionFormProps {
  /** Quando fornecido, o formulário opera em modo de edição. */
  initialData?: Transaction;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Formulário de criação e edição de transação.
 * - Sem `initialData`: modo criação — usa useCreateTransaction.
 * - Com `initialData`: modo edição — usa useEditTransaction, preserva userId original.
 * Após salvar com sucesso, fecha a tela e a lista se atualiza via useFocusEffect.
 */
export function TransactionForm({ initialData }: TransactionFormProps) {
  const isEditing = initialData !== undefined;

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();

  const { create, isSubmitting: isCreating, error: createError, clearError: clearCreateError } =
    useCreateTransaction();
  const { edit, isSubmitting: isEditing_, error: editError, clearError: clearEditError } =
    useEditTransaction();
  const { upload, progress: uploadProgress, isUploading, error: uploadError, clearError: clearUploadError } =
    useReceiptUpload();

  const isSubmitting = isEditing ? isEditing_ : isCreating;
  const error = isEditing ? editError : createError;
  const clearError = isEditing ? clearEditError : clearCreateError;

  // -------------------------------------------------------------------------
  // Field state — inicializado com initialData quando em modo edição
  // -------------------------------------------------------------------------

  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense');
  const [amount, setAmount] = useState<string>(
    initialData ? String(initialData.amount) : '',
  );
  // Investimento: categoria começa na primeira opção da lista se não vier de initialData
  const [category, setCategory] = useState<string>(
    initialData?.category ?? '',
  );
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [date, setDate] = useState<string>(
    initialData ? isoToDateInput(initialData.date) : todayAsInput(),
  );

  // URI local selecionada pelo picker (ainda não enviada)
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_ERRORS);
  const [submitted, setSubmitted] = useState(false);

  // -------------------------------------------------------------------------
  // Field change handlers
  // -------------------------------------------------------------------------

  function handleAmountChange(value: string) {
    const sanitised = value.replace(/[^0-9.,]/g, '');
    setAmount(sanitised);
    if (submitted) {
      setFieldErrors((prev) => ({
        ...prev,
        amount: validateAmount(sanitised.replace(',', '.')),
      }));
    }
    if (error) clearError();
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    if (submitted) {
      setFieldErrors((prev) => ({ ...prev, category: validateCategory(value) }));
    }
    if (error) clearError();
  }

  function handleDescriptionChange(value: string) {
    setDescription(value);
    if (submitted) {
      setFieldErrors((prev) => ({ ...prev, description: validateDescription(value) }));
    }
    if (error) clearError();
  }

  function handleDateChange(value: string) {
    setDate(value);
    if (submitted) {
      setFieldErrors((prev) => ({ ...prev, date: validateDate(value) }));
    }
    if (error) clearError();
  }

  // -------------------------------------------------------------------------
  // Receipt picker
  // -------------------------------------------------------------------------

  async function handlePickReceipt() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setReceiptUri(result.assets[0].uri);
      clearUploadError();
    }
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------

  async function handleSubmit() {
    setSubmitted(true);

    const amountNum = parseFloat(amount.replace(',', '.'));
    const errors: FieldErrors = {
      type: null,
      amount: validateAmount(amountNum),
      category: validateCategory(category),
      description: validateDescription(description),
      date: validateDate(date),
    };
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) return;
    if (!user) return;

    const isoDate = parseDateInput(date)!;

    // ------------------------------------------------------------------
    // Upload do recibo (opcional) — ocorre antes de salvar a transação.
    // Se falhar, o submit é interrompido.
    // ------------------------------------------------------------------
    let resolvedReceiptUrl: string | null = initialData?.receiptUrl ?? null;

    if (receiptUri) {
      // Para criação usamos um ID temporário baseado em timestamp;
      // para edição usamos o ID real da transação.
      const tempId = isEditing && initialData ? initialData.id : `tmp_${Date.now()}`;
      const uploadedUrl = await upload(user.id, tempId, receiptUri);
      if (uploadedUrl === null) {
        // uploadError já está setado pelo hook — não prosseguir
        return;
      }
      resolvedReceiptUrl = uploadedUrl;
    }

    let success = false;

    if (isEditing && initialData) {
      const result = await edit(initialData.id, initialData.userId, {
        type,
        amount: amountNum,
        category: category.trim(),
        description: description.trim(),
        date: isoDate,
        receiptUrl: resolvedReceiptUrl,
      });
      success = result !== null;
    } else {
      const result = await create({
        userId: user.id,
        type,
        amount: amountNum,
        category: category.trim(),
        description: description.trim(),
        date: isoDate,
        receiptUrl: resolvedReceiptUrl,
      });
      success = result !== null;
    }

    if (success) {
      router.back();
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Erro global */}
        {error ? (
          <View style={s.errorBanner} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={s.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* Tipo */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>Tipo</Text>
          <View style={s.segmentRow}>
            <TouchableOpacity
              style={[s.segment, type === 'income' && s.segmentActiveIncome]}
              onPress={() => {
                setType('income');
                setCategory('');
                if (error) clearError();
              }}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Depósito"
              accessibilityState={{ selected: type === 'income' }}>
              <Text style={[s.segmentText, type === 'income' && s.segmentTextActive]}>
                Depósito
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.segment, type === 'expense' && s.segmentActiveExpense]}
              onPress={() => {
                setType('expense');
                setCategory('');
                if (error) clearError();
              }}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Saque"
              accessibilityState={{ selected: type === 'expense' }}>
              <Text style={[s.segmentText, type === 'expense' && s.segmentTextActive]}>
                Saque
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.segment, type === 'investment' && s.segmentActiveInvestment]}
              onPress={() => {
                setType('investment');
                // Pré-seleciona a primeira categoria de investimento
                setCategory(INVESTMENT_CATEGORIES[0]);
                if (error) clearError();
              }}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Investimento"
              accessibilityState={{ selected: type === 'investment' }}>
              <Text style={[s.segmentText, type === 'investment' && s.segmentTextActive]}>
                Investimento
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Valor */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>Valor (R$)</Text>
          <TextInput
            style={[s.input, fieldErrors.amount ? s.inputError : null]}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0,00"
            placeholderTextColor={colors.icon}
            keyboardType="decimal-pad"
            returnKeyType="next"
            accessibilityLabel="Campo de valor"
            editable={!isSubmitting}
          />
          {fieldErrors.amount ? (
            <Text style={s.fieldError} accessibilityRole="alert">{fieldErrors.amount}</Text>
          ) : null}
        </View>

        {/* Categoria — picker fixo para investimento, texto livre para demais */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>
            {type === 'investment' ? 'Tipo de investimento' : 'Categoria'}
          </Text>
          {type === 'investment' ? (
            <View style={[s.pickerWrapper, fieldErrors.category ? s.inputError : null]}>
              {INVESTMENT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    s.pickerOption,
                    category === cat && s.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    if (submitted) {
                      setFieldErrors((prev) => ({ ...prev, category: null }));
                    }
                    if (error) clearError();
                  }}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                  accessibilityLabel={cat}
                  accessibilityState={{ selected: category === cat }}>
                  <Text
                    style={[
                      s.pickerOptionText,
                      category === cat && s.pickerOptionTextSelected,
                    ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <TextInput
              style={[s.input, fieldErrors.category ? s.inputError : null]}
              value={category}
              onChangeText={handleCategoryChange}
              placeholder={type === 'income' ? 'Ex: Salário, Freelance…' : 'Ex: Alimentação, Transporte…'}
              placeholderTextColor={colors.icon}
              autoCapitalize="sentences"
              returnKeyType="next"
              accessibilityLabel="Campo de categoria"
              editable={!isSubmitting}
            />
          )}
          {fieldErrors.category ? (
            <Text style={s.fieldError} accessibilityRole="alert">{fieldErrors.category}</Text>
          ) : null}
        </View>

        {/* Descrição — opcional */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>Descrição <Text style={s.labelOptional}>(opcional)</Text></Text>
          <TextInput
            style={[s.input, fieldErrors.description ? s.inputError : null]}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="Descreva a transação"
            placeholderTextColor={colors.icon}
            autoCapitalize="sentences"
            returnKeyType="next"
            accessibilityLabel="Campo de descrição"
            editable={!isSubmitting}
          />
          {fieldErrors.description ? (
            <Text style={s.fieldError} accessibilityRole="alert">{fieldErrors.description}</Text>
          ) : null}
        </View>

        {/* Data */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>Data</Text>
          <TextInput
            style={[s.input, fieldErrors.date ? s.inputError : null]}
            value={date}
            onChangeText={handleDateChange}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={colors.icon}
            keyboardType="numeric"
            maxLength={10}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            accessibilityLabel="Campo de data"
            accessibilityHint="Use o formato DD/MM/AAAA"
            editable={!isSubmitting}
          />
          {fieldErrors.date ? (
            <Text style={s.fieldError} accessibilityRole="alert">{fieldErrors.date}</Text>
          ) : null}
        </View>

        {/* Recibo — opcional */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>
            Recibo <Text style={s.labelOptional}>(opcional)</Text>
          </Text>

          {/* Recibo já salvo em modo edição */}
          {isEditing && initialData?.receiptUrl && !receiptUri ? (
            <View style={s.receiptBadge} accessibilityRole="text">
              <Text style={s.receiptBadgeText}>📎 Recibo já anexado</Text>
            </View>
          ) : null}

          {/* Preview da imagem selecionada localmente */}
          {receiptUri ? (
            <Image
              source={{ uri: receiptUri }}
              style={s.receiptPreview}
              accessibilityLabel="Preview do recibo selecionado"
              resizeMode="cover"
            />
          ) : null}

          {/* Progresso de upload */}
          {isUploading ? (
            <View style={s.uploadProgress} accessibilityRole="progressbar" accessibilityValue={{ now: uploadProgress ?? 0, min: 0, max: 100 }}>
              <ActivityIndicator size="small" color={colors.tint} />
              <Text style={s.uploadProgressText}>
                Enviando recibo… {uploadProgress !== null ? `${uploadProgress}%` : ''}
              </Text>
            </View>
          ) : null}

          {/* Erro de upload */}
          {uploadError ? (
            <Text style={s.fieldError} accessibilityRole="alert">{uploadError}</Text>
          ) : null}

          <TouchableOpacity
            style={[s.receiptButton, (isSubmitting || isUploading) && s.buttonDisabled]}
            onPress={handlePickReceipt}
            disabled={isSubmitting || isUploading}
            accessibilityRole="button"
            accessibilityLabel="Selecionar recibo da galeria">
            <Text style={s.receiptButtonText}>
              {receiptUri
                ? '🔄 Trocar recibo'
                : isEditing && initialData?.receiptUrl
                  ? '🔄 Substituir recibo'
                  : '📎 Anexar recibo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botão salvar */}
        <TouchableOpacity
          style={[s.button, isSubmitting && s.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Salvar alterações' : 'Salvar transação'}
          accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}>
          <Text style={s.buttonText}>
            {isSubmitting
              ? 'Salvando…'
              : isEditing
                ? 'Salvar alterações'
                : 'Salvar transação'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function makeStyles(colors: (typeof Colors)['light']) {
  return StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      padding: 24,
      gap: 4,
    },
    errorBanner: {
      backgroundColor: '#fef2f2',
      borderWidth: 1,
      borderColor: '#fca5a5',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    errorBannerText: {
      color: '#b91c1c',
      fontSize: 14,
      textAlign: 'center',
    },
    fieldWrapper: {
      gap: 4,
      marginBottom: 14,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    labelOptional: {
      fontSize: 12,
      fontWeight: '400',
      color: colors.icon,
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
    segmentRow: {
      flexDirection: 'row',
      gap: 8,
    },
    segment: {
      flex: 1,
      height: 44,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    segmentActiveIncome: {
      backgroundColor: '#dcfce7',
      borderColor: '#16a34a',
    },
    segmentActiveExpense: {
      backgroundColor: '#fee2e2',
      borderColor: '#dc2626',
    },
    segmentActiveInvestment: {
      backgroundColor: '#eff6ff',
      borderColor: '#2563eb',
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.icon,
    },
    segmentTextActive: {
      color: colors.text,
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
    pickerWrapper: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      overflow: 'hidden',
    },
    pickerOption: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#e5e7eb',
      backgroundColor: colors.background,
    },
    pickerOptionSelected: {
      backgroundColor: '#eff6ff',
    },
    pickerOptionText: {
      fontSize: 15,
      color: colors.icon,
    },
    pickerOptionTextSelected: {
      color: '#2563eb',
      fontWeight: '700',
    },
    receiptBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0fdf4',
      borderWidth: 1,
      borderColor: '#86efac',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 8,
    },
    receiptBadgeText: {
      fontSize: 14,
      color: '#16a34a',
    },
    receiptPreview: {
      width: '100%',
      height: 160,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: '#f3f4f6',
    },
    uploadProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    uploadProgressText: {
      fontSize: 13,
      color: colors.icon,
    },
    receiptButton: {
      height: 44,
      borderWidth: 1,
      borderColor: colors.tint,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    receiptButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.tint,
    },
  });
}
