import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import { useShopTypes } from '../../../hooks';
import { DiscoveryCategorySection } from '../../../../../general/components/discovery';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import { DeliveriesStackParamList } from '../../../navigation/types';
import { MultiVendorStackParamList } from '../../navigation/types';
import { translateShopTypeName } from '../../../utils/shopTypeLocalization';
import ShopTypeFeatureCard from './ShopTypeFeatureCard';

type NavProp = CompositeNavigationProp<
  NativeStackNavigationProp<MultiVendorStackParamList>,
  NativeStackNavigationProp<DeliveriesStackParamList>
>;

export default function ShopTypeList() {
  const { t } = useTranslation('deliveries');
  const { colors, layout, spacing } = useTheme();
  const { gutter, width, fontScale } = useWindowClass();
  const navigation = useNavigation<NavProp>();
  const { data: shopTypes = [], isPending } = useShopTypes({ home: true });
  const contentWidth = Math.min(width, layout.contentMaxWidth.commerce) - gutter * 2;
  const isTwoColumn = contentWidth >= 280 && fontScale < 1.6;
  const cardWidth = isTwoColumn ? (contentWidth - spacing.md) / 2 : contentWidth;
  const compactCard = isTwoColumn && cardWidth < 270;

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

  if (shopTypes.length !== 2) {
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
    <View style={[styles.section, { maxWidth: layout.contentMaxWidth.commerce, paddingHorizontal: gutter }]}>
      <View style={[styles.cards, { flexDirection: isTwoColumn ? 'row' : 'column', gap: spacing.md }]}>
        {shopTypes.map((shopType, index) => (
          <ShopTypeFeatureCard
            key={shopType.id}
            shopType={shopType}
            fallbackTone={index === 0 ? 'grocery' : 'restaurant'}
            isTwoColumn={isTwoColumn}
            compactCard={compactCard}
            cardWidth={cardWidth}
            onPress={() => handleShopType(shopType.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignSelf: 'center', width: '100%' },
  cards: { width: '100%' },
  loading: { minHeight: 96, justifyContent: 'center' },
});
