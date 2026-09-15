import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../../../general/theme/theme';
import { DiscoveryCategoryCard } from '../discovery';
import type { DeliveryDiscoveryCategoryItem } from '../discovery';

type Props = {
  item: DeliveryDiscoveryCategoryItem;
  onPress: (item: DeliveryDiscoveryCategoryItem) => void;
  size: number;
};

export default function CategorySeeAllGridItem({ item, onPress, size }: Props) {
  const { shape, typography } = useTheme();

  return (
    <DiscoveryCategoryCard
      imageUrl={item.imageUrl}
      title={item.name}
      onPress={() => onPress(item)}
      containerStyle={[styles.cardContainer, { width: size }]}
      imageWrapStyle={[
        styles.imageWrap,
        { borderRadius: shape.radius.surface, height: size, width: size },
      ]}
      imageStyle={[styles.image, { borderRadius: shape.radius.control }]}
      titleStyle={{
        fontSize: typography.size.sm2,
        lineHeight: typography.lineHeight.md,
      }}
    />
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    gap: 10,
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageWrap: {
    padding: 12,
  },
});
