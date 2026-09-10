import type { ComponentType } from 'react';

import { Avatar01 } from './avatars/avatar-01';
import { Avatar02 } from './avatars/avatar-02';
import { Avatar03 } from './avatars/avatar-03';
import { Avatar04 } from './avatars/avatar-04';
import { Avatar05 } from './avatars/avatar-05';
import { Avatar06 } from './avatars/avatar-06';
import { Avatar07 } from './avatars/avatar-07';
import { Avatar08 } from './avatars/avatar-08';

export interface AvatarProps {
  size: number;
}

export interface AvatarDefinition {
  id: number;
  component: ComponentType<AvatarProps>;
  /** For documentation only */
  animal: string;
  backgroundColor: string;
}

/**
 * Deterministically maps a userId string to an avatar index.
 * Uses a djb2-style hash so the same user always gets the same avatar.
 */
export function resolveAvatarIndex(userId: string, catalogLength: number): number {
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 33) ^ userId.charCodeAt(i);
    hash = hash >>> 0; // keep as unsigned 32-bit
  }
  return hash % catalogLength;
}

export const AVATAR_CATALOG: AvatarDefinition[] = [
  { id: 1, component: Avatar01, animal: 'Gato cinza',           backgroundColor: '#B8C8D8' },
  { id: 2, component: Avatar02, animal: 'Cachorro bege',        backgroundColor: '#B8CCBA' },
  { id: 3, component: Avatar03, animal: 'Coelho branco',        backgroundColor: '#C8BCDC' },
  { id: 4, component: Avatar04, animal: 'Raposa laranja',       backgroundColor: '#D8B8A0' },
  { id: 5, component: Avatar05, animal: 'Urso mel',             backgroundColor: '#D4C080' },
  { id: 6, component: Avatar06, animal: 'Panda',                backgroundColor: '#A8CCB8' },
  { id: 7, component: Avatar07, animal: 'Sapo verde',           backgroundColor: '#8BBF9A' },
  { id: 8, component: Avatar08, animal: 'Coruja caramelo',      backgroundColor: '#B8A8CC' },
];
