import type { ProcessedSegment } from 'expo-skia-charts';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useDashboardColors } from './dashboard-palette';
import {
  ChartCenterContent,
  DashboardDonutChart,
  DONUT_CHART_STYLE,
  DonutChartLegend,
  useChartSectionStyles,
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

export function MonthlyMovementChart({
  totalIncome,
  totalExpense,
  totalInvested,
}: MonthlyMovementChartProps) {
  const colors = useDashboardColors();
  const chartSectionStyles = useChartSectionStyles();
  const chartHeight = useDonutChartHeight('primary');

  const colorByLabel = useMemo(
    () => ({
      Depósitos: colors.income,
      Saques: colors.expense,
      Investimentos: colors.investment,
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
        (item) => colorByLabel[item.label as keyof typeof colorByLabel] ?? colors.accent,
      ),
    [chartData, colorByLabel, colors.accent],
  );

  if (chartData.length === 0) {
    return (
      <View style={chartSectionStyles.surface}>
        <Text style={chartSectionStyles.description}>
          Como seu dinheiro se movimentou neste período.
        </Text>
        <View style={chartSectionStyles.emptyContainer}>
          <Text style={chartSectionStyles.emptyTitle}>Sem movimentação neste mês</Text>
          <Text style={chartSectionStyles.emptyDescription}>
            Registre depósitos, saques ou investimentos para visualizar a distribuição.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={chartSectionStyles.surface}>
      <Text style={chartSectionStyles.description}>
        Como seu dinheiro se movimentou neste período.
      </Text>
      <DashboardDonutChart
        height={chartHeight}
        config={{
          data: chartData,
          colors: chartColors,
          strokeWidth: DONUT_CHART_STYLE.strokeWidth,
          gap: DONUT_CHART_STYLE.gap,
          roundedCorners: DONUT_CHART_STYLE.roundedCorners,
          animationDuration: DONUT_CHART_STYLE.animationDuration,
          legend: {
            enabled: true,
            renderContent: (segments: ProcessedSegment[]) => (
              <DonutChartLegend segments={segments} />
            ),
          },
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
                label: 'Total movimentado',
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
    </View>
  );
}
