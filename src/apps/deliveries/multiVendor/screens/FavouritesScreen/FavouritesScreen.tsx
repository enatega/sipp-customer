import React, { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../../general/theme/theme';
import ScreenHeader from '../../../../../general/components/ScreenHeader';
import Text from '../../../../../general/components/Text';
import FavouriteHeartButton from '../../components/favourites/FavouriteHeartButton';
import FavouritesListFooter from '../../components/favourites/FavouritesListFooter';
import StoreCard from '../../../components/storeCard/StoreCard';
import { showToast } from '../../../../../general/components/AppToast';
import { useFavouritesQuery } from '../../hooks/useFavouritesQuery';
import { useToggleFavouriteMutation } from '../../hooks/useToggleFavouriteMutation';
import type { DeliveryNearbyStore } from '../../../api/types';
import PressableScale from '../../../../../general/components/PressableScale';
import Skeleton from '../../../../../general/components/Skeleton';

export default function FavouritesScreen() {
  const { colors, elevation } = useTheme();
  const { t } = useTranslation('deliveries');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    isError,
  } = useFavouritesQuery();

  const { mutate: toggleFavourite, isPending: isToggling, variables: toggleVariables } = useToggleFavouriteMutation({
    onSuccess: (data) => {
      if (data.isFavorite) {
        showToast.success(t('favourites_toggle_added'));
      } else {
        showToast.success(t('favourites_toggle_removed'));
      }
    },
    onError: () => {
      showToast.error(t('favourites_toggle_error'));
    },
  });

  const stores = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const addToFavLabel = t('favourites_add');
  const removeFromFavLabel = t('favourites_remove');

  const renderItem = useCallback(
    ({ item }: { item: DeliveryNearbyStore }) => (
      <StoreCard
        layout="fullWidth"
        store={item}
        actionSlot={
          <FavouriteHeartButton
            isFavourite={item.isFavorite ?? false}
            isLoading={isToggling && toggleVariables?.storeId === item.storeId}
            accessibilityLabel={item.isFavorite ? removeFromFavLabel : addToFavLabel}
            onPress={() => toggleFavourite({
              storeId: item.storeId,
              nextIsFavorite: !(item.isFavorite ?? false),
            })}
          />
        }
      />
    ),
    [addToFavLabel, removeFromFavLabel, toggleFavourite, isToggling, toggleVariables],
  );

  const keyExtractor = useCallback((item: DeliveryNearbyStore) => item.storeId, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}> 
        <ScreenHeader title={t('favourites_title')} />
        <View style={styles.loadingContent}>
          <Skeleton width="72%" height={18} borderRadius={8} />
          <Skeleton width="100%" height={224} borderRadius={18} />
          <Skeleton width="100%" height={224} borderRadius={18} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScreenHeader title={t('favourites_title')} />
        <View style={styles.centered}>
          <View style={[styles.stateIcon, { backgroundColor: colors.dangerSoft }]}> 
            <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
          </View>
          <Text variant="title" weight="bold" style={styles.centeredText}>
            {t('favourites_error_title')}
          </Text>
          <Text variant="body" color={colors.mutedText} style={styles.centeredText}>
            {t('favourites_error')}
          </Text>
          <PressableScale
            accessibilityRole="button"
            onPress={() => void refetch()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text weight="bold" color={colors.onPrimary}>
              {t('favourites_retry')}
            </Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('favourites_title')} />

      {stores.length === 0 ? (
        <View style={styles.centered}>
          <View
            style={[
              styles.emptyVisual,
              { backgroundColor: colors.quickActionFavouritesSurface },
            ]}
          >
            <View style={[styles.emptyOrbit, { borderColor: colors.quickActionFavouritesForeground }]} />
            <View style={[styles.emptyHeart, elevation.subtle, { backgroundColor: colors.surface }]}> 
              <Ionicons
                name="heart-outline"
                size={30}
                color={colors.quickActionFavouritesForeground}
              />
            </View>
            <View style={[styles.emptySpark, { backgroundColor: colors.quickActionDealsSurface }]}> 
              <Ionicons name="sparkles" size={15} color={colors.quickActionDealsForeground} />
            </View>
          </View>
          <Text variant="title" weight="bold" style={styles.centeredText}>
            {t('favourites_empty_title')}
          </Text>
          <Text variant="body" color={colors.mutedText} style={styles.centeredText}>
            {t('favourites_empty_subtitle')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={<FavouritesListFooter isVisible={isFetchingNextPage} />}
          ListHeaderComponent={
            <View style={styles.listIntro}>
              <Text color={colors.mutedText} style={styles.listIntroText}>
                {t('favourites_subtitle')}
              </Text>
              <View style={[styles.countPill, { backgroundColor: colors.quickActionFavouritesSurface }]}> 
                <Text weight="bold" color={colors.quickActionFavouritesForeground} style={styles.countText}>
                  {stores.length}
                </Text>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 32,
  },
  centeredText: {
    maxWidth: 280,
    textAlign: 'center',
  },
  countPill: {
    alignItems: 'center',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    minWidth: 28,
    paddingHorizontal: 9,
  },
  countText: { fontSize: 12, lineHeight: 16 },
  emptyHeart: {
    alignItems: 'center',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  emptyOrbit: {
    borderRadius: 42,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 84,
    opacity: 0.35,
    position: 'absolute',
    width: 84,
  },
  emptySpark: {
    alignItems: 'center',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    top: 4,
    width: 30,
  },
  emptyVisual: {
    alignItems: 'center',
    borderRadius: 52,
    height: 104,
    justifyContent: 'center',
    marginBottom: 4,
    width: 104,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  listIntro: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  listIntroText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  loadingContent: {
    gap: 14,
    padding: 16,
  },
  retryButton: {
    borderRadius: 14,
    marginTop: 4,
    minHeight: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 22,
  },
  stateIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  screen: {
    flex: 1,
  },
  separator: {
    height: 12,
  },
});
