import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../Text';
import PressableScale from '../PressableScale';
import { useTheme } from '../../theme/theme';

type Props = {
  name: string | null | undefined;
  imageUri: string | null | undefined;
  subtitle: string;
  editLabel?: string;
  onPress?: () => void;
};

export default function ProfileHeader({
  name,
  imageUri,
  subtitle,
  editLabel,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const displayName = name || '—';

  return (
    <View style={styles.container}>
      <View style={[styles.avatarWrapper, { backgroundColor: colors.primarySoft }]}> 
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.avatar}
            accessibilityLabel={`${displayName} avatar`}
          />
        ) : (
          <Ionicons name="person" size={30} color={colors.primary} />
        )}
      </View>
      <View style={styles.info}>
        <Text
          weight="bold"
          style={styles.name}
          numberOfLines={1}
        >
          {displayName}
        </Text>
        <Text
          weight="medium"
          color={colors.mutedText}
          style={styles.subtitle}
        >
          {subtitle}
        </Text>
      </View>
      {onPress ? (
        <PressableScale
          accessibilityLabel={editLabel}
          accessibilityRole="button"
          onPress={onPress}
          style={[styles.editButton, { backgroundColor: colors.surfaceSunken }]}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.text} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const AVATAR_SIZE = 56;

const styles = StyleSheet.create({
  avatar: {
    borderRadius: AVATAR_SIZE / 2,
    height: AVATAR_SIZE,
    width: AVATAR_SIZE,
  },
  avatarWrapper: {
    alignItems: 'center',
    borderRadius: AVATAR_SIZE / 2,
    height: AVATAR_SIZE,
    overflow: 'hidden',
    justifyContent: 'center',
    width: AVATAR_SIZE,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  editButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 40,
  },
});
