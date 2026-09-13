import { DonutChart } from 'expo-skia-charts';
import type { DonutChartConfig, ProcessedSegment } from 'expo-skia-charts';
import React, { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { formatCurrency } from '@/src/shared/utils/format-currency';

import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';

export const DONUT_CHART_STYLE = {
  strokeWidth: 22,
  gap: 4,
  roundedCorners: true,
  animationDuration: 600,
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
      gap: 3,
      paddingHorizontal: 10,
    },
    centerLabel: {
      fontSize: 11,
      color: colors.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    centerValue: {
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: -0.4,
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
  /**
   * Legend rendered below the ring, outside the fixed-height canvas container.
   * expo-skia-charts v0.5.0 computes canvasHeight = totalHeight - legendHeight,
   * so keeping the legend external ensures the ring always fills the full height.
   */
  legend?: React.ReactNode;
}

export function DashboardDonutChart({ height, config, legend }: DashboardDonutChartProps) {
  return (
    <View style={{ width: '100%' }}>
      <View style={{ width: '100%', height }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <DonutChart config={config} />
        </GestureHandlerRootView>
      </View>
      {legend ?? null}
    </View>
  );
}

function createLegendStyles(colors: ThemeColors) {
  return StyleSheet.create({
    legend: {
      marginTop: 12,
      gap: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    legendSwatch: {
      width: 12,
      height: 2,
      borderRadius: 1,
    },
    legendLabel: {
      flex: 1,
      fontSize: 12,
      color: colors.textSecondary,
      letterSpacing: 0.1,
    },
    legendValue: {
      fontSize: 12,
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

export function useDonutChartHeight(_variant: 'primary' | 'secondary' = 'primary') {
  const { width: windowWidth } = useWindowDimensions();
  return Math.min(Math.max(windowWidth * 0.62, 240), 310);
}
