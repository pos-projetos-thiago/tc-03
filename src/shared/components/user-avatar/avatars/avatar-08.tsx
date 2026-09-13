/**
 * Avatar 08 — Coruja bege/caramelo com olhos grandes
 * Surge do canto inferior-direito
 * Fundo: roxo-lavanda suave
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';

import type { AvatarProps } from '../avatar-catalog';

export function Avatar08({ size }: AvatarProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width={100} height={100} fill="#B8A8CC" rx={0} />

      {/* Depth */}
      <Ellipse cx={50} cy={106} rx={55} ry={26} fill="#9A88B4" opacity={0.45} />

      {/* ── Body (pear-shaped) ── */}
      <Ellipse cx={64} cy={90} rx={26} ry={22} fill="#C8A870" />
      {/* Wing left */}
      <Ellipse cx={44} cy={88} rx={12} ry={18} fill="#A88850" transform="rotate(-15 44 88)" />
      {/* Wing right */}
      <Ellipse cx={82} cy={86} rx={12} ry={18} fill="#A88850" transform="rotate(15 82 86)" />
      {/* Belly feathers */}
      <Ellipse cx={64} cy={90} rx={14} ry={16} fill="#E8D8A8" />

      {/* ── Ear tufts ── */}
      <Path d="M42 40 L36 18 L52 36 Z" fill="#C8A870" />
      <Path d="M68 38 L72 16 L80 36 Z" fill="#C8A870" />

      {/* ── Head (round) ── */}
      <Circle cx={58} cy={58} r={27} fill="#C8A870" />
      {/* Facial disc */}
      <Ellipse cx={58} cy={60} rx={22} ry={20} fill="#E8D8A8" />

      {/* ── Big eyes (owls have huge eyes) ── */}
      {/* Eye rings */}
      <Circle cx={46} cy={57} r={11} fill="#A88850" />
      <Circle cx={70} cy={57} r={11} fill="#A88850" />
      {/* Sclerae */}
      <Circle cx={46} cy={57} r={9} fill="#F8F0D8" />
      <Circle cx={70} cy={57} r={9} fill="#F8F0D8" />
      {/* Irises */}
      <Circle cx={46} cy={57} r={6} fill="#D4A020" />
      <Circle cx={70} cy={57} r={6} fill="#D4A020" />
      {/* Pupils */}
      <Circle cx={46} cy={57} r={3.5} fill="#1A1A1A" />
      <Circle cx={70} cy={57} r={3.5} fill="#1A1A1A" />
      {/* Shine */}
      <Circle cx={47.5} cy={55.2} r={1.5} fill="#FFFFFF" />
      <Circle cx={71.5} cy={55.2} r={1.5} fill="#FFFFFF" />

      {/* ── Beak ── */}
      <Path d="M54 68 L58 75 L62 68 Z" fill="#E09030" />

      {/* ── Cheek blush ── */}
      <Ellipse cx={33} cy={65} rx={6} ry={4} fill="#E8B880" opacity={0.5} />
      <Ellipse cx={83} cy={65} rx={6} ry={4} fill="#E8B880" opacity={0.5} />

      {/* ── Talons lower-right ── */}
      <Ellipse cx={88} cy={97} rx={11} ry={6} fill="#C8A870" />
      <Path d="M80 96 L78 102" stroke="#A88850" strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M85 94 L83 101" stroke="#A88850" strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M90 94 L90 101" stroke="#A88850" strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M95 95 L97 101" stroke="#A88850" strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}
