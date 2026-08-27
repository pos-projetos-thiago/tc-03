import { useColorScheme } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { ByteBankLogo } from './byte-bank-logo';

const BACKGROUND_LIGHT = '#FEFEFE';
const BACKGROUND_DARK = '#121212';

/**
 * Splash screen customizada do Byte Bank.
 *
 * Renderiza o logo SVG centralizado sobre um fundo que respeita
 * automaticamente o tema do sistema (light → #FEFEFE, dark → #121212).
 *
 * Uso: exibir condicionalmente no root layout enquanto os recursos
 * iniciais (fontes, sessão, etc.) ainda estão carregando.
 */
export function AppSplashScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor =
    colorScheme === 'dark' ? BACKGROUND_DARK : BACKGROUND_LIGHT;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ByteBankLogo width={200} height={225} />
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
