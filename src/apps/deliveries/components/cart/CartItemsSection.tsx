import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { CartItem } from '../../api/cartServiceTypes';
import CartItemRow from './CartItemRow';

type Props = {
  isUpdatingItemId?: string | null;
  items: CartItem[];
  onAddMorePress: () => void;
  onItemPendingChange?: (itemId: string, isPending: boolean) => void;
  onSetItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  onSetItemNote: (itemId: string, note: string) => Promise<void>;
  onRemoveItem: (itemId: string) => void;
};

export default function CartItemsSection({
  isUpdatingItemId,
  items,
  onAddMorePress,
  onItemPendingChange,
  onSetItemQuantity,
  onSetItemNote,
  onRemoveItem,
}: Props) {
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
        {t('cart_items_title')}
      </Text>

      <View
        style={[
          styles.surface,
          elevation.subtle,
          {
            backgroundColor: colors.surface,
            borderRadius: shape.radius.surface,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        {items.map((item, index) => (
          <CartItemRow
            isLast={index === items.length - 1}
            key={item.id}
            isUpdating={isUpdatingItemId === item.id}
            item={item}
            onPendingChange={onItemPendingChange}
            onSetQuantity={(quantity) => onSetItemQuantity(item.id, quantity)}
            onSetNote={(note) => onSetItemNote(item.id, note)}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}

        <PressableScale
          accessibilityRole="button"
          onPress={onAddMorePress}
          style={[
            styles.addMoreButton,
            {
              borderTopColor: colors.divider,
              borderTopWidth: StyleSheet.hairlineWidth,
              gap: spacing.sm,
              minHeight: layout.touchTarget.comfortable,
              paddingVertical: spacing.md,
            },
          ]}
        >
          <Ionicons color={colors.primary} name="add" size={20} />
          <Text color={colors.primary} style={styles.addLabel} variant="label" weight="semiBold">
            {t('cart_add_more')}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addLabel: {
    flex: 1,
  },
  addMoreButton: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    width: '100%',
  },
  surface: {
    width: '100%',
  },
});
