import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Wrapper sobre o useColorScheme do React Native que normaliza o retorno
 * para 'light' | 'dark', tratando null e 'unspecified' (introduzido no
 * React Native 0.86 / Expo SDK 57) como 'light'.
 */
export function useColorScheme(): 'light' | 'dark' {
  const scheme = useRNColorScheme();
  if (scheme === 'dark') return 'dark';
  return 'light';
}
