import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'large';
}

export function LoadingSpinner({ fullScreen = false, size = 'large' }: LoadingSpinnerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const color = Colors[colorScheme].tint;

  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
