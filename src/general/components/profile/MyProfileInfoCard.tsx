import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import MyProfileInfoRow from './MyProfileInfoRow';
import PressableScale from '../PressableScale';

type Props = {
  imageUri: string | null | undefined;
  displayName: string;
  fullName: string | null | undefined;
  dateOfBirth: string | null | undefined;
  phone: string | null | undefined;
  email: string | null | undefined;
  editLabel: string;
  nameLabel: string;
  dateOfBirthLabel: string;
  phoneLabel: string;
  emailLabel: string;
  onEditAvatar?: () => void;
  onPressAvatar?: () => void;
  onEditName?: () => void;
};

export default function MyProfileInfoCard({
  imageUri,
  displayName,
  fullName,
  dateOfBirth,
  phone,
  email,
  editLabel,
  nameLabel,
  dateOfBirthLabel,
  phoneLabel,
  emailLabel,
  onEditAvatar,
  onPressAvatar,
  onEditName,
}: Props) {
  const { colors, elevation } = useTheme();

  return (
    <View
      style={[
        styles.card,
        elevation.subtle,
        { backgroundColor: colors.surface, borderColor: colors.divider },
      ]}
    >
      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <PressableScale
            onPress={onPressAvatar}
            style={[styles.avatarWrapper, { backgroundColor: colors.backgroundTertiary }]}
            accessibilityRole={onPressAvatar ? 'button' : undefined}
            disabled={!onPressAvatar}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.avatar}
                accessibilityLabel={`${displayName} avatar`}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]} />
            )}
          </PressableScale>
          <PressableScale
            onPress={onEditAvatar}
            accessibilityRole="button"
            accessibilityLabel={editLabel}
            style={[
              styles.editAvatarButton,
              { backgroundColor: colors.primary, borderColor: colors.surface },
            ]}
          >
            <Ionicons name="pencil" size={12} color={colors.onPrimary} />
          </PressableScale>
        </View>
        <Text weight="bold" style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.dividerWrapper}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>

      {/* Info rows */}
      <View style={styles.infoSection}>
        <MyProfileInfoRow
          label={nameLabel}
          value={fullName}
          isEditable
          editLabel={editLabel}
          onEdit={onEditName}
        />
        <MyProfileInfoRow label={dateOfBirthLabel} value={dateOfBirth} />
        <MyProfileInfoRow label={phoneLabel} value={phone} />
        <MyProfileInfoRow label={emailLabel} value={email} />
      </View>
    </View>
  );
}

const AVATAR_SIZE = 76;

const styles = StyleSheet.create({
  avatar: {
    borderRadius: AVATAR_SIZE / 2,
    height: AVATAR_SIZE,
    width: AVATAR_SIZE,
  },
  avatarContainer: {
    height: AVATAR_SIZE,
    width: AVATAR_SIZE,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  avatarWrapper: {
    borderRadius: AVATAR_SIZE / 2,
    height: AVATAR_SIZE,
    overflow: 'hidden',
    width: AVATAR_SIZE,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    marginHorizontal: 16,
    padding: 18,
  },
  divider: {
    height: 1,
  },
  dividerWrapper: {
    paddingVertical: 4,
  },
  editAvatarButton: {
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
    bottom: -2,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: -3,
    width: 30,
  },
  infoSection: {
    gap: 12,
  },
  name: {
    fontSize: 20,
    lineHeight: 30,
  },
});
