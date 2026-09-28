import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryTopBrand } from '../../../api/types';
import TopBrandCard from '../../../components/storeCard/TopBrandCard';
import PressableScale from '../../../../../general/components/PressableScale';

type Props = {
  brand: DeliveryTopBrand;
  onPress: (brand: DeliveryTopBrand) => void;
  isDisabled?: boolean;
};

export default function TopBrandsSeeAllItem({
  brand,
  onPress,
  isDisabled = false,
}: Props) {
  const { colors, shape, typography } = useTheme();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={brand.name}
      disabled={isDisabled}
      onPress={() => onPress(brand)}
      pressedScale={0.98}
      style={[styles.item, { borderRadius: shape.radius.surface }]}
    >
      <TopBrandCard
        brand={brand}
        cardStyle={[styles.card, { borderColor: colors.border }]}
        imageContainerStyle={styles.imageContainer}
        imageResizeMode="cover"
        contentStyle={styles.content}
        badgeStyle={styles.badge}
        titleNumberOfLines={2}
        titleStyle={{
          fontSize: typography.size.md2,
          lineHeight: typography.lineHeight.md2,
        }}
        subtitleStyle={{
          fontSize: typography.size.sm2,
          lineHeight: typography.lineHeight.sm2,
        }}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  badge: {
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    top: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowOpacity: 0,
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  imageContainer: {
    aspectRatio: 1.22,
    height: undefined,
    width: '100%',
  },
  item: {
    flex: 1,
  },
});
