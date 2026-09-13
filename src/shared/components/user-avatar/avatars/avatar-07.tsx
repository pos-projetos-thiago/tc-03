/**
 * Avatar 07 — Sapo verde com sorriso largo
 * Surge do canto inferior-esquerdo
 * Fundo: verde-floresta suave
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';

import type { AvatarProps } from '../avatar-catalog';

export function Avatar07({ size }: AvatarProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width={100} height={100} fill="#8BBF9A" rx={0} />

      {/* Depth */}
      <Ellipse cx={50} cy={106} rx={55} ry={26} fill="#6A9E7A" opacity={0.5} />

      {/* ── Body ── */}
      <Ellipse cx={33} cy={94} rx={28} ry={20} fill="#5AAA6A" />
      {/* Belly */}
      <Ellipse cx={33} cy={94} rx={16} ry={14} fill="#A8DCA0" />

      {/* ── Head (wide frog shape) ── */}
      <Ellipse cx={44} cy={63} rx={30} ry={24} fill="#5AAA6A" />

      {/* ── Eyes on top of head (protruding) ── */}
      {/* Eye bumps */}
      <Circle cx={30} cy={43} r={12} fill="#5AAA6A" />
      <Circle cx={58} cy={41} r={12} fill="#5AAA6A" />
      {/* Eyeballs */}
      <Circle cx={30} cy={43} r={8} fill="#F5F0D0" />
      <Circle cx={58} cy={41} r={8} fill="#F5F0D0" />
      {/* Pupils */}
      <Ellipse cx={30} cy={44} rx={4.5} ry={5} fill="#1A1A1A" />
      <Ellipse cx={58} cy={42} rx={4.5} ry={5} fill="#1A1A1A" />
      {/* Shine */}
      <Circle cx={31.5} cy={42} r={1.8} fill="#FFFFFF" />
      <Circle cx={59.5} cy={40} r={1.8} fill="#FFFFFF" />

      {/* ── Wide smile ── */}
      <Path
        d="M22 70 Q44 85 66 70"
        stroke="#3A8A4A"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      {/* Teeth */}
      <Path d="M31 73 Q44 82 57 73 L57 78 Q44 88 31 78 Z" fill="#FFFFFF" />

      {/* ── Nostrils ── */}
      <Ellipse cx={38} cy={64} rx={3} ry={2} fill="#3A8A4A" />
      <Ellipse cx={50} cy={63} rx={3} ry={2} fill="#3A8A4A" />

      {/* ── Cheeks ── */}
      <Ellipse cx={18} cy={67} rx={7} ry={5} fill="#80C880" opacity={0.5} />
      <Ellipse cx={70} cy={66} rx={7} ry={5} fill="#80C880" opacity={0.5} />

      {/* ── Paw lower-left ── */}
      <Ellipse cx={10} cy={98} rx={11} ry={6} fill="#5AAA6A" />
      <Circle cx={4} cy={95} r={3.5} fill="#4A9A5A" />
      <Circle cx={9} cy={93} r={3.5} fill="#4A9A5A" />
      <Circle cx={14} cy={93} r={3.5} fill="#4A9A5A" />
      <Circle cx={19} cy={95} r={3} fill="#4A9A5A" />
    </Svg>
  );
}
