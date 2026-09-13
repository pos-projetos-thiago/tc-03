/**

Below are the colors that are used in the app. The colors are defined in the light and dark mode.
There are many other ways to style your app. For example, Nativewind
, Tamagui
, unistyles
, etc.
*/

import { Platform } from 'react-native';

const brandPrimary = '#00BA7D';

export const Colors = {
  light: {
    text: '#111111',
    background: '#F8F8F7',
    tint: brandPrimary,
    icon: '#71717A',
    tabIconDefault: '#71717A',
    tabIconSelected: brandPrimary,
    surface: '#FFFFFF',
    textSecondary: '#52525B',
    textMuted: '#A1A1AA',
    border: '#E4E4E7',
    divider: '#F0F0EF',
    accent: brandPrimary,
    income: brandPrimary,
    expense: '#E05252',
    investment: '#4B7BEC',
    category: '#F0A500',
    positive: brandPrimary,
    negative: '#E05252',
  },

  dark: {
    text: '#F0F0EF',
    background: '#0F0F0F',
    tint: brandPrimary,
    icon: '#71717A',
    tabIconDefault: '#71717A',
    tabIconSelected: brandPrimary,
    surface: '#171717',
    textSecondary: '#A1A1AA',
    textMuted: '#6B6B6B',
    border: '#2A2A2A',
    divider: '#1F1F1F',
    accent: brandPrimary,
    income: brandPrimary,
    expense: '#E05252',
    investment: '#4B7BEC',
    category: '#F0A500',
    positive: brandPrimary,
    negative: '#E05252',
  },
} as const;

export type ThemeColorScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeColorScheme];

export const Fonts = Platform.select({
ios: {
/** iOS UIFontDescriptorSystemDesignDefault /
sans: 'system-ui',
/* iOS UIFontDescriptorSystemDesignSerif /
serif: 'ui-serif',
/* iOS UIFontDescriptorSystemDesignRounded /
rounded: 'ui-rounded',
/* iOS UIFontDescriptorSystemDesignMonospaced */
mono: 'ui-monospace',
},
default: {
sans: 'normal',
serif: 'serif',
rounded: 'normal',
mono: 'monospace',
},
web: {
sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
serif: "Georgia, 'Times New Roman', serif",
rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
},
});