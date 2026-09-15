import React from 'react';
import { StyleSheet, View } from 'react-native';
import Image from '../../../../general/components/Image';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import CartCountBadge from '../cart/CartCountBadge';
import type { SearchProductItem } from '../../api/searchServiceTypes';
import type { DeliveryShopTypeProduct } from '../../api/types';
import type { ProductCardControlState } from './types';
import PressableScale from '../../../../general/components/PressableScale';

type Props = {
  onPress: () => void;
  product: SearchProductItem | DeliveryShopTypeProduct;
  state: ProductCardControlState;
};

export default function MiniProductCard({ onPress, product, state }: Props) {
  const { colors, elevation, shape, spacing } = useTheme();
  const imageUri =
    product.productImage ??
    ('storeImage' in product ? product.storeImage ?? null : null) ??
    ('storeLogo' in product ? product.storeLogo ?? null : null) ??
    undefined;

  return (
    <PressableScale
      accessibilityLabel={product.productName}
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: shape.radius.surface,
          gap: spacing.sm,
          padding: spacing.sm,
          ...elevation.raised,
        },
      ]}
    >
      <View style={[styles.imageContainer, { borderRadius: shape.radius.control }]}>
        <Image
          source={imageUri ? { uri: imageUri } : undefined}
          style={styles.image}
          resizeMode="cover"
        />
        {state.shouldShowCountBadge ? (
          <CartCountBadge count={state.totalQuantity} style={styles.countBadge} />
        ) : null}
      </View>

      <Text
        variant="caption"
        weight="semiBold"
        color={colors.text}
        numberOfLines={2}
      >
        {product.productName}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 116,
    marginVertical: 6,
  },
  countBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageContainer: {
    width: 100,
    height: 100,
    overflow: 'hidden',
  },
});
