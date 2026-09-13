import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AVATAR_CATALOG, resolveAvatarIndex } from './avatar-catalog';

interface UserAvatarProps {
  /** Firebase uid — used to deterministically pick the avatar. */
  userId: string;
  /** Diameter of the circular avatar in dp. Defaults to 44. */
  size?: number;
  /** Additional style applied to the outer circle. */
  style?: object;
}

/**
 * Renders a unique circular avatar for each user.
 *
 * The avatar is chosen deterministically from AVATAR_CATALOG based on the
 * userId hash — so the same user always sees the same mascot, across devices
 * and sessions, with no backend required.
 */
export function UserAvatar({ userId, size = 44, style }: UserAvatarProps) {
  const avatarDef = useMemo(() => {
    const index = resolveAvatarIndex(userId, AVATAR_CATALOG.length);
    return AVATAR_CATALOG[index];
  }, [userId]);

  const AvatarComponent = avatarDef.component;

  const circleStyle = useMemo(
    () => [
      styles.circle,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatarDef.backgroundColor,
      },
      style,
    ],
    [size, avatarDef.backgroundColor, style],
  );

  return (
    <View style={circleStyle}>
      <AvatarComponent size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    // Subtle elevation so the avatar lifts slightly off the header background
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
});
