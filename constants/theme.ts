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
background: '#FEFEFE',
tint: brandPrimary,
icon: '#687076',
tabIconDefault: '#687076',
tabIconSelected: brandPrimary,
surface: '#FFFFFF',
textSecondary: '#52525B',
textMuted: '#A1A1AA',
border: '#E4E4E7',
divider: '#F4F4F5',
accent: brandPrimary,
income: brandPrimary,
expense: '#A855F7',
investment: '#6366F1',
category: '#EC4899',
positive: brandPrimary,
negative: '#A855F7',
},

dark: {
text: '#F5F5F5',
background: '#111111',
tint: brandPrimary,
icon: '#9BA1A6',
tabIconDefault: '#9BA1A6',
tabIconSelected: brandPrimary,
surface: '#1A1A1A',
textSecondary: '#A1A1AA',
textMuted: '#71717A',
border: '#333333',
divider: '#262626',
accent: brandPrimary,
income: brandPrimary,
expense: '#A855F7',
investment: '#6366F1',
category: '#EC4899',
positive: brandPrimary,
negative: '#A855F7',
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