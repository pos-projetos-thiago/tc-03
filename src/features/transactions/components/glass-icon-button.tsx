import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface GlassIconButtonProps {
  icon: IoniconName;
  onPress: () => void;
  accessibilityLabel: string;
  colors: ThemeColors;
  isDark: boolean;
  isActive?: boolean;
  disabled?: boolean;
}

const BUTTON_SIZE = 44;
const ICON_SIZE = 19;

export function GlassIconButton({
  icon,
  onPress,
  accessibilityLabel,
  colors,
  isDark,
  isActive = false,
  disabled = false,
}: GlassIconButtonProps) {
  const baseBackground = isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 186, 125, 0.05)';

  const pressedBackground = isDark
    ? 'rgba(255, 255, 255, 0.09)'
    : 'rgba(0, 186, 125, 0.10)';

  const borderColor = isActive
    ? 'rgba(0, 186, 125, 0.38)'
    : isDark
      ? 'rgba(255, 255, 255, 0.10)'
      : 'rgba(0, 186, 125, 0.14)';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        isDark ? styles.shadowDark : styles.shadowLight,
        {
          backgroundColor: pressed && !disabled ? pressedBackground : baseBackground,
          borderColor,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Ionicons name={icon} size={ICON_SIZE} color={colors.tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowLight: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  shadowDark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 1,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
