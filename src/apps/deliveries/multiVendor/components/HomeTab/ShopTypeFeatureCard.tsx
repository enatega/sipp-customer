import React from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Image from '../../../../../general/components/Image';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryShopType } from '../../../api/types';
import { decodeShopTypeName, translateShopTypeName } from '../../../utils/shopTypeLocalization';

type Tone = 'grocery' | 'restaurant';

type Props = {
  shopType: DeliveryShopType;
  fallbackTone: Tone;
  isTwoColumn: boolean;
  compactCard: boolean;
  cardWidth: number;
  onPress: () => void;
};

const groceryArtwork = require('../../assets/shopTypes/grocery.png');
const restaurantArtwork = require('../../assets/shopTypes/restaurant.png');

export default function ShopTypeFeatureCard({ shopType, fallbackTone, isTwoColumn, compactCard, cardWidth, onPress }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors, layout, shape, spacing } = useTheme();
  const { fontScale } = useWindowClass();
  const largeText = fontScale >= 1.3;
  const name = translateShopTypeName(shopType.name, t);
  const identity = `${shopType.slug ?? ''} ${decodeShopTypeName(shopType.name)}`.toLocaleLowerCase('en');
  const kind = /grocer|market|supermerc|épicer|epicer|lebensmittel|بقالة/.test(identity)
    ? 'grocery'
    : /restaur|food|meal|repas|مطعم/.test(identity)
      ? 'restaurant'
      : null;
  const tone = kind ?? fallbackTone;
  const isGrocery = tone === 'grocery';
  const ink = isGrocery ? colors.shopTypeGroceryInk : colors.shopTypeRestaurantInk;
  const actionInk = isGrocery ? colors.shopTypeGroceryActionInk : colors.shopTypeRestaurantActionInk;
  const gradientColors: [string, string] = isGrocery
    ? [colors.shopTypeGroceryStart, colors.shopTypeGroceryEnd]
    : [colors.shopTypeRestaurantStart, colors.shopTypeRestaurantEnd];
  const imageUri = shopType.image?.trim();
  const artworkWidth = cardWidth * (compactCard ? 0.74 : largeText ? 0.53 : 0.72);
  const artworkHeight = artworkWidth / (kind === 'grocery' ? 900 / 534 : 900 / 501);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={t('shop_type_browse_accessibility', { name })}
      onPress={onPress}
      pressedScale={0.98}
      style={[
        styles.card,
        {
          borderRadius: shape.radius.hero,
          flex: isTwoColumn ? 1 : undefined,
          height: compactCard ? (largeText ? 152 : 120) : undefined,
          minHeight: compactCard ? undefined : largeText ? 192 : 168,
          width: isTwoColumn ? undefined : '100%',
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: I18nManager.isRTL ? 1 : 0, y: 0.5 }}
        end={{ x: I18nManager.isRTL ? 0 : 1, y: 0.5 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />
      {kind ? (
        <Image
          source={kind === 'grocery' ? groceryArtwork : restaurantArtwork}
          resizeMode="contain"
          style={[
            styles.artwork,
            compactCard && styles.artworkCompact,
            largeText && !compactCard && styles.artworkLargeText,
            { width: artworkWidth, height: artworkHeight },
          ]}
        />
      ) : imageUri ? (
        <Image source={{ uri: imageUri }} resizeMode="cover" style={[styles.fallbackImage, compactCard && styles.fallbackCompact]} />
      ) : (
        <View style={[styles.fallbackIcon, compactCard && styles.fallbackCompact]}>
          <Ionicons name="storefront-outline" size={compactCard ? 48 : 64} color={ink} />
        </View>
      )}
      <View style={[
        styles.copy,
        compactCard ? styles.copyCompact : largeText && styles.copyLargeText,
        { gap: compactCard ? spacing.sm : spacing.xl, padding: compactCard ? spacing.md : spacing.xl },
      ]}>
        <Text
          color={ink}
          variant={compactCard ? 'cardTitle' : 'sectionTitle'}
          weight="extraBold"
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          maxFontSizeMultiplier={1.5}
        >
          {name}
        </Text>
        {compactCard ? (
          <View style={[styles.compactAction, { backgroundColor: colors.shopTypeActionSurface, borderRadius: shape.radius.pill }]}>
            <Ionicons name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'} size={18} color={actionInk} />
          </View>
        ) : (
          <View style={[styles.action, { backgroundColor: colors.shopTypeActionSurface, borderRadius: shape.radius.pill, gap: spacing.sm, minHeight: layout.touchTarget.compact, paddingHorizontal: spacing.lg }]}>
            <Text color={actionInk} variant="label" weight="bold" maxFontSizeMultiplier={1.5}>
              {t('shop_type_browse_action')}
            </Text>
            <Ionicons name={I18nManager.isRTL ? 'arrow-back' : 'arrow-forward'} size={18} color={actionInk} />
          </View>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
  },
  artwork: {
    bottom: -6,
    position: 'absolute',
    end: -4,
  },
  artworkCompact: { end: -3 },
  artworkLargeText: { opacity: 0.65 },
  fallbackImage: {
    borderRadius: 999,
    height: 120,
    position: 'absolute',
    end: 16,
    width: 120,
  },
  fallbackIcon: {
    alignItems: 'center',
    height: 120,
    justifyContent: 'center',
    opacity: 0.35,
    position: 'absolute',
    end: 16,
    width: 120,
  },
  fallbackCompact: { bottom: -8, end: 6, height: 80, width: 80 },
  copy: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    width: '60%',
    zIndex: 1,
  },
  copyLargeText: { width: '68%' },
  copyCompact: {
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  compactAction: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
