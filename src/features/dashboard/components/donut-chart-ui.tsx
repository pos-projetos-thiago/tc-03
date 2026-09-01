import { DonutChart } from 'expo-skia-charts';
import type { DonutChartConfig, ProcessedSegment } from 'expo-skia-charts';
import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { formatCurrency } from '@/src/shared/utils/format-currency';

import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';

export const DONUT_CHART_STYLE = {
  strokeWidth: 24,
  gap: 5,
  roundedCorners: true,
  animationDuration: 700,
  hitSlop: 100,
} as const;

interface ChartCenterContentProps {
  value: number;
  label: string;
  accentColor: string;
  isTotal: boolean;
}

function createCenterStyles(colors: ThemeColors) {
  return StyleSheet.create({
    centerContent: {
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
    },
    centerLabel: {
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 0.4,
      textAlign: 'center',
    },
    centerValue: {
      fontSize: 20,
      fontWeight: '600',
      letterSpacing: -0.3,
      textAlign: 'center',
    },
  });
}

export function ChartCenterContent({
  value,
  label,
  accentColor,
  isTotal,
}: ChartCenterContentProps) {
  const colors = useDashboardColors();
  const styles = useMemo(() => createCenterStyles(colors), [colors]);

  return (
    <View key={`${label}-${value}`} style={styles.centerContent}>
      <Text style={styles.centerLabel}>{label}</Text>
      <Text
        style={[
          styles.centerValue,
          { color: isTotal ? colors.text : accentColor },
        ]}
      >
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

interface DashboardDonutChartProps {
  height: number;
  config: DonutChartConfig;
}

function createChartFrameStyles() {
  return StyleSheet.create({
    chartFrame: {
      width: '100%',
    },
    chartGestureRoot: {
      flex: 1,
    },
  });
}

export function DashboardDonutChart({ height, config }: DashboardDonutChartProps) {
  const styles = useMemo(() => createChartFrameStyles(), []);

  return (
    <View style={[styles.chartFrame, { height }]}>
      <GestureHandlerRootView style={styles.chartGestureRoot}>
        <DonutChart config={config} />
      </GestureHandlerRootView>
    </View>
  );
}

function createLegendStyles(colors: ThemeColors) {
  return StyleSheet.create({
    legend: {
      marginTop: 4,
      gap: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    legendSwatch: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendLabel: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
    },
    legendValue: {
      fontSize: 13,
      color: colors.textMuted,
      fontVariant: ['tabular-nums'],
    },
  });
}

export function DonutChartLegend({ segments }: { segments: ProcessedSegment[] }) {
  const colors = useDashboardColors();
  const styles = useMemo(() => createLegendStyles(colors), [colors]);

  return (
    <View style={styles.legend}>
      {segments.map((segment) => (
        <View key={segment.label} style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: segment.color }]} />
          <Text style={styles.legendLabel}>{segment.label}</Text>
          <Text style={styles.legendValue}>
            {Math.round(segment.percentage * 100)}%
          </Text>
        </View>
      ))}
    </View>
  );
}

export function useDonutChartHeight(variant: 'primary' | 'secondary' = 'primary') {
  const { width: windowWidth } = useWindowDimensions();
  const ratio = variant === 'primary' ? 0.62 : 0.56;
  const min = variant === 'primary' ? 240 : 220;
  const max = variant === 'primary' ? 320 : 280;
  return Math.min(Math.max(windowWidth * ratio, min), max);
}

export function createChartSectionStyles(colors: ThemeColors) {
  return StyleSheet.create({
    surface: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 4,
      paddingHorizontal: 16,
      paddingVertical: 20,
      gap: 12,
    },
    description: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    chartWrapper: {
      width: '100%',
    },
    chartFrame: {
      width: '100%',
    },
    chartGestureRoot: {
      flex: 1,
    },
    emptyContainer: {
      paddingVertical: 28,
      paddingHorizontal: 8,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}

export function useChartSectionStyles() {
  const colors = useDashboardColors();
  return useMemo(() => createChartSectionStyles(colors), [colors]);
}
