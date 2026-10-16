import React from 'react';
import CartMerchantSummary from './CartMerchantSummary';
import type { DeliveryStoreViewApiResponse } from '../../api/types';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  clearDisabled?: boolean;
  store?: DeliveryStoreViewApiResponse;
  storeName?: string | null;
  onStorePress?: () => void;
  onBackPress: () => void;
  onClearPress?: () => void;
};

export default function CartHeader({
  clearDisabled = false,
  store,
  storeName,
  onStorePress,
  onBackPress,
  onClearPress,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const { gutter } = useWindowClass();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          paddingBottom: spacing.sm,
          paddingHorizontal: gutter,
          paddingTop: insets.top + spacing.sm,
        },
      ]}
    >
      <View style={[styles.inner, { maxWidth: layout.contentMaxWidth.readable }]}>
        <PressableScale
          accessibilityLabel={t('store_details_action_back')}
          accessibilityRole="button"
          onPress={onBackPress}
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: shape.radius.pill,
              height: layout.touchTarget.minimum,
              width: layout.touchTarget.minimum,
            },
          ]}
        >
          <Ionicons color={colors.text} name="chevron-back" size={21} />
        </PressableScale>

        <View style={[styles.titleRow, { marginHorizontal: spacing.sm }]}>
          {onStorePress ? (
            <CartMerchantSummary compact store={store} fallbackName={storeName} onPress={onStorePress} />
          ) : (
            <Text numberOfLines={1} variant="sectionTitle" weight="bold">{t('cart_title')}</Text>
          )}
        </View>

        {onClearPress ? (
          <PressableScale
            accessibilityLabel={t('cart_clear_action')}
            accessibilityRole="button"
            accessibilityState={{ disabled: clearDisabled }}
            disabled={clearDisabled}
            onPress={onClearPress}
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.dangerSoft,
                borderRadius: shape.radius.pill,
                height: layout.touchTarget.minimum,
                width: layout.touchTarget.minimum,
              },
            ]}
          >
            <Ionicons color={colors.danger} name="trash-outline" size={19} />
          </PressableScale>
        ) : (
          <View style={{ width: layout.touchTarget.minimum }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleRow: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
