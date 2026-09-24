import React from 'react';
import { View } from 'react-native';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import ProductCard from '../../../components/productCard/ProductCard';
import type { ProductCardActionOverrides } from '../../../components/productCard/types';
import type { StoreMenuRow } from '../../utils/storeMenuRows';

type Props = { item: StoreMenuRow; storeId: string; productAction: ProductCardActionOverrides };

function StoreMenuProductRow({ item, storeId, productAction }: Props) {
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  return (
    <View style={{ paddingHorizontal: gutter, paddingTop: item.type === 'category' ? spacing.lg : spacing.xs, paddingBottom: spacing.md }}>
      {item.type === 'product'
        ? <ProductCard product={item.product} storeId={storeId} productAction={productAction} variant="storeMenu" />
        : <Text accessibilityRole="header" variant={item.type === 'category' ? 'sectionTitle' : 'subtitle'} weight="bold">{item.title}</Text>}
    </View>
  );
}

export default React.memo(StoreMenuProductRow);
