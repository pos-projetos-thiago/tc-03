import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';

import type { TransactionType } from '../types/transaction';
import { INVESTMENT_CATEGORIES } from '../types/transaction-investment-categories';
import type { TransactionFilter } from '../types/transaction-filter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Aceita DD/MM/AAAA e devolve Date ou null se inválido. */
function parseDateInput(value: string): Date | null {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00.000`);
  return isNaN(date.getTime()) ? null : date;
}

/** Converte Date para DD/MM/AAAA. */
function dateToInput(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function isFilterActive(filter: TransactionFilter): boolean {
  return filter.type !== null || filter.category !== null || filter.dateRange !== null;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransactionFilterBarProps {
  filter: TransactionFilter;
  onApply: (filter: TransactionFilter) => void;
  onClear: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Barra de filtros para a lista de transações.
 *
 * Filtros suportados:
 *   - type: segmented control (Todos / Receita / Despesa / Investimento)
 *   - category:
 *       - quando type === 'investment': chips de seleção usando INVESTMENT_CATEGORIES
 *       - nos demais casos: TextInput livre (comparação exata no Firestore)
 *   - dateRange: dois campos DD/MM/AAAA com validação
 */
export function TransactionFilterBar({ filter, onApply, onClear }: TransactionFilterBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [localType, setLocalType] = useState<TransactionType | null>(filter.type);
  const [localCategory, setLocalCategory] = useState<string>(filter.category ?? '');
  const [localDateStart, setLocalDateStart] = useState<string>(
    filter.dateRange ? dateToInput(filter.dateRange.start) : '',
  );
  const [localDateEnd, setLocalDateEnd] = useState<string>(
    filter.dateRange ? dateToInput(filter.dateRange.end) : '',
  );
  const [dateError, setDateError] = useState<string | null>(null);

  // Quando o tipo muda para/de 'investment', limpa a categoria
  // para evitar enviar uma categoria inválida para o outro modo.
  function handleTypeChange(type: TransactionType | null) {
    if (type !== localType) {
      setLocalCategory('');
    }
    setLocalType(type);
  }

  function handleApply() {
    setDateError(null);

    let dateRange: TransactionFilter['dateRange'] = null;
    const hasStart = localDateStart.trim().length > 0;
    const hasEnd = localDateEnd.trim().length > 0;

    if (hasStart || hasEnd) {
      const start = parseDateInput(localDateStart);
      const end = parseDateInput(localDateEnd);

      if (!start || !end) {
        setDateError('Datas inválidas. Use o formato DD/MM/AAAA nos dois campos.');
        return;
      }
      if (start > end) {
        setDateError('A data inicial não pode ser posterior à data final.');
        return;
      }
      end.setHours(23, 59, 59, 999);
      dateRange = { start, end };
    }

    onApply({
      type: localType,
      category: localCategory.trim() || null,
      dateRange,
    });
  }

  function handleClear() {
    setLocalType(null);
    setLocalCategory('');
    setLocalDateStart('');
    setLocalDateEnd('');
    setDateError(null);
    onClear();
  }

  const active = isFilterActive(filter);
  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      {/* ------------------------------------------------------------------ */}
      {/* Tipo                                                                */}
      {/* ------------------------------------------------------------------ */}
      <View style={s.fieldWrapper}>
        <Text style={s.label}>Tipo</Text>
        <View style={s.segmentRow}>
          <Pressable
            style={[s.segment, localType === null && s.segmentSelected]}
            onPress={() => handleTypeChange(null)}
            accessibilityRole="button"
            accessibilityLabel="Todos"
            accessibilityState={{ selected: localType === null }}>
            <Text style={[s.segmentText, localType === null && s.segmentTextSelected]}>
              Todos
            </Text>
          </Pressable>
          <Pressable
            style={[s.segment, localType === 'income' && s.segmentIncome]}
            onPress={() => handleTypeChange(localType === 'income' ? null : 'income')}
            accessibilityRole="button"
            accessibilityLabel="Receita"
            accessibilityState={{ selected: localType === 'income' }}>
            <Text style={[s.segmentText, localType === 'income' && s.segmentTextSelected]}>
              Receita
            </Text>
          </Pressable>
          <Pressable
            style={[s.segment, localType === 'expense' && s.segmentExpense]}
            onPress={() => handleTypeChange(localType === 'expense' ? null : 'expense')}
            accessibilityRole="button"
            accessibilityLabel="Despesa"
            accessibilityState={{ selected: localType === 'expense' }}>
            <Text style={[s.segmentText, localType === 'expense' && s.segmentTextSelected]}>
              Despesa
            </Text>
          </Pressable>
          <Pressable
            style={[s.segment, localType === 'investment' && s.segmentInvestment]}
            onPress={() =>
              handleTypeChange(localType === 'investment' ? null : 'investment')
            }
            accessibilityRole="button"
            accessibilityLabel="Investimento"
            accessibilityState={{ selected: localType === 'investment' }}>
            <Text
              style={[
                s.segmentText,
                localType === 'investment' && s.segmentTextSelected,
              ]}>
              Investimento
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Categoria                                                           */}
      {/* ------------------------------------------------------------------ */}
      <View style={s.fieldWrapper}>
        <Text style={s.label}>Categoria</Text>

        {localType === 'investment' ? (
          /* Chips de seleção para investimentos */
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipsRow}
            accessibilityRole="none">
            {INVESTMENT_CATEGORIES.map((cat) => {
              const selected = localCategory === cat;
              return (
                <Pressable
                  key={cat}
                  style={[s.chip, selected && s.chipSelected]}
                  onPress={() => setLocalCategory(selected ? '' : cat)}
                  accessibilityRole="button"
                  accessibilityLabel={cat}
                  accessibilityState={{ selected }}>
                  <Text style={[s.chipText, selected && s.chipTextSelected]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          /* TextInput livre para income/expense/todos */
          <TextInput
            style={s.input}
            value={localCategory}
            onChangeText={setLocalCategory}
            placeholder="Filtrar por categoria exata"
            placeholderTextColor={colors.icon}
            autoCapitalize="sentences"
            returnKeyType="done"
            accessibilityLabel="Filtro por categoria"
          />
        )}
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Período                                                             */}
      {/* ------------------------------------------------------------------ */}
      <View style={s.fieldWrapper}>
        <Text style={s.label}>Período</Text>
        <View style={s.dateRow}>
          <TextInput
            style={[s.inputHalf, dateError ? s.inputError : null]}
            value={localDateStart}
            onChangeText={(v) => {
              setLocalDateStart(v);
              setDateError(null);
            }}
            placeholder="De DD/MM/AAAA"
            placeholderTextColor={colors.icon}
            keyboardType="numeric"
            maxLength={10}
            accessibilityLabel="Data inicial do período"
          />
          <TextInput
            style={[s.inputHalf, dateError ? s.inputError : null]}
            value={localDateEnd}
            onChangeText={(v) => {
              setLocalDateEnd(v);
              setDateError(null);
            }}
            placeholder="Até DD/MM/AAAA"
            placeholderTextColor={colors.icon}
            keyboardType="numeric"
            maxLength={10}
            accessibilityLabel="Data final do período"
          />
        </View>
        {dateError ? (
          <Text style={s.fieldError} accessibilityRole="alert">
            {dateError}
          </Text>
        ) : null}
      </View>

      {/* ------------------------------------------------------------------ */}
      {/* Ações                                                               */}
      {/* ------------------------------------------------------------------ */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.btnApply, { backgroundColor: colors.tint }]}
          onPress={handleApply}
          accessibilityRole="button"
          accessibilityLabel="Aplicar filtros">
          <Text style={s.btnApplyText}>Aplicar</Text>
        </TouchableOpacity>

        {active ? (
          <TouchableOpacity
            style={s.btnClear}
            onPress={handleClear}
            accessibilityRole="button"
            accessibilityLabel="Limpar filtros">
            <Text style={[s.btnClearText, { color: colors.tint }]}>Limpar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function makeStyles(colors: (typeof Colors)['light']) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#e5e7eb',
      gap: 10,
    },
    fieldWrapper: {
      gap: 4,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.icon,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    segmentRow: {
      flexDirection: 'row',
      gap: 6,
    },
    segment: {
      flex: 1,
      height: 36,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    segmentSelected: {
      borderColor: colors.tint,
      backgroundColor: colors.tint + '18',
    },
    segmentIncome: {
      borderColor: '#16a34a',
      backgroundColor: '#dcfce7',
    },
    segmentExpense: {
      borderColor: '#dc2626',
      backgroundColor: '#fee2e2',
    },
    segmentInvestment: {
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff',
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.icon,
    },
    segmentTextSelected: {
      color: colors.text,
      fontWeight: '700',
    },
    // Chips de categoria (investimento)
    chipsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 2,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#d1d5db',
      backgroundColor: colors.background,
    },
    chipSelected: {
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff',
    },
    chipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.icon,
    },
    chipTextSelected: {
      color: '#1d4ed8',
      fontWeight: '700',
    },
    // TextInput categoria livre
    input: {
      height: 40,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 10,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.background,
    },
    // Campos de data
    dateRow: {
      flexDirection: 'row',
      gap: 8,
    },
    inputHalf: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 10,
      fontSize: 14,
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
    // Botões
    actions: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    btnApply: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    btnApplyText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    btnClear: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    btnClearText: {
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
