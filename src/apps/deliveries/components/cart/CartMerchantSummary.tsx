import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import Image from '../../../../general/components/Image';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryStoreViewApiResponse } from '../../api/types';
import { formatCartPrice } from './cartUtils';

type Props = {
  fallbackName?: string | null;
  onPress: () => void;
  store?: DeliveryStoreViewApiResponse;
};

export default function CartMerchantSummary({ fallbackName, onPress, store }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, shape, spacing } = useTheme();
  const [hasImageError, setHasImageError] = React.useState(false);
  const imageUrl = store?.logo?.trim() || store?.coverImage?.trim() || null;
  const storeName = store?.name?.trim() || fallbackName?.trim() || t('cart_store_fallback');
  const deliveryTime = store?.deliveryTime;
  const hasDeliveryTime = deliveryTime !== null
    && deliveryTime !== undefined
    && Boolean(`${deliveryTime}`.trim());

  React.useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <PressableScale
      accessibilityLabel={t('cart_return_to_store', { store: storeName })}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: shape.radius.surface,
          gap: spacing.md,
          padding: spacing.md,
        },
      ]}
    >
      {imageUrl && !hasImageError ? (
        <Image
          accessibilityLabel={storeName}
          onError={() => setHasImageError(true)}
          resizeMode="cover"
          source={{ uri: imageUrl }}
          style={[styles.logo, { borderRadius: shape.radius.control }]}
        />
      ) : (
        <View
          style={[
            styles.logoFallback,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: shape.radius.control,
            },
          ]}
        >
          <MaterialCommunityIcons color={colors.primary} name="storefront-outline" size={24} />
        </View>
      )}

      <View style={[styles.copy, { gap: spacing.xs }]}>
        <Text numberOfLines={1} variant="cardTitle" weight="bold">
          {storeName}
        </Text>
        <View style={[styles.metadata, { gap: spacing.sm }]}>
          {hasDeliveryTime ? (
            <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
              {t('cart_delivery_time', { time: deliveryTime })}
            </Text>
          ) : null}
          {store?.minimumOrder ? (
            <>
              {hasDeliveryTime ? (
                <View style={[styles.dot, { backgroundColor: colors.divider }]} />
              ) : null}
              <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
                {t('store_details_minimum_order', {
                  amount: formatCartPrice(store.minimumOrder),
                })}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.trailing,
          {
            backgroundColor: colors.primarySoft,
            borderRadius: shape.radius.pill,
          },
        ]}
      >
        <MaterialCommunityIcons color={colors.primary} name="chevron-right" size={22} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  dot: {
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  logo: {
    height: 54,
    width: 54,
  },
  logoFallback: {
    alignItems: 'center',
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  metadata: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trailing: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
