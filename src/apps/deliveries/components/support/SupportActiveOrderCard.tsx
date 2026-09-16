import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  accessibilityLabel: string;
  actionLabel: string;
  eyebrow: string;
  imageUri?: string;
  onPress: () => void;
  statusLabel: string;
  statusTone: 'danger' | 'primary' | 'success' | 'warning';
  storeName: string;
};

export default function SupportActiveOrderCard({
  accessibilityLabel,
  actionLabel,
  eyebrow,
  imageUri,
  onPress,
  statusLabel,
  statusTone,
  storeName,
}: Props) {
  const { colors, elevation, shape, spacing } = useTheme();
  const statusColor = statusTone === 'danger'
    ? colors.danger
    : statusTone === 'warning'
      ? colors.warning
      : statusTone === 'success'
        ? colors.success
        : colors.primary;

  return (
    <View
      style={[
        styles.card,
        elevation.subtle,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: shape.radius.hero,
          padding: spacing.lg,
        },
      ]}
    >
      <View style={styles.topRow}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={[styles.image, { borderRadius: shape.radius.surface }]} />
        ) : (
          <View
            style={[
              styles.image,
              styles.fallback,
              { backgroundColor: colors.primarySoft, borderRadius: shape.radius.surface },
            ]}
          >
            <Ionicons color={colors.primary} name="bag-handle-outline" size={26} />
          </View>
        )}

        <View style={styles.copy}>
          <Text color={colors.primary} variant="caption" weight="semiBold">
            {eyebrow}
          </Text>
          <Text color={colors.textStrong} numberOfLines={2} variant="cardTitle" weight="bold">
            {storeName}
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text color={colors.textSubtle} numberOfLines={1} variant="caption" weight="medium">
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      <Button
        accessibilityLabel={accessibilityLabel}
        icon={<Ionicons color={colors.onPrimary} name="navigate-outline" size={18} />}
        label={actionLabel}
        onPress={onPress}
        size="compact"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 14,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 68,
    width: 68,
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 2,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
});
