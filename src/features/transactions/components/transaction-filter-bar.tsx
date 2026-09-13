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

const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer',
  'Saúde',
  'Outros',
] as const;

// Estilos estáticos declarados fora do componente para evitar recriação a cada render.
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

interface TransactionFilterBarProps {
  filter: TransactionFilter;
  onApply: (filter: TransactionFilter) => void;
  onClear: () => void;
}

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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  function handleTypeChange(type: TransactionType | null) {
    if (type !== localType) {
      setLocalCategory('');
      setCategoryDropdownOpen(false);
    }
    setLocalType(type);
  }

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
  const s = useMemo(() => makeStyles(colors), [colors]);
  const surface = colors.surface;

  return (
    <View style={s.container}>
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
          <View style={s.segmentDivider} />
          <Pressable
            style={[s.segment, localType === 'income' && s.segmentSelected]}
            onPress={() => handleTypeChange(localType === 'income' ? null : 'income')}
            accessibilityRole="button"
            accessibilityLabel="Receita"
            accessibilityState={{ selected: localType === 'income' }}>
            <Text style={[s.segmentText, localType === 'income' && s.segmentTextSelected]}>
              Receita
            </Text>
          </Pressable>
          <View style={s.segmentDivider} />
          <Pressable
            style={[s.segment, localType === 'expense' && s.segmentSelected]}
            onPress={() => handleTypeChange(localType === 'expense' ? null : 'expense')}
            accessibilityRole="button"
            accessibilityLabel="Despesa"
            accessibilityState={{ selected: localType === 'expense' }}>
            <Text style={[s.segmentText, localType === 'expense' && s.segmentTextSelected]}>
              Despesa
            </Text>
          </Pressable>
          <View style={s.segmentDivider} />
          <Pressable
            style={[s.segment, localType === 'investment' && s.segmentSelected]}
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
              Invest.
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={s.fieldWrapper}>
        <Text style={s.label}>Categoria</Text>

        {localType === 'investment' ? (
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
          <DropdownSelect
            options={categoryOptions}
            value={localCategory}
            placeholder="Filtrar por categoria"
            open={categoryDropdownOpen}
            colors={colors}
            surface={surface}
            onToggle={() => setCategoryDropdownOpen((prev) => !prev)}
            onChange={(val) => {
              setLocalCategory(localCategory === val ? '' : val);
              setCategoryDropdownOpen(false);
            }}
          />
        )}
      </View>

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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 14,
    },
    fieldWrapper: {
      gap: 6,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
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
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    segmentSelected: {
      backgroundColor: colors.tint,
    },
    segmentDivider: {
      width: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    segmentText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textMuted,
    },
    segmentTextSelected: {
      color: '#ffffff',
      fontWeight: '600',
    },
    chipsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 2,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipSelected: {
      borderColor: colors.tint,
      backgroundColor: colors.tint + '15',
    },
    chipText: {
      fontSize: 13,
      fontWeight: '400',
      color: colors.textSecondary,
    },
    chipTextSelected: {
      color: colors.tint,
      fontWeight: '600',
    },
    dateRow: {
      flexDirection: 'row',
      gap: 8,
    },
    inputHalf: {
      flex: 1,
      height: 40,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 6,
      paddingHorizontal: 10,
      fontSize: 14,
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
    actions: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    btnApply: {
      paddingHorizontal: 20,
      paddingVertical: 9,
      borderRadius: 6,
    },
    btnApplyText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    btnClear: {
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    btnClearText: {
      fontSize: 13,
      fontWeight: '500',
    },
  });
}
