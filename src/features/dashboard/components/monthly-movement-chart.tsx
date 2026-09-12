import type { ProcessedSegment } from 'expo-skia-charts';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';
import {
  ChartCenterContent,
  DashboardDonutChart,
  DONUT_CHART_STYLE,
  DonutChartLegend,
  useDonutChartHeight,
} from './donut-chart-ui';

interface MonthlyMovementChartProps {
  totalIncome: number;
  totalExpense: number;
  totalInvested: number;
}

function buildChartData(
  totalIncome: number,
  totalExpense: number,
  totalInvested: number,
) {
  return [
    { label: 'Depósitos', value: totalIncome },
    { label: 'Saques', value: totalExpense },
    { label: 'Investimentos', value: totalInvested },
  ].filter((item) => item.value > 0);
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    emptyContainer: {
      paddingVertical: 40,
      alignItems: 'center',
      gap: 6,
    },
    emptyTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    emptyDescription: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 8,
    },
  });
}

export function MonthlyMovementChart({
  totalIncome,
  totalExpense,
  totalInvested,
}: MonthlyMovementChartProps) {
  const colors = useDashboardColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const chartHeight = useDonutChartHeight('primary');

  const colorByLabel = useMemo(
    () => ({
      Depósitos: colors.income,       // verde marca — positivo, principal
      Saques: colors.expense,         // vermelho — negativo, semântico
      Investimentos: '#007A57',       // verde escuro — neutra dentro da família verde
    }),
    [colors],
  );

  const chartData = useMemo(
    () => buildChartData(totalIncome, totalExpense, totalInvested),
    [totalIncome, totalExpense, totalInvested],
  );

  const chartColors = useMemo(
    () =>
      chartData.map(
        (item) =>
          colorByLabel[item.label as keyof typeof colorByLabel] ?? colors.accent,
      ),
    [chartData, colorByLabel, colors.accent],
  );

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Sem movimentação neste mês</Text>
        <Text style={styles.emptyDescription}>
          Registre depósitos, saques ou investimentos para visualizar a distribuição.
        </Text>
      </View>
    );
  }

  return (
    <DashboardDonutChart
      height={chartHeight}
      legend={
        <DonutChartLegend
          segments={chartData.map((item, index) => ({
            ...item,
            percentage: item.value / chartData.reduce((s, d) => s + d.value, 0),
            startAngle: 0,
            sweepAngle: 0,
            color: chartColors[index] ?? colors.accent,
            index,
          }))}
        />
      }
      config={{
        data: chartData,
        colors: chartColors,
        strokeWidth: DONUT_CHART_STYLE.strokeWidth,
        gap: DONUT_CHART_STYLE.gap,
        roundedCorners: DONUT_CHART_STYLE.roundedCorners,
        animationDuration: DONUT_CHART_STYLE.animationDuration,
        // Legend disabled inside the chart — rendered externally via the
        // `legend` prop on DashboardDonutChart so it doesn't shrink the ring.
        legend: { enabled: false },
        hover: {
          enabled: true,
          animateOnHover: true,
          hitSlop: DONUT_CHART_STYLE.hitSlop,
        },
        centerValues: {
          enabled: true,
          renderContent: (
            _segments: ProcessedSegment[],
            total: number,
            hoveredSegment: ProcessedSegment | null,
          ) => {
            const { value, label, color } = hoveredSegment ?? {
              value: total,
              label: 'Total',
              color: colors.text,
            };
            return (
              <ChartCenterContent
                value={value}
                label={label}
                accentColor={color}
                isTotal={!hoveredSegment}
              />
            );
          },
        },
      }}
    />
  );
}
