import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PressableScale from '../../../../../general/components/PressableScale';
import Image from '../../../../../general/components/Image';
import Text from '../../../../../general/components/Text';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import { useShopTypes } from '../../../hooks';
import { DiscoveryCategorySection } from '../../../../../general/components/discovery';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import { DeliveriesStackParamList } from '../../../navigation/types';
import { MultiVendorStackParamList } from '../../navigation/types';
import { decodeShopTypeName, translateShopTypeName } from '../../../utils/shopTypeLocalization';

type NavProp = CompositeNavigationProp<
  NativeStackNavigationProp<MultiVendorStackParamList>,
  NativeStackNavigationProp<DeliveriesStackParamList>
>;

export default function ShopTypeList() {
  const { t } = useTranslation('deliveries');
  const { colors, layout, shape, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const navigation = useNavigation<NavProp>();
  const { data: shopTypes = [], isPending } = useShopTypes({ home: true });

  const handleSeeAll = useCallback(() => navigation.navigate('MainSeeAllScreen', { initialShopTypeId: undefined }), [navigation]);
  const handleShopType = useCallback((id: string) => {
    navigation.navigate('MainSeeAllScreen', { initialShopTypeId: id });
  }, [navigation]);

  if (isPending) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (shopTypes.length === 0) return <View style={{ gap: spacing.md, paddingHorizontal: gutter }}>
    <SectionActionHeader title={t('multi_vendor_shop_types_title')} />
    <DeliveriesSectionEmptyState title={t('multi_vendor_shop_types_title')} message={t('multi_vendor_shop_types_empty')} />
  </View>;

  if (shopTypes.length === 0 || shopTypes.length > 2) {
    return (
      <DiscoveryCategorySection
        actionLabel={t('multi_vendor_see_all')}
        items={shopTypes.map((item) => ({ id: item.id, name: translateShopTypeName(item.name, t), imageUrl: item.image ?? null }))}
        isPending={false}
        onActionPress={handleSeeAll}
        onItemPress={(item) => handleShopType(item.id)}
        title={t('multi_vendor_shop_types_title')}
        variant="home"
      />
    );
  }

  return (
    <View style={[styles.section, { maxWidth: layout.contentMaxWidth.commerce, paddingHorizontal: gutter, gap: spacing.md }]}>
      <View style={styles.cards}>
        {shopTypes.map((shopType, index) => {
          const rawName = decodeShopTypeName(shopType.name);
          const name = translateShopTypeName(shopType.name, t);
          const icon: keyof typeof Ionicons.glyphMap = /grocer|market|épicer|super/i.test(rawName) ? 'basket-outline' : /restaur|food|repas/i.test(rawName) ? 'restaurant-outline' : 'storefront-outline';
          const tint = index === 0 ? colors.cardMint : colors.cardPeach;
          const ink = index === 0 ? colors.quickActionOrdersForeground : colors.quickActionDealsForeground;
          const imageUri = shopType.image?.trim();
          return (
            <PressableScale
              key={shopType.id}
              accessibilityRole="button"
              accessibilityLabel={name}
              onPress={() => handleShopType(shopType.id)}
              pressedScale={0.97}
              style={[styles.card, { backgroundColor: tint, borderColor: colors.border, borderRadius: shape.radius.surface }]}
            >
              <Text color={colors.textStrong} weight="bold" variant="cardTitle" numberOfLines={2} style={styles.cardTitle}>{name}</Text>
              <View style={[styles.imageFrame, { backgroundColor: colors.surfaceElevated }]}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} resizeMode="cover" style={styles.image} />
                ) : (
                  <Ionicons name={icon} size={30} color={ink} />
                )}
              </View>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignSelf: 'center', width: '100%' },
  cards: { flexDirection: 'row', gap: 10 },
  card: { alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, flex: 1, flexDirection: 'row', gap: 6, minHeight: 96, minWidth: 0, paddingLeft: 12, paddingRight: 8 },
  cardTitle: { flex: 1, fontSize: 15, lineHeight: 20, minWidth: 0 },
  imageFrame: { alignItems: 'center', borderRadius: 30, height: 60, justifyContent: 'center', overflow: 'hidden', width: 60 },
  image: { height: '100%', width: '100%' },
  loading: { minHeight: 96, justifyContent: 'center' },
});
