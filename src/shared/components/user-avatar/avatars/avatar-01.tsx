/**
 * Avatar 01 — Gato cinza
 * Surge do canto inferior-esquerdo
 * Fundo: azul-acinzentado suave
 */
import React from 'react';
import { Circle, Ellipse, Path, Rect, Svg } from 'react-native-svg';

import type { AvatarProps } from '../avatar-catalog';

export function Avatar01({ size }: AvatarProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width={100} height={100} fill="#B8C8D8" rx={0} />

      {/* Subtle depth — soft inner shadow at bottom */}
      <Ellipse cx={50} cy={105} rx={55} ry={28} fill="#9AAFC2" opacity={0.5} />

      {/* ── Body (big rounded torso, lower-left) ── */}
      <Ellipse cx={32} cy={88} rx={30} ry={26} fill="#C8C8C8" />

      {/* ── Head ── */}
      <Circle cx={44} cy={62} r={26} fill="#D8D8D8" />

      {/* ── Ears (pointy cat ears) ── */}
      {/* Left ear outer */}
      <Path d="M22 44 L14 22 L34 36 Z" fill="#D8D8D8" />
      {/* Left ear inner */}
      <Path d="M23 41 L17 26 L31 36 Z" fill="#E8A8B8" />
      {/* Right ear outer */}
      <Path d="M56 40 L60 18 L72 34 Z" fill="#D8D8D8" />
      {/* Right ear inner */}
      <Path d="M58 39 L61 23 L70 33 Z" fill="#E8A8B8" />

      {/* ── Face ── */}
      {/* Muzzle */}
      <Ellipse cx={44} cy={68} rx={10} ry={7} fill="#EBEBEB" />
      {/* Nose */}
      <Ellipse cx={44} cy={65} rx={3} ry={2} fill="#E87090" />
      {/* Eyes */}
      <Ellipse cx={36} cy={58} rx={4} ry={4.5} fill="#3A3A3A" />
      <Ellipse cx={52} cy={58} rx={4} ry={4.5} fill="#3A3A3A" />
      {/* Eye shine */}
      <Circle cx={37.5} cy={56.5} r={1.5} fill="#FFFFFF" />
      <Circle cx={53.5} cy={56.5} r={1.5} fill="#FFFFFF" />
      {/* Mouth */}
      <Path
        d="M41 70 Q44 73 47 70"
        stroke="#D06070"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
      {/* Whiskers left */}
      <Path d="M20 65 L36 67" stroke="#AAAAAA" strokeWidth={1} strokeLinecap="round" />
      <Path d="M20 69 L36 69" stroke="#AAAAAA" strokeWidth={1} strokeLinecap="round" />
      {/* Whiskers right */}
      <Path d="M52 67 L68 65" stroke="#AAAAAA" strokeWidth={1} strokeLinecap="round" />
      <Path d="M52 69 L68 69" stroke="#AAAAAA" strokeWidth={1} strokeLinecap="round" />

      {/* ── Paw peeking from lower-left ── */}
      <Ellipse cx={12} cy={96} rx={10} ry={7} fill="#C8C8C8" />
      <Circle cx={7} cy={93} r={3} fill="#C0C0C0" />
      <Circle cx={12} cy={91} r={3} fill="#C0C0C0" />
      <Circle cx={17} cy={93} r={3} fill="#C0C0C0" />
    </Svg>
  );
}
