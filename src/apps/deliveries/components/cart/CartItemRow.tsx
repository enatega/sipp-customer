import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Image from '../../../../general/components/Image';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { CartItem } from '../../api/cartServiceTypes';
import { useProductInfo } from '../../hooks/useProductInfo';
import { getLocalizedProductName } from '../../utils/productTranslation';
import { formatCartPrice, getCartItemSubtitle } from './cartUtils';
import { useCartItemDraft } from './useCartItemDraft';
import { styles } from './CartItemRow.styles';

type Props = {
  isLast?: boolean;
  item: CartItem;
  isUpdating?: boolean;
  onPendingChange?: (itemId: string, isPending: boolean) => void;
  onSetQuantity: (quantity: number) => Promise<void>;
  onSetNote: (note: string) => Promise<void>;
  onRemove: () => void;
};

export default function CartItemRow({
  isLast = false,
  item,
  isUpdating = false,
  onPendingChange,
  onSetQuantity,
  onSetNote,
  onRemove,
}: Props) {
  const { colors, isDark, layout, shape, spacing, typography } = useTheme();
  const { t, i18n } = useTranslation('deliveries');
  const languageCode = i18n.language.trim().toLowerCase().split('-')[0];
  const hasSelectedTranslation = Boolean(item.nameTranslations?.[languageCode]?.trim());
  const { data: productInfo } = useProductInfo(item.productId, {
    enabled: !hasSelectedTranslation && item.productId.length > 0,
  });
  const localizedName = getLocalizedProductName(
    {
      name: productInfo?.name ?? item.name,
      nameTranslations: productInfo?.nameTranslations ?? item.nameTranslations,
    },
    i18n.language,
  );
  const subtitle = getCartItemSubtitle(item);
  const [hasImageError, setHasImageError] = React.useState(false);
  const { changeNote, discardDrafts, isQuantitySaving, note, quantity, setQuantity } = useCartItemDraft({
    item,
    isUpdating,
    onPendingChange,
    onSetNote,
    onSetQuantity,
  });
  const imageUri = item.imageUrl?.trim();
  const quantityControlStyle = {
    height: layout.touchTarget.minimum,
    width: layout.touchTarget.minimum,
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: colors.divider,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          gap: spacing.md,
          paddingVertical: spacing.lg,
        },
      ]}
    >
      <View style={[styles.productRow, { gap: spacing.md }]}>
        {imageUri && !hasImageError ? (
          <Image
            accessibilityLabel={localizedName}
            onError={() => setHasImageError(true)}
            resizeMode="cover"
            source={{ uri: imageUri }}
            style={[styles.image, { borderRadius: shape.radius.control }]}
          />
        ) : (
          <View
            style={[
              styles.imageFallback,
              { backgroundColor: colors.primarySoft, borderRadius: shape.radius.control },
            ]}
          >
            <MaterialCommunityIcons color={colors.primary} name="food-outline" size={28} />
          </View>
        )}

        <View style={[styles.productDetails, { gap: spacing.xs }]}>
          <Text numberOfLines={2} variant="cardTitle" weight="bold">
            {localizedName}
          </Text>
          {subtitle ? (
            <Text color={colors.textSubtle} numberOfLines={3} variant="caption">
              {subtitle}
            </Text>
          ) : null}
          {!item.inStock ? (
            <View
              style={[
                styles.unavailableBadge,
                { backgroundColor: colors.dangerSoft, borderRadius: shape.radius.pill },
              ]}
            >
              <Text color={colors.danger} variant="badge" weight="bold">
                {t('cart_item_unavailable')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.noteField,
          {
            backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceSoft,
            borderColor: colors.divider,
            borderRadius: shape.radius.control,
          },
        ]}
      >
        <Ionicons
          color={colors.textSubtle}
          name="chatbubble-ellipses-outline"
          size={18}
          style={styles.noteIcon}
        />
        <TextInput
          accessibilityLabel={t('cart_item_instructions')}
          maxLength={500}
          multiline
          onChangeText={changeNote}
          placeholder={t('cart_item_instructions_placeholder')}
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.noteInput,
            { color: colors.text, fontSize: typography.size.sm2, lineHeight: typography.lineHeight.md },
          ]}
          textAlignVertical="top"
          value={note}
        />
      </View>

      <View style={styles.controlsRow}>
        <Text style={styles.price} variant="numeric" weight="bold">
          {formatCartPrice(item.unitPrice * quantity)}
        </Text>
        <View
          style={[
            styles.quantityControls,
            {
              backgroundColor: colors.surfaceSunken,
              borderColor: colors.border,
              borderRadius: shape.radius.pill,
            },
          ]}
        >
          <PressableScale
            accessibilityLabel={quantity > 1 ? t('cart_decrement_item') : t('cart_remove_item')}
            accessibilityRole="button"
            accessibilityState={{ disabled: isQuantitySaving }}
            disabled={isQuantitySaving}
            onPress={quantity > 1
              ? () => setQuantity((current) => current - 1)
              : () => {
                  discardDrafts();
                  onRemove();
                }}
            style={[styles.quantityButton, quantityControlStyle]}
          >
            <Ionicons
              color={quantity > 1 ? colors.text : colors.danger}
              name={quantity > 1 ? 'remove' : 'trash-outline'}
              size={18}
              style={isQuantitySaving ? styles.dulledIcon : undefined}
            />
          </PressableScale>
          <Text style={styles.quantity} variant="label" weight="bold">
            {quantity}
          </Text>
          <PressableScale
            accessibilityLabel={t('cart_increment_item')}
            accessibilityRole="button"
            accessibilityState={{ disabled: isQuantitySaving || !item.inStock }}
            disabled={isQuantitySaving || !item.inStock}
            onPress={() => setQuantity((current) => current + 1)}
            style={[styles.quantityButton, quantityControlStyle]}
          >
            <Ionicons
              color={colors.primary}
              name="add"
              size={20}
              style={isQuantitySaving || !item.inStock ? styles.dulledIcon : undefined}
            />
          </PressableScale>
        </View>
      </View>
    </View>
  );
}
