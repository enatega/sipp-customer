import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../general/theme/theme';
import ProductCard from '../productCard/ProductCard';
import { ProductMiniCardScrollerProps } from './types';
import SectionActionHeader from '../../../../general/components/SectionActionHeader';
import HorizontalList from '../../../../general/components/HorizontalList';

export default function ProductMiniCardScroller({
  products,
  onSeeAllPress,
  onProductPress,
  onLoadMore,
  isLoadingMore,
}: ProductMiniCardScrollerProps) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <>
      <SectionActionHeader
        actionLabel={onSeeAllPress ? t('see_all') : undefined}
        onActionPress={onSeeAllPress}
        title={t('products')}
      />
      <HorizontalList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            variant="mini"
            onPress={onProductPress ? () => onProductPress(item) : undefined}
          />
        )}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={[
          styles.listContainer,
          {
            paddingBottom: spacing.lg,
            paddingTop: spacing.xs,
          },
        ]}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? (
          <View style={[styles.loader, { marginLeft: spacing.md }]}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : null}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 1,
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
  },
});
