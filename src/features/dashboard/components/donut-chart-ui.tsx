import type { ProcessedSegment } from 'expo-skia-charts';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { formatCurrency } from '@/src/shared/utils/format-currency';

import { DashboardPalette } from './dashboard-palette';

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

export function ChartCenterContent({
  value,
  label,
  accentColor,
  isTotal,
}: ChartCenterContentProps) {
  return (
    <Animated.View
      key={`${label}-${value}`}
      entering={FadeIn.duration(180)}
      style={styles.centerContent}
    >
      <Text style={styles.centerLabel}>{label}</Text>
      <Text
        style={[
          styles.centerValue,
          { color: isTotal ? DashboardPalette.textPrimary : accentColor },
        ]}
      >
        {formatCurrency(value)}
      </Text>
    </Animated.View>
  );
}

export function DonutChartLegend({ segments }: { segments: ProcessedSegment[] }) {
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

export const chartSectionStyles = StyleSheet.create({
  surface: {
    backgroundColor: DashboardPalette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DashboardPalette.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  description: {
    fontSize: 13,
    color: DashboardPalette.textMuted,
    lineHeight: 18,
  },
  chartWrapper: {
    width: '100%',
  },
  emptyContainer: {
    paddingVertical: 28,
    paddingHorizontal: 8,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: DashboardPalette.textSecondary,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    color: DashboardPalette.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

const styles = StyleSheet.create({
  centerContent: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  centerLabel: {
    fontSize: 11,
    color: DashboardPalette.textMuted,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  centerValue: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
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
    color: DashboardPalette.textSecondary,
  },
  legendValue: {
    fontSize: 13,
    color: DashboardPalette.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
