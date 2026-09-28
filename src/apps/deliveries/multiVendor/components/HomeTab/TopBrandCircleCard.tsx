import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import Image from '../../../../../general/components/Image';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryTopBrand } from '../../../api/types';

type Props = {
  brand: DeliveryTopBrand;
  isDisabled: boolean;
  onPress: () => void;
};

export default function TopBrandCircleCard({ brand, isDisabled, onPress }: Props) {
  const { colors, shape, spacing, typography } = useTheme();
  const imageUri = brand.logo?.trim();

  return (
    <PressableScale
      accessibilityLabel={brand.name}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      pressedScale={0.95}
      style={[styles.card, { gap: spacing.xs }]}
    >
      <View
        style={[
          styles.imageFrame,
          {
            backgroundColor: colors.surfaceSoft,
            borderColor: colors.border,
            borderRadius: shape.radius.pill,
          },
        ]}
      >
        {imageUri ? (
          <Image
            resizeMode="cover"
            source={{ uri: imageUri }}
            style={styles.image}
          />
        ) : (
          <Ionicons name="storefront-outline" size={30} color={colors.iconMuted} />
        )}
      </View>
      <Text
        color={colors.textStrong}
        numberOfLines={2}
        style={[styles.name, typography.role.caption]}
        variant="label"
        weight="semiBold"
      >
        {brand.name}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    width: 90,
  },
  imageFrame: {
    alignItems: 'center',
    borderWidth: 1,
    height: 82,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 82,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  name: {
    minHeight: 32,
    textAlign: 'center',
    width: '100%',
  },
});
