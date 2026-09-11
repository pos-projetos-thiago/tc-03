import React, { useMemo, useState } from 'react';
import {
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
// Category options
// ---------------------------------------------------------------------------

const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Outros',
] as const;

// ---------------------------------------------------------------------------
// DropdownSelect — estilos estáticos fora do componente (React Compiler safe)
// ---------------------------------------------------------------------------

const dropdownStyles = StyleSheet.create({
  trigger: {
    height: 40,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
  },
  arrow: {
    fontSize: 10,
    marginLeft: 6,
  },
  list: {
    borderWidth: 1,
    borderTopWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 13,
    fontWeight: '700',
  },
});

interface DropdownSelectProps {
  options: readonly string[];
  value: string;
  placeholder: string;
  open: boolean;
  colors: ThemeColors;
  surface: string;
  onToggle: () => void;
  onChange: (value: string) => void;
}

function DropdownSelect({
  options,
  value,
  placeholder,
  open,
  colors,
  surface,
  onToggle,
  onChange,
}: DropdownSelectProps) {
  return (
    <View>
      {/* Trigger */}
      <Pressable
        onPress={onToggle}
        style={[
          dropdownStyles.trigger,
          {
            borderColor: colors.border,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottomLeftRadius: open ? 0 : 8,
            borderBottomRightRadius: open ? 0 : 8,
            borderBottomWidth: open ? 0 : 1,
            backgroundColor: surface,
          },
        ]}
        accessibilityRole="combobox"
        accessibilityLabel={value || placeholder}
        accessibilityState={{ expanded: open }}>
        <Text
          style={[dropdownStyles.triggerText, { color: value ? colors.text : colors.icon }]}
          numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={[dropdownStyles.arrow, { color: colors.icon }]}>
          {open ? '▲' : '▼'}
        </Text>
      </Pressable>

      {/* Lista */}
      {open ? (
        <View
          style={[
            dropdownStyles.list,
            {
              borderColor: colors.border,
              borderTopColor: colors.divider,
              backgroundColor: surface,
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
                  !isLast && [
                    dropdownStyles.optionBorder,
                    { borderBottomColor: colors.divider },
                  ],
                  { backgroundColor: isSelected ? colors.tint + '18' : surface },
                ]}
                accessibilityRole="menuitem"
                accessibilityLabel={option}
                accessibilityState={{ selected: isSelected }}>
                <Text
                  style={[
                    dropdownStyles.optionText,
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
 *       - nos demais casos: dropdown colapsável com opções por tipo
 *   - dateRange: dois campos DD/MM/AAAA com validação
 */
export function TransactionFilterBar({ filter, onApply, onClear }: TransactionFilterBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const [localType, setLocalType] = useState<TransactionType | null>(filter.type);
  const [localCategory, setLocalCategory] = useState<string>(filter.category ?? '');
  const [localDateStart, setLocalDateStart] = useState<string>(
    filter.dateRange ? dateToInput(filter.dateRange.start) : '',
  );
  const [localDateEnd, setLocalDateEnd] = useState<string>(
    filter.dateRange ? dateToInput(filter.dateRange.end) : '',
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Quando o tipo muda, limpa a categoria e fecha o dropdown
  function handleTypeChange(type: TransactionType | null) {
    if (type !== localType) {
      setLocalCategory('');
      setCategoryDropdownOpen(false);
    }
    setLocalType(type);
  }

  // Opções do dropdown — sempre as categorias de despesa/gasto,
  // que cobrem os casos de uso do filtro para income, expense e "Todos".
  const categoryOptions: readonly string[] = EXPENSE_CATEGORIES;

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
    setCategoryDropdownOpen(false);
    onClear();
  }

  const active = isFilterActive(filter);
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  // surface do tema para o dropdown (igual ao input do filtro)
  const surface = colors.surface;

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
          /* Chips horizontais para investimento — comportamento original */
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
          /* Dropdown colapsável para income, expense e "Todos" */
          <DropdownSelect
            options={categoryOptions}
            value={localCategory}
            placeholder="Filtrar por categoria"
            open={categoryDropdownOpen}
            colors={colors}
            surface={surface}
            onToggle={() => setCategoryDropdownOpen((prev) => !prev)}
            onChange={(val) => {
              // Toque na opção já selecionada desfaz a seleção
              setLocalCategory(localCategory === val ? '' : val);
              setCategoryDropdownOpen(false);
            }}
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

function makeStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 12,
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
      borderColor: colors.border,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    segmentSelected: {
      borderColor: colors.tint,
      backgroundColor: colors.tint + '18',
    },
    segmentIncome: {
      borderColor: '#16a34a',
      backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#dcfce7',
    },
    segmentExpense: {
      borderColor: '#dc2626',
      backgroundColor: isDark ? 'rgba(220, 38, 38, 0.15)' : '#fee2e2',
    },
    segmentInvestment: {
      borderColor: '#2563eb',
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff',
    },
    segmentText: {
      fontSize: 11,
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipSelected: {
      borderColor: '#2563eb',
      backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff',
    },
    chipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.icon,
    },
    chipTextSelected: {
      color: isDark ? '#93c5fd' : '#1d4ed8',
      fontWeight: '700',
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
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 10,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surface,
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
