import { Colors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';

export type { ThemeColors };

export function useDashboardColors(): ThemeColors {
  const colorScheme = useColorScheme() ?? 'light';
  return Colors[colorScheme];
}
