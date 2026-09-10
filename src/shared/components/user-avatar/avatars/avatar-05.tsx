/**
 * Avatar 05 — Urso marrom/mel
 * Surge do canto inferior-esquerdo
 * Fundo: amarelo-mostarda suave
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';

import type { AvatarProps } from '../avatar-catalog';

export function Avatar05({ size }: AvatarProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width={100} height={100} fill="#D4C080" rx={0} />

      {/* Depth */}
      <Ellipse cx={50} cy={106} rx={55} ry={26} fill="#BCA860" opacity={0.45} />

      {/* ── Body ── */}
      <Ellipse cx={33} cy={92} rx={30} ry={24} fill="#A06030" />

      {/* ── Belly patch ── */}
      <Ellipse cx={33} cy={92} rx={16} ry={18} fill="#D4946A" />

      {/* ── Round ears ── */}
      <Circle cx={30} cy={38} r={12} fill="#A06030" />
      <Circle cx={30} cy={38} r={7} fill="#C07848" />
      <Circle cx={58} cy={36} r={12} fill="#A06030" />
      <Circle cx={58} cy={36} r={7} fill="#C07848" />

      {/* ── Head (big and round) ── */}
      <Circle cx={44} cy={60} r={28} fill="#B87040" />

      {/* ── Muzzle ── */}
      <Ellipse cx={44} cy={70} rx={13} ry={10} fill="#D4946A" />
      {/* Nose */}
      <Ellipse cx={44} cy={65} rx={5} ry={4} fill="#3A3A3A" />
      <Circle cx={42} cy={64} r={1.5} fill="#555" />
      {/* Mouth */}
      <Path
        d="M40 73 Q44 78 48 73"
        stroke="#90502A"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Eyes ── */}
      <Circle cx={35} cy={57} r={5.5} fill="#2A2A2A" />
      <Circle cx={53} cy={57} r={5.5} fill="#2A2A2A" />
      <Circle cx={36.5} cy={55} r={2} fill="#FFFFFF" />
      <Circle cx={54.5} cy={55} r={2} fill="#FFFFFF" />

      {/* ── Eyebrow (sleepy happy) ── */}
      <Path
        d="M31 51 Q35 48 39 51"
        stroke="#8A4020"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M49 51 Q53 48 57 51"
        stroke="#8A4020"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Cheeks ── */}
      <Ellipse cx={28} cy={67} rx={7} ry={5} fill="#E09060" opacity={0.5} />
      <Ellipse cx={60} cy={67} rx={7} ry={5} fill="#E09060" opacity={0.5} />

      {/* ── Paw lower-left ── */}
      <Ellipse cx={8} cy={96} rx={10} ry={7} fill="#A06030" />
      <Circle cx={3} cy={93} r={3.5} fill="#8A5020" />
      <Circle cx={8} cy={91} r={3.5} fill="#8A5020" />
      <Circle cx={13} cy={93} r={3.5} fill="#8A5020" />
    </Svg>
  );
}
