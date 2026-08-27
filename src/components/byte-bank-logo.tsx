import Svg, { Path, Text } from 'react-native-svg';

interface ByteBankLogoProps {
  width?: number;
  height?: number;
}

/**
 * Logo do Byte Bank em SVG.
 *
 * Ícone X formado por dois paralelogramos diagonais cruzados +
 * texto "BYTE BANK" em negrito — fiel à imagem original.
 * Cor fixa: #00C48C. Fundo: transparente (definido pelo container).
 */
export function ByteBankLogo({ width = 220, height = 240 }: ByteBankLogoProps) {
  // ── Geometria do ícone X ──────────────────────────────────────────────────
  // ViewBox: 375 × 420
  //   • X ocupa y = 0 .. 300  (área 375×300, quadrado quase perfeito)
  //   • Espaço entre ícone e texto: 20px  (y = 300 .. 320)
  //   • Texto baseline em y = 390, altura aprox 70px  (y = 320 .. 410)
  //
  // O X é formado por dois paralelogramos (retângulos rodados 45°):
  //   barW = 107  →  half = 53.5
  //   Barra ↘:  (half,0) → (W,H-half) → (W-half,H) → (0,half)
  //   Barra ↗:  (0,H-half) → (half,H) → (W,half) → (W-half,0)

  const W = 375;
  const H = 300;
  const half = 53.5;

  const bar1 = `M ${half} 0 L ${W} ${H - half} L ${W - half} ${H} L 0 ${half} Z`;
  const bar2 = `M 0 ${H - half} L ${half} ${H} L ${W} ${half} L ${W - half} 0 Z`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 375 420"
      fill="none"
      accessibilityLabel="Byte Bank"
      accessibilityRole="image"
    >
      {/* Ícone X */}
      <Path d={bar1} fill="#00C48C" />
      <Path d={bar2} fill="#00C48C" />

      {/* Texto "BYTE BANK" centralizado abaixo do ícone */}
      <Text
        x={W / 2}
        y={395}
        textAnchor="middle"
        fontSize={58}
        fontWeight="bold"
        fill="#00C48C"
        letterSpacing={3}
      >
        BYTE BANK
      </Text>
    </Svg>
  );
}
