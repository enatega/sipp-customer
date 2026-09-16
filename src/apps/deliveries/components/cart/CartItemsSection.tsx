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
  onRemoveItem: (itemId: string) => void;
};

export default function CartItemsSection({
  isUpdatingItemId,
  items,
  onAddMorePress,
  onItemPendingChange,
  onSetItemQuantity,
  onRemoveItem,
}: Props) {
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <View style={styles.headingRow}>
        <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
          {t('cart_items_title')}
        </Text>
        <View
          style={[
            styles.itemCount,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: shape.radius.pill,
            },
          ]}
        >
          <Text color={colors.primary} variant="caption" weight="bold">
            {items.length}
          </Text>
        </View>
      </View>

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
              gap: spacing.md,
              minHeight: layout.touchTarget.comfortable,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          <View
            style={[
              styles.addIcon,
              {
                backgroundColor: colors.primarySoft,
                borderRadius: shape.radius.pill,
              },
            ]}
          >
            <Ionicons color={colors.primary} name="add" size={19} />
          </View>
          <Text style={styles.addLabel} variant="label" weight="semiBold">
            {t('cart_add_more')}
          </Text>
          <Ionicons color={colors.textSubtle} name="chevron-forward" size={18} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addIcon: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  addLabel: {
    flex: 1,
  },
  addMoreButton: {
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  container: {
    width: '100%',
  },
  headingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemCount: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 26,
    minWidth: 26,
    paddingHorizontal: 8,
  },
  surface: {
    width: '100%',
  },
});
