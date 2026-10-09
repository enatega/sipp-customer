import React, { useCallback, useMemo, useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import BannerSwiper from '../../../../general/components/BannerSwiper';
import { useTheme } from '../../../../general/theme/theme';
import type {
  DeliveryBanner,
  DeliveryBannerActionType,
  DeliveryNearbyStore,
} from '../../api/types';
import type { DeliveriesStackParamList } from '../../navigation/types';
import SpecialOffersBannerCard from './SpecialOffersBannerCard';
import SpecialOffersBannerSkeleton from './SpecialOffersBannerSkeleton';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTranslation } from 'react-i18next';
import { translateShopTypeName } from '../../utils/shopTypeLocalization';

type Props = {
  banners: DeliveryBanner[];
  isPending: boolean;
  onIndexChange?: (index: number) => void;
  variant?: 'default' | 'home';
};

type BannerActionHandler = (banner: DeliveryBanner) => void;

function resolveBannerHeight(banner: DeliveryBanner, width: number, isHomeVariant: boolean): number {
  if (isHomeVariant) return Math.max(120, width / 3);
  if (banner.bannerImageLink && !banner.title?.trim() && !banner.description?.trim()) return width / 3;
  return 176;
}

function hasBannerDestination(banner: DeliveryBanner): boolean {
  switch (banner.actionType) {
    case 'store':
      return Boolean(banner.relatedStore?.trim() || banner.store?.id?.trim());
    case 'product':
      return Boolean(banner.relatedProduct?.trim() || banner.product?.id?.trim());
    case 'shop_type':
    case 'all_restaurants':
      return Boolean(banner.relatedShopType?.trim() || banner.shopType?.id?.trim());
    default:
      return false;
  }
}

function toStoreNavigationTarget(banner: DeliveryBanner): DeliveryNearbyStore | null {
  const storeId = banner.relatedStore?.trim() || banner.store?.id?.trim() || '';

  if (!storeId) {
    return null;
  }

  return {
    storeId,
    vendorId: '',
    name: banner.title?.trim() || banner.store?.address?.trim() || storeId,
    address: banner.store?.address ?? null,
    coverImage: banner.store?.coverImage ?? null,
    logo: banner.store?.storeImage ?? null,
  };
}

function resolveShopTypeTitle(
  banner: DeliveryBanner,
  t: (key: string) => string,
): string {
  const shopTypeName = banner.shopType?.name?.trim();

  if (shopTypeName) {
    return translateShopTypeName(shopTypeName, t);
  }

  return (
    banner.title?.trim() ||
    banner.relatedShopType?.trim() ||
    banner.shopType?.id?.trim() ||
    ''
  );
}

export default function SpecialOffersBanner({
  banners,
  isPending,
  onIndexChange,
  variant = 'default',
}: Props) {
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const { t } = useTranslation('deliveries');
  const { colors, layout, shape, spacing } = useTheme();
  const { gutter, width } = useWindowClass();
  const [bannerIndex, setBannerIndex] = useState(0);
  const isHomeVariant = variant === 'home';
  const bannerSidePadding = isHomeVariant ? gutter + spacing.sm : gutter;
  const bannerWidth = Math.min(
    width - bannerSidePadding * 2,
    layout.contentMaxWidth.commerce,
  );
  const activeBannerIndex =
    banners.length > 0 ? Math.min(bannerIndex, banners.length - 1) : 0;
  const navigateToStore = useCallback(
    (banner: DeliveryBanner) => {
      const store = toStoreNavigationTarget(banner);

      if (!store) {
        return;
      }

      navigation.navigate('MultiVendor', {
        screen: 'StoreDetails',
        params: { store },
      });
    },
    [navigation],
  );
  const navigateToProduct = useCallback(
    (banner: DeliveryBanner) => {
      const productId = banner.relatedProduct?.trim() || banner.product?.id?.trim() || '';

      if (!productId) {
        return;
      }

      navigation.navigate('ProductInfo', { productId });
    },
    [navigation],
  );
  const navigateToShopType = useCallback(
    (banner: DeliveryBanner) => {
      const shopTypeId = banner.relatedShopType?.trim() || banner.shopType?.id?.trim() || '';

      if (!shopTypeId) {
        return;
      }

      navigation.navigate('SeeAllScreen', {
        queryType: 'shop-type-stores',
        title: resolveShopTypeTitle(banner, t),
        cardType: 'store',
        shopTypeId,
      });
    },
    [navigation, t],
  );
  const navigateToAllRestaurants = useCallback(
    (banner: DeliveryBanner) => {
      const shopTypeId = banner.relatedShopType?.trim() || banner.shopType?.id?.trim();
      if (!shopTypeId) return;
      navigation.navigate('MultiVendor', {
        screen: 'MainSeeAllScreen',
        params: { initialShopTypeId: shopTypeId },
      });
    },
    [navigation],
  );
  const bannerActionHandlers = useMemo<
    Record<DeliveryBannerActionType, BannerActionHandler>
  >(
    () => ({
      store: navigateToStore,
      product: navigateToProduct,
      shop_type: navigateToShopType,
      all_restaurants: navigateToAllRestaurants,
    }),
    [navigateToAllRestaurants, navigateToProduct, navigateToShopType, navigateToStore],
  );
  const handleBannerPress = useCallback(
    (banner: DeliveryBanner) => {
      const actionType = banner.actionType;

      if (!actionType) {
        return;
      }

      bannerActionHandlers[actionType]?.(banner);
    },
    [bannerActionHandlers],
  );

  if (isPending) {
    return <SpecialOffersBannerSkeleton variant={variant} />;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { width: bannerWidth + bannerSidePadding * 2 }]}>
      <BannerSwiper
        data={banners}
        onIndexChange={(index) => {
          setBannerIndex(index);
          onIndexChange?.(index);
        }}
        renderItem={({ item }) => (
          <SpecialOffersBannerCard
            banner={item}
            height={resolveBannerHeight(item, bannerWidth, isHomeVariant)}
            isCompact={isHomeVariant}
            hasPagination={banners.length > 1}
            onPress={hasBannerDestination(item) ? () => handleBannerPress(item) : undefined}
            sidePadding={bannerSidePadding}
            width={bannerWidth}
          />
        )}
      />

      {banners.length > 1 ? (
        <View
          pointerEvents="none"
          style={[
            styles.bannerDots,
            { bottom: spacing.sm, left: bannerSidePadding, right: bannerSidePadding },
          ]}
        >
          <View style={[styles.dotTrack, { backgroundColor: colors.surfaceElevated, borderRadius: shape.radius.pill, gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}>
            {banners.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.bannerDot,
                  index === activeBannerIndex
                    ? styles.bannerDotActive
                    : styles.bannerDotInactive,
                  {
                    backgroundColor: index === activeBannerIndex ? colors.primary : colors.iconDisabled,
                    borderRadius: shape.radius.pill,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  bannerDots: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
  },
  dotTrack: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  bannerDot: {
    height: 6,
  },
  bannerDotActive: {
    width: 19,
  },
  bannerDotInactive: {
    width: 6,
  },
});
