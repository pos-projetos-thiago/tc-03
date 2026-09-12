import { router } from 'expo-router';
import React, { useState } from 'react';
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
import { useAuth } from '@/src/features/auth';
import { AttachmentPicker } from '@/src/features/receipts/components/attachment-picker';
import { useTransactionExtraction } from '@/src/features/receipts/hooks/use-transaction-extraction';
import type { SelectedAttachment } from '@/src/features/receipts/types/selected-attachment';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { validateAmount } from '@/src/shared/utils/validators';

import { useCreateTransaction } from '../hooks/use-create-transaction';
import { useEditTransaction } from '../hooks/use-edit-transaction';
import { useReceiptUpload } from '../hooks/use-receipt-upload';
import type { Transaction, TransactionType } from '../types/transaction';
import { INVESTMENT_CATEGORIES } from '../types/transaction-investment-categories';

// ---------------------------------------------------------------------------
// Category options per type
// ---------------------------------------------------------------------------

const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Venda', 'Outros'] as const;

const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Outros',
] as const;

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
// DropdownSelect — dropdown colapsável, estado controlado pelo pai
// ---------------------------------------------------------------------------

interface DropdownSelectProps {
  options: readonly string[];
  value: string;
  placeholder: string;
  open: boolean;
  hasError: boolean;
  disabled: boolean;
  colors: ThemeColors;
  onToggle: () => void;
  onChange: (value: string) => void;
}

// Estilos estáticos do DropdownSelect — fora do componente para evitar
// recriação a cada render e incompatibilidade com o React Compiler.
const dropdownStyles = StyleSheet.create({
  trigger: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
  },
  arrow: {
    fontSize: 11,
    marginLeft: 8,
  },
  list: {
    borderWidth: 1,
    borderTopWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionTextBase: {
    fontSize: 15,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
  },
});

