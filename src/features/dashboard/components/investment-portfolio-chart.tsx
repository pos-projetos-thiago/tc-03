import { DonutChart } from 'expo-skia-charts';
import type { ProcessedSegment } from 'expo-skia-charts';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { INVESTMENT_CATEGORIES } from '@/src/features/transactions/types/transaction-investment-categories';

import type { CategoryBreakdown } from '../types/dashboard-summary';
import { DashboardPalette } from './dashboard-palette';
import {
  ChartCenterContent,
  DONUT_CHART_STYLE,
  DonutChartLegend,
  chartSectionStyles,
  useDonutChartHeight,
} from './donut-chart-ui';

const PORTFOLIO_COLORS = [
  DashboardPalette.income,
  DashboardPalette.expense,
  DashboardPalette.investment,
  DashboardPalette.category,
] as const;

const COLOR_BY_CATEGORY = Object.fromEntries(
  INVESTMENT_CATEGORIES.map((category, index) => [
    category,
    PORTFOLIO_COLORS[index] ?? DashboardPalette.accent,
  ]),
) as Record<string, string>;

interface InvestmentPortfolioChartProps {
  data: CategoryBreakdown[];
}

export function InvestmentPortfolioChart({ data }: InvestmentPortfolioChartProps) {
  const chartHeight = useDonutChartHeight('secondary');

  const chartData = useMemo(
    () =>
      data
        .filter((item) => item.total > 0)
        .map((item) => ({
          label: item.category,
          value: item.total,
        })),
    [data],
  );

  const chartColors = useMemo(
    () =>
      chartData.map(
        (item) => COLOR_BY_CATEGORY[item.label] ?? DashboardPalette.accent,
      ),
    [chartData],
  );

  if (chartData.length === 0) {
    return (
      <View style={chartSectionStyles.surface}>
        <Text style={chartSectionStyles.description}>
          Como seus investimentos estão distribuídos entre os tipos da carteira.
        </Text>
        <View style={chartSectionStyles.emptyContainer}>
          <Text style={chartSectionStyles.emptyTitle}>
            Nenhum investimento neste mês
          </Text>
          <Text style={chartSectionStyles.emptyDescription}>
            Registre investimentos para visualizar a distribuição da carteira.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={chartSectionStyles.surface}>
      <Text style={chartSectionStyles.description}>
        Como seus investimentos estão distribuídos entre os tipos da carteira.
      </Text>
      <View style={[chartSectionStyles.chartWrapper, { height: chartHeight }]}>
        <DonutChart
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
                  label: 'Investimentos',
                  color: DashboardPalette.textPrimary,
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
    </View>
  );
}
