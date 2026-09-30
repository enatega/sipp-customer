import React, { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../general/theme/theme';
import HorizontalList from '../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../general/components/SectionActionHeader';
import Text from '../../../../general/components/Text';
import Icon from '../../../../general/components/Icon';
import type { SearchStoreItem } from '../../api/searchServiceTypes';
import type {
  DeliveryNearbyStore,
  DeliveryShopTypeProduct,
} from '../../api/types';
import type { DeliveriesStoreDetailsParamList } from '../../navigation/sharedTypes';
import DeliveriesSectionEmptyState from '../home/DeliveriesSectionEmptyState';
import {
  DiscoveryResultsSkeleton,
  DiscoverySectionState,
} from '../discovery';
import StoreCard from '../storeCard/StoreCard';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { pushStoreDetails } from '../../navigation/storeDetailsNavigation';
import ClosedStoreMenuPopup from '../storeCard/ClosedStoreMenuPopup';

type DealsItem = DeliveryNearbyStore | SearchStoreItem | DeliveryShopTypeProduct;
type NavigationProp = NativeStackNavigationProp<DeliveriesStoreDetailsParamList>;

type Props = {
  title: string;
  items: DealsItem[];
  isPending: boolean;
  isError: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
  onClosedStorePress?: (store: DeliveryNearbyStore) => void;
  onItemPress?: (item: DealsItem) => void;
  homeCards?: boolean;
};

function isProductItem(item: DealsItem): item is DeliveryShopTypeProduct {
  return 'productId' in item && 'productName' in item;
}

function getItemKey(item: DealsItem, index: number) {
  if (isProductItem(item)) {
    return `${item.productId}-${item.storeId}`;
  }

  return `${item.storeId}-${item.deal ?? item.dealAmount ?? index}`;
}

export default function Deals({
  title,
  items,
  isPending,
  isError,
  actionLabel,
  onActionPress,
  onClosedStorePress,
  onItemPress,
  homeCards = false,
}: Props) {
  const { colors, isDark, shape, spacing, typography } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('deliveries');
  const navigation = useNavigation<NavigationProp>();
  const [selectedClosedStore, setSelectedClosedStore] = useState<DeliveryNearbyStore | null>(null);
  const isEmpty = !isPending && !isError && items.length === 0;
  const isFeatured = homeCards && !isPending && !isError && items.length > 0;
  const shouldShowAction = Boolean(actionLabel) && !isPending && !isError && items.length > 0;
  const handleClosedStorePress = useCallback((store: DeliveryNearbyStore) => {
    if (onClosedStorePress) {
      onClosedStorePress(store);
      return;
    }

    setSelectedClosedStore(store);
  }, [onClosedStorePress]);

  const handleCloseClosedStorePopup = useCallback(() => {
    setSelectedClosedStore(null);
  }, []);

  const handleSeeMenu = useCallback(() => {
    if (!selectedClosedStore) {
      return;
    }

    pushStoreDetails(navigation, selectedClosedStore);
    setSelectedClosedStore(null);
  }, [navigation, selectedClosedStore]);
  const renderItem = useCallback(
    ({ item }: { item: DealsItem }) => {
      const isClosedStore =
        !isProductItem(item)
        && (
          item.isAvailable === false
          || ('isClosed' in item && item.isClosed === true)
        );

      return (
        <StoreCard
          store={item}
          layout={homeCards ? 'home' : 'compact'}
          showClosedOverlay={isClosedStore}
          onClosedPress={isClosedStore ? () => handleClosedStorePress(item) : undefined}
          onPress={onItemPress ? () => onItemPress(item) : undefined}
        />
      );
    },
    [handleClosedStorePress, homeCards, onItemPress],
  );

  const cards = (
    <HorizontalList
      data={items}
      keyExtractor={getItemKey}
      contentContainerStyle={{
        paddingBottom: spacing.lg,
        paddingRight: isFeatured ? spacing.md : gutter,
        paddingTop: isFeatured ? spacing.lg : spacing.xs,
      }}
      ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
      renderItem={renderItem}
    />
  );

  return (
    <View style={[styles.section, { gap: spacing.md, paddingHorizontal: gutter }]}>
      {isFeatured ? (
        <LinearGradient
          colors={isDark
            ? ['#38331F', '#28291F', colors.surface]
            : ['#FFF7CE', '#FFFCED', colors.surface]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.featured,
            {
              borderColor: colors.border,
              borderRadius: shape.radius.sheet,
              paddingHorizontal: spacing.md,
              paddingTop: spacing.md,
            },
          ]}
        >
          <View style={styles.featuredTopRow}>
            <View style={[styles.limitedTimePill, { backgroundColor: colors.surface }]}>
              <Icon name="flash" size={17} color={colors.warningText} />
              <Text variant="badge" weight="bold" style={styles.limitedTimeLabel}>
                {t('home_deals_limited_time')}
              </Text>
            </View>
            {shouldShowAction && onActionPress ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={actionLabel}
                onPress={onActionPress}
                hitSlop={8}
                style={styles.seeAllButton}
              >
                <Text variant="button" weight="semiBold" color={colors.warningText}>
                  {actionLabel}
                </Text>
                <Icon name="chevron-forward" size={17} color={colors.warningText} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.featuredIntro}>
            <View style={styles.featuredCopy}>
              <Text
                weight="extraBold"
                accessibilityRole="header"
                style={typography.role.sectionTitle}
              >
                {t('home_deals_featured_title')}
              </Text>
              <Text variant="supporting" color={colors.mutedText}>
                {t('home_deals_featured_description')}
              </Text>
            </View>
            <Image
              accessible={false}
              importantForAccessibility="no"
              resizeMode="contain"
              source={require('../../assets/images/deals-burger-drink.png')}
              style={styles.foodIllustration}
            />
          </View>

          {cards}
        </LinearGradient>
      ) : (
        <>
          {shouldShowAction ? (
            <SectionActionHeader
              actionLabel={actionLabel!}
              onActionPress={onActionPress}
              title={title}
            />
          ) : (
            <Text
              weight="extraBold"
              accessibilityRole="header"
              style={typography.role.sectionTitle}
            >
              {title}
            </Text>
          )}

          {isPending ? (
            <DiscoveryResultsSkeleton home={homeCards} />
          ) : isError ? (
            <DiscoverySectionState
              tone="error"
              title={t('multi_vendor_home_section_error_title')}
              message={t('multi_vendor_home_section_error_message')}
            />
          ) : isEmpty ? (
            <DeliveriesSectionEmptyState
              title={t('home_no_deals_title')}
              message={t('home_no_deals_message')}
              variant="offers"
            />
          ) : (
            cards
          )}
        </>
      )}

      {onClosedStorePress ? null : (
        <ClosedStoreMenuPopup
          onClose={handleCloseClosedStorePopup}
          onSeeMenu={handleSeeMenu}
          store={selectedClosedStore}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
  featured: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  featuredTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  limitedTimePill: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  limitedTimeLabel: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  seeAllButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    minHeight: 44,
    paddingHorizontal: 2,
  },
  featuredIntro: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
  },
  featuredCopy: {
    flex: 1,
    gap: 6,
  },
  foodIllustration: {
    height: 96,
    width: 108,
  },
});
