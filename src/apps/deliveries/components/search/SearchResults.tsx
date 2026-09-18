import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import GenericSearchResults from '../../../../general/components/search/GenericSearchResults';
import SearchResultsSkeleton from './SearchResultsSkeleton';
import ProductMiniCardScroller from './ProductMiniCardScroller';
import StoreCardScroller from './StoreCardScroller';
import type { SearchResultsProps } from './types';
import { useTheme } from '../../../../general/theme/theme';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';

export default function SearchResults({
  isSearchActive,
  shouldSearchStores,
  isSearchLoading,
  hasNoResults,
  products,
  stores,
  isFetchingMoreProducts,
  isFetchingMoreStores,
  onLoadMoreProducts,
  onLoadMoreStores,
  onProductPress,
  onStorePress,
}: SearchResultsProps) {
  const { motion, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const reveal = useRef(new Animated.Value(1)).current;
  const skeletonComponent = <SearchResultsSkeleton showStores={shouldSearchStores} />;

  useEffect(() => {
    if (isSearchLoading || !isSearchActive || isReducedMotionEnabled) {
      reveal.setValue(1);
      return;
    }

    reveal.setValue(0.78);
    Animated.timing(reveal, {
      duration: motion.duration.standard,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [
    isReducedMotionEnabled,
    isSearchActive,
    isSearchLoading,
    motion.duration.standard,
    products.length,
    reveal,
    stores.length,
  ]);

  const resultsContent = (
    <>
      {products.length > 0 ? (
        <View style={[styles.section, { marginBottom: spacing.section.default }]}>
          <ProductMiniCardScroller
            products={products}
            onLoadMore={onLoadMoreProducts}
            isLoadingMore={isFetchingMoreProducts}
            onProductPress={onProductPress}
          />
        </View>
      ) : null}

      {shouldSearchStores && stores.length > 0 ? (
        <View style={[styles.section, { marginBottom: spacing.section.default }]}>
          <StoreCardScroller
            stores={stores}
            onLoadMore={onLoadMoreStores}
            isLoadingMore={isFetchingMoreStores}
            onStorePress={onStorePress}
          />
        </View>
      ) : null}
    </>
  );

  return (
    <GenericSearchResults
      isSearchActive={isSearchActive}
      isSearchLoading={isSearchLoading}
      hasNoResults={hasNoResults}
      skeletonComponent={skeletonComponent}
    >
      {(products.length > 0 || stores.length > 0) ? (
        <Animated.View
          style={{
            opacity: reveal,
            transform: [
              {
                translateY: reveal.interpolate({
                  inputRange: [0.78, 1],
                  outputRange: [motion.distance.small, 0],
                }),
              },
            ],
          }}
        >
          {resultsContent}
        </Animated.View>
      ) : null}
    </GenericSearchResults>
  );
}

const styles = StyleSheet.create({
  section: {},
});
