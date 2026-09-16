import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  onStartShoppingPress: () => void;
};

export default function CartEmptyState({ onStartShoppingPress }: Props) {
  const { colors, elevation, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.xl }]}>
      <View
        style={[
          styles.artwork,
          {
            backgroundColor: colors.primarySoft,
            borderRadius: shape.radius.sheet,
          },
        ]}
      >
        <View style={[styles.orbit, { borderColor: colors.primary, borderRadius: shape.radius.pill }]} />
        <View style={[styles.iconDisc, elevation.raised, { backgroundColor: colors.surface, borderRadius: shape.radius.pill }]}>
          <MaterialCommunityIcons color={colors.primary} name="shopping-outline" size={48} />
        </View>
        <View style={[styles.spark, styles.sparkTop, { backgroundColor: colors.warning, borderRadius: shape.radius.pill }]} />
        <View style={[styles.spark, styles.sparkBottom, { backgroundColor: colors.success, borderRadius: shape.radius.pill }]} />
      </View>

      <View style={[styles.textBlock, { gap: spacing.sm }]}>
        <Text accessibilityRole="header" style={styles.centerText} variant="sectionTitle" weight="bold">
          {t('cart_empty_title')}
        </Text>
        <Text color={colors.textSubtle} style={styles.centerText} variant="body">
          {t('cart_empty_message')}
        </Text>
      </View>

      <Button fullWidth label={t('cart_start_shopping')} onPress={onStartShoppingPress} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  artwork: {
    alignItems: 'center',
    height: 184,
    justifyContent: 'center',
    position: 'relative',
    width: 248,
  },
  centerText: {
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    gap: 28,
    justifyContent: 'center',
    maxWidth: 420,
    paddingBottom: 64,
    width: '100%',
  },
  iconDisc: {
    alignItems: 'center',
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  orbit: {
    borderStyle: 'dashed',
    borderWidth: StyleSheet.hairlineWidth,
    height: 142,
    opacity: 0.42,
    position: 'absolute',
    width: 142,
  },
  spark: {
    height: 16,
    position: 'absolute',
    width: 16,
  },
  sparkBottom: {
    bottom: 34,
    left: 45,
  },
  sparkTop: {
    right: 44,
    top: 30,
  },
  textBlock: {
    maxWidth: 320,
  },
});
