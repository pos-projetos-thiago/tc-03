import type { ProcessedSegment } from 'expo-skia-charts';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { INVESTMENT_CATEGORIES } from '@/src/features/transactions/types/transaction-investment-categories';

import type { CategoryBreakdown } from '../types/dashboard-summary';
import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';
import {
  ChartCenterContent,
  DashboardDonutChart,
  DONUT_CHART_STYLE,
  DonutChartLegend,
  useDonutChartHeight,
} from './donut-chart-ui';

interface InvestmentPortfolioChartProps {
  data: CategoryBreakdown[];
}

/**
 * Paleta da carteira: 4 tons da família verde com contraste máximo entre si.
 * Estratégia: escala de luminosidade bem distribuída, com saltos amplos.
 *
 * Light:
 *   [0] #00BA7D — verde marca (médio, referência)
 *   [1] #003D29 — verde muito escuro (âncora escura, quase preto-verde)
 *   [2] #7DDFC0 — verde claro/menta (luminoso, alto contraste com os escuros)
 *   [3] #006644 — verde médio-escuro (ponto intermediário bem separado dos outros)
 *
 * Dark (ajustados para contraste no fundo #0F0F0F):
 *   [0] #00BA7D
 *   [1] #00E8A0 — verde muito claro/neon (âncora clara no escuro)
 *   [2] #004D34 — verde muito escuro
 *   [3] #33C496 — verde médio-claro
 */
const PORTFOLIO_COLORS_LIGHT = [
  '#00BA7D',
  '#003D29',
  '#7DDFC0',
  '#006644',
] as const;

const PORTFOLIO_COLORS_DARK = [
  '#00BA7D',
  '#00E8A0',
  '#004D34',
  '#33C496',
] as const;

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

export function InvestmentPortfolioChart({ data }: InvestmentPortfolioChartProps) {
  const colors = useDashboardColors();
  const isDark = colors.background === '#0F0F0F';
  const styles = useMemo(() => createStyles(colors), [colors]);
  const chartHeight = useDonutChartHeight('secondary');

  // Paleta de tons de verde — identidade coesa, sem cores heterogêneas
  const portfolioColors = isDark ? PORTFOLIO_COLORS_DARK : PORTFOLIO_COLORS_LIGHT;

  const colorByCategory = useMemo(
    () =>
      Object.fromEntries(
        INVESTMENT_CATEGORIES.map((category, index) => [
          category,
          portfolioColors[index % portfolioColors.length],
        ]),
      ) as Record<string, string>,
    [portfolioColors],
  );

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
        (item) => colorByCategory[item.label] ?? portfolioColors[0],
      ),
    [chartData, colorByCategory, portfolioColors],
  );

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhum investimento neste mês</Text>
        <Text style={styles.emptyDescription}>
          Registre investimentos para visualizar a distribuição da carteira.
        </Text>
      </View>
    );
  }

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <DashboardDonutChart
      height={chartHeight}
      legend={
        <DonutChartLegend
          segments={chartData.map((item, index) => ({
            ...item,
            percentage: total > 0 ? item.value / total : 0,
            startAngle: 0,
            sweepAngle: 0,
            color: chartColors[index] ?? portfolioColors[0],
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
              label: 'Carteira',
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
