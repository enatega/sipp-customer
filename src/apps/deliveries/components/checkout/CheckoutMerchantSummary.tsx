import React from 'react';
import { StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import Image from '../../../../general/components/Image';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { CheckoutPreviewResponse } from '../../api/orderServiceTypes';

type Props = {
  preview: CheckoutPreviewResponse | null;
};

export default function CheckoutMerchantSummary({ preview }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, shape, spacing } = useTheme();
  const [hasImageError, setHasImageError] = React.useState(false);
  const imageUrl = preview?.store.logo?.trim() || preview?.store.image?.trim() || null;

  React.useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (!preview) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primarySoft,
          borderRadius: shape.radius.surface,
          gap: spacing.md,
          padding: spacing.md,
        },
      ]}
    >
      {imageUrl && !hasImageError ? (
        <Image
          accessibilityLabel={preview.store.name}
          onError={() => setHasImageError(true)}
          resizeMode="cover"
          source={{ uri: imageUrl }}
          style={[styles.logo, { borderRadius: shape.radius.control }]}
        />
      ) : (
        <View
          style={[
            styles.logoFallback,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: shape.radius.control,
            },
          ]}
        >
          <MaterialCommunityIcons color={colors.primary} name="storefront-outline" size={25} />
        </View>
      )}

      <View style={[styles.copy, { gap: spacing.xs }]}>
        <Text color={colors.textSubtle} variant="caption" weight="medium">
          {t('checkout_order_from')}
        </Text>
        <Text numberOfLines={1} variant="cardTitle" weight="bold">
          {preview.store.name}
        </Text>
        <Text color={colors.textSubtle} numberOfLines={1} variant="caption">
          {t('checkout_item_count', { count: preview.bucket.itemCount })}
        </Text>
      </View>

      <View
        style={[
          styles.secureIcon,
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: shape.radius.pill,
          },
        ]}
      >
        <MaterialCommunityIcons color={colors.primary} name="shield-check-outline" size={21} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  logo: {
    height: 58,
    width: 58,
  },
  logoFallback: {
    alignItems: 'center',
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  secureIcon: {
    alignItems: 'center',
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
