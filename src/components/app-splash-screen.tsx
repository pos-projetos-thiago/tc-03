import { Image, StyleSheet, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';

const LOGO_WIDTH = 200;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 395) / 373);
const logoUri = Image.resolveAssetSource(require('@/assets/images/logo.svg')).uri;

/**
 * Splash screen customizada do Byte Bank.
 *
 * Renderiza o logo SVG centralizado sobre um fundo que respeita
 * automaticamente o tema do sistema (light → #FEFEFE, dark → #1E1E1E).
 *
 * Uso: exibir condicionalmente no root layout enquanto os recursos
 * iniciais (fontes, sessão, etc.) ainda estão carregando.
 */
export function AppSplashScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = Colors[colorScheme].background;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SvgUri uri={logoUri} width={LOGO_WIDTH} height={LOGO_HEIGHT} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