function DropdownSelect({
  options,
  value,
  placeholder,
  open,
  hasError,
  disabled,
  colors,
  onToggle,
  onChange,
}: DropdownSelectProps) {
  const borderColor = hasError ? '#ef4444' : colors.border;

  return (
    <View>
      {/* ── Trigger ── */}
      <Pressable
        onPress={() => { if (!disabled) onToggle(); }}
        style={[
          dropdownStyles.trigger,
          {
            borderColor,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottomLeftRadius: open ? 0 : 8,
            borderBottomRightRadius: open ? 0 : 8,
            borderBottomWidth: open ? 0 : 1,
            backgroundColor: colors.background,
          },
        ]}
        accessibilityRole="combobox"
        accessibilityLabel={value || placeholder}
        accessibilityState={{ expanded: open, disabled }}>
        <Text
          style={[
            dropdownStyles.triggerText,
            { color: value ? colors.text : colors.icon },
          ]}
          numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={[dropdownStyles.arrow, { color: colors.icon }]}>
          {open ? '▲' : '▼'}
        </Text>
      </Pressable>

      {/* ── Lista — só existe no DOM quando open=true ── */}
      {open ? (
        <View
          style={[
            dropdownStyles.list,
            {
              borderColor,
              borderTopColor: colors.divider,
              backgroundColor: colors.background,
            },
          ]}>
          {options.map((option, index) => {
            const isSelected = value === option;
            const isLast = index === options.length - 1;
            return (
              <Pressable
                key={option}
                onPress={() => onChange(option)}
                style={[
                  dropdownStyles.option,
                  !isLast && [dropdownStyles.optionBorder, { borderBottomColor: colors.divider }],
                  { backgroundColor: isSelected ? colors.tint + '18' : colors.background },
                ]}
                accessibilityRole="menuitem"
                accessibilityLabel={option}
                accessibilityState={{ selected: isSelected }}>
                <Text
                  style={[
                    dropdownStyles.optionTextBase,
                    {
                      color: isSelected ? colors.tint : colors.text,
                      fontWeight: isSelected ? '600' : '400',
                    },
                  ]}>
                  {option}
                </Text>
                {isSelected ? (
                  <Text style={[dropdownStyles.checkmark, { color: colors.tint }]}>✓</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
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
  const { analyze, isAnalyzing, result: extractionResult, error: extractionError, reset: resetExtraction } =
    useTransactionExtraction();

  const isSubmitting = isEditing ? isEditing_ : isCreating;
  const error = isEditing ? editError : createError;
  const clearError = isEditing ? clearEditError : clearCreateError;

  // -------------------------------------------------------------------------
  // Field state
  // -------------------------------------------------------------------------

  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense');
  const [amount, setAmount] = useState<string>(
    initialData ? String(initialData.amount) : '',
  );
  const [category, setCategory] = useState<string>(initialData?.category ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [date, setDate] = useState<string>(
    initialData ? isoToDateInput(initialData.date) : todayAsInput(),
  );

  // Estado do dropdown — controlado aqui para poder fechar ao trocar o tipo
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const [selectedAttachment, setSelectedAttachment] = useState<SelectedAttachment | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_ERRORS);
  const [submitted, setSubmitted] = useState(false);

  // -------------------------------------------------------------------------
  // Análise por IA — pré-preenche apenas campos ainda vazios
  // -------------------------------------------------------------------------

  async function handleAnalyzeWithAI() {
    if (!selectedAttachment) return;
    const result = await analyze(selectedAttachment);
    if (!result) return;

    if (result.type !== null && type === 'expense') {
      setType(result.type);
      if (result.type === 'investment' && !category) {
        setCategory(INVESTMENT_CATEGORIES[0]);
      }
    }
    if (result.amount !== null && !amount) {
      setAmount(String(result.amount));
    }
    if (result.category !== null && !category) {
      setCategory(result.category);
    }
    if (result.description !== null && !description) {
      setDescription(result.description);
    }
    if (result.date !== null && date === todayAsInput()) {
      try {
        const d = new Date(result.date);
        if (!isNaN(d.getTime())) {
          const dd = String(d.getUTCDate()).padStart(2, '0');
          const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
          const yyyy = d.getUTCFullYear();
          setDate(`${dd}/${mm}/${yyyy}`);
        }
      } catch {
        // data inválida — ignora silenciosamente
      }
    }
  }

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
    setCategoryDropdownOpen(false);
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

    let resolvedReceiptUrl: string | null = initialData?.receiptUrl ?? null;

    if (selectedAttachment) {
      const tempId = isEditing && initialData ? initialData.id : `tmp_${Date.now()}`;
      const uploadedUrl = await upload(user.id, tempId, selectedAttachment);
      if (uploadedUrl === null) return;
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
              style={[s.segment, type === 'income' && s.segmentActive]}
              onPress={() => {
                setType('income');
                setCategory('');
                setCategoryDropdownOpen(false);
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
            <View style={s.segmentDivider} />
            <TouchableOpacity
              style={[s.segment, type === 'expense' && s.segmentActive]}
              onPress={() => {
                setType('expense');
                setCategory('');
                setCategoryDropdownOpen(false);
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
            <View style={s.segmentDivider} />
            <TouchableOpacity
              style={[s.segment, type === 'investment' && s.segmentActive]}
              onPress={() => {
                setType('investment');
                setCategory(INVESTMENT_CATEGORIES[0]);
                setCategoryDropdownOpen(false);
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

        {/* Categoria */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>
            {type === 'investment' ? 'Tipo de investimento' : 'Categoria'}
          </Text>

          {type === 'investment' ? (
            /* ── Picker fixo para investimento — comportamento original ── */
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
            /* ── Dropdown colapsável para income e expense ── */
            <DropdownSelect
              options={type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
              value={category}
              placeholder="Selecione uma categoria"
              open={categoryDropdownOpen}
              hasError={Boolean(fieldErrors.category)}
              disabled={isSubmitting}
              colors={colors}
              onToggle={() => setCategoryDropdownOpen((prev) => !prev)}
              onChange={handleCategoryChange}
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

        {/* Data — exibida somente na edição; na criação usa a data atual automaticamente */}
        {isEditing ? (
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
        ) : null}

        {/* Anexo — opcional */}
        <View style={s.fieldWrapper}>
          <Text style={s.label}>
            Anexo <Text style={s.labelOptional}>(opcional)</Text>
          </Text>
          <AttachmentPicker
            selectedAttachment={selectedAttachment}
            existingAttachmentUrl={initialData?.receiptUrl ?? null}
            onSelect={(attachment) => {
              setSelectedAttachment(attachment);
              resetExtraction();
              if (uploadError) clearUploadError();
            }}
            disabled={isSubmitting}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
          />
        </View>

        {/* Importar com IA — visível somente quando há anexo selecionado */}
        {selectedAttachment && !isEditing ? (
          <View style={s.fieldWrapper}>
            <TouchableOpacity
              style={[s.aiButton, (isAnalyzing || isSubmitting) && s.buttonDisabled]}
              onPress={handleAnalyzeWithAI}
              disabled={isAnalyzing || isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Analisar documento com IA"
              accessibilityState={{ busy: isAnalyzing }}>
              <Text style={s.aiButtonText}>
                {isAnalyzing ? '⏳ Analisando documento…' : '✨ Importar com IA'}
              </Text>
            </TouchableOpacity>

            {extractionResult?.confidence === 'low' ? (
              <View style={s.aiWarningBanner} accessibilityRole="alert">
                <Text style={s.aiWarningText}>
                  ⚠️ A IA não tem certeza sobre alguns dados. Confira antes de salvar.
                </Text>
              </View>
            ) : null}

            {extractionResult && extractionResult.confidence !== 'low' ? (
              <View style={s.aiSuccessBanner}>
                <Text style={s.aiSuccessText}>
                  ✅ Dados preenchidos pela IA. Revise e confirme antes de salvar.
                </Text>
              </View>
            ) : null}

            {extractionError ? (
              <View style={s.errorBanner} accessibilityRole="alert">
                <Text style={s.errorBannerText}>{extractionError}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

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

function makeStyles(colors: ThemeColors) {
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
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: colors.negative,
      borderRadius: 4,
      padding: 12,
      marginBottom: 12,
    },
    errorBannerText: {
      color: colors.negative,
      fontSize: 13,
    },
    fieldWrapper: {
      gap: 6,
      marginBottom: 20,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    labelOptional: {
      fontSize: 11,
      fontWeight: '400',
      color: colors.textMuted,
      textTransform: 'none',
      letterSpacing: 0,
    },
    input: {
      height: 48,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    inputError: {
      borderColor: colors.negative,
    },
    fieldError: {
      fontSize: 12,
      color: colors.negative,
    },
    segmentRow: {
      flexDirection: 'row',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 6,
      overflow: 'hidden',
    },
    segment: {
      flex: 1,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    segmentActive: {
      backgroundColor: colors.tint,
    },
    segmentDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textMuted,
    },
    segmentTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    button: {
      height: 50,
      backgroundColor: colors.tint,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '600',
    },
    // ── Picker fixo (investment) ──
    pickerWrapper: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 6,
      overflow: 'hidden',
    },
    pickerOption: {
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    pickerOptionSelected: {
      backgroundColor: colors.tint + '15',
    },
    pickerOptionText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    pickerOptionTextSelected: {
      color: colors.tint,
      fontWeight: '600',
    },
    // ── IA ──
    aiButton: {
      height: 46,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    aiButtonText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    aiWarningBanner: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: '#F0A500',
      borderRadius: 4,
      padding: 10,
    },
    aiWarningText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    aiSuccessBanner: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      borderRadius: 4,
      padding: 10,
    },
    aiSuccessText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
  });
}
