/**
 * Avatar 06 — Panda preto e branco
 * Surge do canto inferior-direito
 * Fundo: verde-menta suave
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';

import type { AvatarProps } from '../avatar-catalog';

export function Avatar06({ size }: AvatarProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width={100} height={100} fill="#A8CCB8" rx={0} />

      {/* Depth */}
      <Ellipse cx={50} cy={106} rx={55} ry={26} fill="#88B498" opacity={0.45} />

      {/* ── Body (white) ── */}
      <Ellipse cx={65} cy={92} rx={30} ry={24} fill="#F0F0F0" />
      {/* Body black patches on sides */}
      <Ellipse cx={40} cy={92} rx={12} ry={20} fill="#2A2A2A" />
      <Ellipse cx={90} cy={92} rx={12} ry={20} fill="#2A2A2A" />

      {/* ── Round ears (black) ── */}
      <Circle cx={40} cy={36} r={13} fill="#2A2A2A" />
      <Circle cx={68} cy={34} r={13} fill="#2A2A2A" />

      {/* ── Head (white, big) ── */}
      <Circle cx={54} cy={62} r={28} fill="#F0F0F0" />

      {/* ── Eye patches (black) ── */}
      <Ellipse cx={43} cy={59} rx={9} ry={10} fill="#2A2A2A" transform="rotate(-10 43 59)" />
      <Ellipse cx={65} cy={59} rx={9} ry={10} fill="#2A2A2A" transform="rotate(10 65 59)" />

      {/* ── Eyes (white inside patch) ── */}
      <Circle cx={43} cy={59} r={5} fill="#FFFFFF" />
      <Circle cx={65} cy={59} r={5} fill="#FFFFFF" />
      {/* Pupils */}
      <Circle cx={43} cy={60} r={3.5} fill="#1A1A1A" />
      <Circle cx={65} cy={60} r={3.5} fill="#1A1A1A" />
      {/* Shine */}
      <Circle cx={44.2} cy={58.5} r={1.4} fill="#FFFFFF" />
      <Circle cx={66.2} cy={58.5} r={1.4} fill="#FFFFFF" />

      {/* ── Muzzle ── */}
      <Ellipse cx={54} cy={71} rx={12} ry={9} fill="#F5F5F5" />
      {/* Nose */}
      <Ellipse cx={54} cy={67} rx={4} ry={3} fill="#3A3A3A" />
      {/* Mouth */}
      <Path
        d="M50 73 Q54 78 58 73"
        stroke="#888888"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Cheek blush ── */}
      <Ellipse cx={36} cy={70} rx={6} ry={4} fill="#FFB0B8" opacity={0.55} />
      <Ellipse cx={72} cy={70} rx={6} ry={4} fill="#FFB0B8" opacity={0.55} />

      {/* ── Paw lower-right ── */}
      <Ellipse cx={92} cy={96} rx={10} ry={7} fill="#F0F0F0" />
      <Circle cx={87} cy={93} r={3} fill="#DDDDDD" />
      <Circle cx={92} cy={91} r={3} fill="#DDDDDD" />
      <Circle cx={97} cy={93} r={3} fill="#DDDDDD" />
    </Svg>
  );
}
