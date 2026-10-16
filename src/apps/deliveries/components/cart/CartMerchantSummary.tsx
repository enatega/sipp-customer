import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import Image from '../../../../general/components/Image';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { DeliveryStoreViewApiResponse } from '../../api/types';

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
          gap: spacing.sm,
          paddingVertical: spacing.xs,
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
          <MaterialCommunityIcons color={colors.primary} name="storefront-outline" size={20} />
        </View>
      )}

      <View style={styles.copy}>
        <Text numberOfLines={1} variant="label" weight="semiBold">
          {storeName}
        </Text>
        {hasDeliveryTime ? (
          <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
            {t('cart_delivery_time', { time: deliveryTime })}
          </Text>
        ) : null}
      </View>

      <MaterialCommunityIcons color={colors.textSubtle} name="chevron-right" size={20} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  logo: {
    height: 40,
    width: 40,
  },
  logoFallback: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
