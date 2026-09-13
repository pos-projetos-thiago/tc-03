/**
 * Avatar 02 — Cachorro bege/caramelo
 * Surge do canto inferior-direito
 * Fundo: verde-sálvia suave
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';

import type { AvatarProps } from '../avatar-catalog';

export function Avatar02({ size }: AvatarProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width={100} height={100} fill="#B8CCBA" rx={0} />

      {/* Depth */}
      <Ellipse cx={50} cy={106} rx={55} ry={26} fill="#9AB89E" opacity={0.5} />

      {/* ── Body ── */}
      <Ellipse cx={68} cy={90} rx={30} ry={24} fill="#D4A96A" />

      {/* ── Head ── */}
      <Circle cx={58} cy={63} r={26} fill="#E0B878" />

      {/* ── Floppy ears ── */}
      {/* Left ear */}
      <Ellipse cx={36} cy={62} rx={9} ry={18} fill="#C89050" transform="rotate(-10 36 62)" />
      {/* Right ear */}
      <Ellipse cx={80} cy={62} rx={9} ry={18} fill="#C89050" transform="rotate(10 80 62)" />

      {/* ── Muzzle (prominent dog snout) ── */}
      <Ellipse cx={58} cy={72} rx={14} ry={10} fill="#E8C890" />
      {/* Nose */}
      <Ellipse cx={58} cy={67} rx={5} ry={4} fill="#3A3A3A" />
      <Circle cx={56} cy={66} r={1.5} fill="#555555" />

      {/* ── Eyes ── */}
      <Circle cx={48} cy={59} r={5} fill="#3A3A3A" />
      <Circle cx={68} cy={59} r={5} fill="#3A3A3A" />
      {/* Shine */}
      <Circle cx={49.5} cy={57.5} r={1.8} fill="#FFFFFF" />
      <Circle cx={69.5} cy={57.5} r={1.8} fill="#FFFFFF" />

      {/* ── Eyebrows (worried cute) ── */}
      <Path
        d="M44 54 Q48 51 52 54"
        stroke="#A07040"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M64 54 Q68 51 72 54"
        stroke="#A07040"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Mouth ── */}
      <Path
        d="M53 75 Q58 80 63 75"
        stroke="#B07840"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Tongue ── */}
      <Ellipse cx={58} cy={79} rx={5} ry={4} fill="#E87090" />

      {/* ── Paw lower-right ── */}
      <Ellipse cx={90} cy={96} rx={10} ry={7} fill="#D4A96A" />
      <Circle cx={85} cy={93} r={3} fill="#C89050" />
      <Circle cx={90} cy={91} r={3} fill="#C89050" />
      <Circle cx={95} cy={93} r={3} fill="#C89050" />
    </Svg>
  );
}
