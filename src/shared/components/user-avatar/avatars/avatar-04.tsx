/**
 * Avatar 04 — Raposa laranja com orelhas pontudas
 * Surge do canto inferior-direito
 * Fundo: pêssego/terracota suave
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';

import type { AvatarProps } from '../avatar-catalog';

export function Avatar04({ size }: AvatarProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width={100} height={100} fill="#D8B8A0" rx={0} />

      {/* Depth */}
      <Ellipse cx={50} cy={106} rx={55} ry={26} fill="#C0A088" opacity={0.5} />

      {/* ── Body ── */}
      <Ellipse cx={68} cy={90} rx={30} ry={24} fill="#E8783A" />
      {/* Chest white patch */}
      <Ellipse cx={65} cy={90} rx={14} ry={18} fill="#F5E8D8" />

      {/* ── Tail peeking lower-right ── */}
      <Path d="M88 100 Q110 70 95 55 Q85 48 80 60 Q90 68 82 85 Z" fill="#E8783A" />
      {/* Tail tip */}
      <Path d="M92 54 Q85 46 79 58 Q83 52 92 54 Z" fill="#F5E8D8" />

      {/* ── Head ── */}
      <Circle cx={56} cy={62} r={26} fill="#E8783A" />

      {/* ── Pointy ears ── */}
      {/* Left ear */}
      <Path d="M34 46 L26 20 L48 38 Z" fill="#E8783A" />
      <Path d="M35 44 L29 24 L46 37 Z" fill="#D05A1E" />
      {/* Right ear */}
      <Path d="M70 42 L78 16 L84 38 Z" fill="#E8783A" />
      <Path d="M71 41 L77 20 L82 37 Z" fill="#D05A1E" />

      {/* ── Face mask (white muzzle zone) ── */}
      <Ellipse cx={56} cy={70} rx={14} ry={11} fill="#F5E8D8" />
      {/* Nose */}
      <Ellipse cx={56} cy={65} rx={4} ry={3} fill="#3A3A3A" />
      <Circle cx={54.5} cy={64} r={1.2} fill="#555" />
      {/* Mouth */}
      <Path
        d="M52 72 Q56 77 60 72"
        stroke="#C06030"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Eyes ── */}
      <Ellipse cx={46} cy={58} rx={5} ry={5.5} fill="#2A2A2A" />
      <Ellipse cx={66} cy={58} rx={5} ry={5.5} fill="#2A2A2A" />
      <Circle cx={47.5} cy={56} r={2} fill="#FFFFFF" />
      <Circle cx={67.5} cy={56} r={2} fill="#FFFFFF" />

      {/* ── Cheek blush ── */}
      <Ellipse cx={38} cy={68} rx={6} ry={4} fill="#E87050" opacity={0.4} />
      <Ellipse cx={74} cy={68} rx={6} ry={4} fill="#E87050" opacity={0.4} />
    </Svg>
  );
}
