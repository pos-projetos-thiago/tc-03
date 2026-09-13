/**
 * Avatar 03 — Coelho branco com orelhas longas
 * Surge do canto inferior-esquerdo
 * Fundo: lavanda suave
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';

import type { AvatarProps } from '../avatar-catalog';

export function Avatar03({ size }: AvatarProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width={100} height={100} fill="#C8BCDC" rx={0} />

      {/* Depth */}
      <Ellipse cx={50} cy={106} rx={55} ry={26} fill="#B0A0CC" opacity={0.45} />

      {/* ── Body ── */}
      <Ellipse cx={35} cy={92} rx={28} ry={22} fill="#F0F0F0" />

      {/* ── Long ears (behind head) ── */}
      {/* Left ear outer */}
      <Ellipse cx={34} cy={28} rx={8} ry={22} fill="#F0F0F0" transform="rotate(-8 34 28)" />
      {/* Left ear inner */}
      <Ellipse cx={34} cy={29} rx={4} ry={16} fill="#F0C0C8" transform="rotate(-8 34 29)" />
      {/* Right ear outer */}
      <Ellipse cx={52} cy={25} rx={8} ry={22} fill="#F0F0F0" transform="rotate(8 52 25)" />
      {/* Right ear inner */}
      <Ellipse cx={52} cy={26} rx={4} ry={16} fill="#F0C0C8" transform="rotate(8 52 26)" />

      {/* ── Head (on top of ears base) ── */}
      <Circle cx={43} cy={62} r={24} fill="#F8F8F8" />

      {/* ── Chubby cheeks ── */}
      <Circle cx={30} cy={68} r={8} fill="#F0D0D8" opacity={0.6} />
      <Circle cx={56} cy={68} r={8} fill="#F0D0D8" opacity={0.6} />

      {/* ── Muzzle ── */}
      <Ellipse cx={43} cy={70} rx={9} ry={7} fill="#F0F0F0" />
      {/* Nose */}
      <Ellipse cx={43} cy={66} rx={3} ry={2.5} fill="#E87090" />
      {/* Mouth */}
      <Path
        d="M40 71 Q43 75 46 71"
        stroke="#D06878"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Eyes (big, cute) ── */}
      <Ellipse cx={35} cy={59} rx={5} ry={5.5} fill="#3A3A3A" />
      <Ellipse cx={51} cy={59} rx={5} ry={5.5} fill="#3A3A3A" />
      <Circle cx={36.5} cy={57} r={2} fill="#FFFFFF" />
      <Circle cx={52.5} cy={57} r={2} fill="#FFFFFF" />

      {/* ── Paw lower-left ── */}
      <Ellipse cx={10} cy={96} rx={10} ry={6} fill="#F0F0F0" />
      <Circle cx={5} cy={93} r={3} fill="#EBEBEB" />
      <Circle cx={10} cy={91} r={3} fill="#EBEBEB" />
      <Circle cx={15} cy={93} r={3} fill="#EBEBEB" />
    </Svg>
  );
}
