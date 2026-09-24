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
      style={({ pressed }) => [styles.container, { borderColor: isDefault ? colors.walletBlue : colors.walletHairline, backgroundColor: isDefault ? colors.walletSurfaceAlt : colors.walletSurface, opacity: pressed ? 0.72 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={t('wallet_saved_card_accessibility', { brand, name: holderName, last4: subtitle ?? '' })}
      accessibilityState={{ selected: isDefault }}
    >
      <View style={[styles.brandBadge, { backgroundColor: colors.walletSurfaceAlt }]}>
        <Text weight="bold" color={colors.walletBlue} style={styles.brandText}>{brandLabel}</Text>
      </View>
      <View style={styles.copy}>
        <Text weight="semiBold" color={colors.text} style={styles.name} numberOfLines={1}>
          {`${holderName} ${subtitle ?? ''}`}
        </Text>
        {secondarySubtitle ? (
          <Text color={colors.walletTextMuted} style={styles.subtitle}>
            {secondarySubtitle}
          </Text>
        ) : null}
      </View>
      {isDefault ? (
        <View style={[styles.radioSelected, { backgroundColor: colors.walletBlue }]}>
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      ) : <View style={[styles.radio, { borderColor: colors.walletTextMuted }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    height: 70,
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  radio: { borderRadius: 12, borderWidth: 1.5, height: 24, width: 24 },
  radioSelected: { alignItems: 'center', borderRadius: 12, height: 24, justifyContent: 'center', width: 24 },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 11,
    lineHeight: 15,
  },
  name: {
    fontSize: 14,
    lineHeight: 19,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});
