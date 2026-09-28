import React from 'react';
import SharedSpecialOffersBanner from '../../../components/specialOffersBanner/SpecialOffersBanner';
import { useMobileBanners } from '../../../hooks';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';

export default function SpecialOffersBanner() {
  const { t } = useTranslation('deliveries');
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { data: banners = [], isPending } = useMobileBanners();
  if (!isPending && banners.length === 0) return <View style={{ gap: spacing.md, paddingHorizontal: gutter }}>
    <SectionActionHeader title={t('multi_vendor_special_offers_title')} />
    <DeliveriesSectionEmptyState title={t('home_no_deals_title')} message={t('home_no_deals_message')} variant="offers" />
  </View>;

  return (
    <SharedSpecialOffersBanner
      banners={banners}
      isPending={isPending}
      variant="home"
    />
  );
}
