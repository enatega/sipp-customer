import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../general/theme/theme';
import StoreCard from '../storeCard/StoreCard';
import type { StoreCardScrollerProps } from './types';
import SectionActionHeader from '../../../../general/components/SectionActionHeader';

export default function StoreCardScroller({
  stores,
  onSeeAllPress,
  onLoadMore,
  isLoadingMore,
}: StoreCardScrollerProps) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={styles.container}>
      <SectionActionHeader
        actionLabel={onSeeAllPress ? t('see_all') : undefined}
        onActionPress={onSeeAllPress}
        title={t('stores')}
      />
      <FlatList
        data={stores}
        renderItem={({ item }) => <StoreCard layout="resultRow" store={item} />}
        keyExtractor={(item) => item.storeId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.xs,
          paddingTop: spacing.md,
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        scrollEnabled={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? (
          <View style={[styles.loader, { paddingVertical: spacing.lg }]}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  loader: {
    alignItems: 'center',
  },
});
