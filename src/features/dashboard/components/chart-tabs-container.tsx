import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { CategoryBreakdown } from '../types/dashboard-summary';
import type { ThemeColors } from './dashboard-palette';
import { useDashboardColors } from './dashboard-palette';
import { InvestmentPortfolioChart } from './investment-portfolio-chart';
import { MonthlyMovementChart } from './monthly-movement-chart';

type TabId = 'movements' | 'portfolio';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'movements', label: 'Movimentações' },
  { id: 'portfolio', label: 'Investimentos' },
];

interface ChartTabsContainerProps {
  totalIncome: number;
  totalExpense: number;
  totalInvested: number;
  investmentsByCategory: CategoryBreakdown[];
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    tabBar: {
      flexDirection: 'row',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: {
      fontSize: 13,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 16,
      right: 16,
      height: 2,
      borderRadius: 1,
    },
    chartArea: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },
  });
}

export function ChartTabsContainer({
  totalIncome,
  totalExpense,
  totalInvested,
  investmentsByCategory,
}: ChartTabsContainerProps) {
  const colors = useDashboardColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<TabId>('movements');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchTab = useCallback(
    (id: TabId) => {
      if (id === activeTab) return;

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => setActiveTab(id), 110);
    },
    [activeTab, fadeAnim],
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => switchTab(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.text : colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
              {isActive ? (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: colors.accent },
                  ]}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.View style={[styles.chartArea, { opacity: fadeAnim }]}>
        {activeTab === 'movements' ? (
          <MonthlyMovementChart
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalInvested={totalInvested}
          />
        ) : (
          <InvestmentPortfolioChart data={investmentsByCategory} />
        )}
      </Animated.View>
    </View>
  );
}
