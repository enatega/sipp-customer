import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  brand: string;
  holderName: string;
  subtitle?: string;
  secondarySubtitle?: string;
  isDefault?: boolean;
  onPress?: () => void;
};

export default function SavedCardRow({
  brand,
  holderName,
  subtitle,
  secondarySubtitle,
  isDefault = false,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');
  const normalizedBrand = brand.toLowerCase();
  const brandLabel = normalizedBrand === 'visa'
    ? 'VISA'
    : normalizedBrand === 'mastercard'
      ? 'MC'
      : brand.toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.container, { borderBottomColor: colors.divider, opacity: pressed ? 0.72 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${brand} card ${holderName}`}
    >
      <View style={[styles.brandBadge, { backgroundColor: colors.surfaceSunken }]}> 
        <View style={[styles.brandChip, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text weight="bold" color={colors.primary} style={styles.brandText}>
            {brandLabel}
          </Text>
        </View>
      </View>
      <View style={styles.copy}>
        <Text weight="medium" color={colors.text} style={styles.name}>
          {holderName}
        </Text>
        {subtitle ? (
          <Text weight="medium" color={colors.mutedText} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
        {secondarySubtitle ? (
          <Text weight="medium" color={colors.mutedText} style={styles.subtitle}>
            {secondarySubtitle}
          </Text>
        ) : null}
      </View>
      {isDefault ? (
        <View style={[styles.defaultBadge, { backgroundColor: colors.successSoft }]}>
          <Text weight="semiBold" color={colors.success} style={styles.defaultText}>
            {t('wallet_default_card')}
          </Text>
        </View>
      ) : null}
      {!isDefault && onPress ? <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  defaultBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultText: {
    fontSize: 11,
    lineHeight: 15,
  },
  brandBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandChip: {
    minWidth: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  brandText: {
    fontSize: 10,
    lineHeight: 14,
  },
  name: {
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
});
