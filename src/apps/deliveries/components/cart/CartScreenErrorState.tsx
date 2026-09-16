import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  onRetry: () => void;
};

export default function CartScreenErrorState({ onRetry }: Props) {
  const { colors, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={[styles.container, { gap: spacing.xl, paddingHorizontal: spacing.xxl }]}> 
      <View style={[styles.icon, { backgroundColor: colors.dangerSoft, borderRadius: shape.radius.pill }]}> 
        <MaterialCommunityIcons color={colors.danger} name="basket-off-outline" size={36} />
      </View>
      <View style={[styles.textBlock, { gap: spacing.sm }]}> 
        <Text accessibilityRole="header" style={styles.centerText} variant="sectionTitle" weight="bold">
          {t('cart_error_title')}
        </Text>
        <Text color={colors.textSubtle} style={styles.centerText} variant="body">
          {t('cart_error_message')}
        </Text>
      </View>

      <Button label={t('generic_list_retry')} onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    alignItems: 'center',
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  textBlock: {
    maxWidth: 320,
  },
});
