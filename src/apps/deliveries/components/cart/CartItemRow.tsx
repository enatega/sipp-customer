import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Image from '../../../../general/components/Image';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { CartItem } from '../../api/cartServiceTypes';
import { formatCartPrice, getCartItemSubtitle } from './cartUtils';

type Props = {
  isLast?: boolean;
  item: CartItem;
  isUpdating?: boolean;
  onPendingChange?: (itemId: string, isPending: boolean) => void;
  onSetQuantity: (quantity: number) => Promise<void>;
  onRemove: () => void;
};

const QUANTITY_SYNC_DEBOUNCE_MS = 500;

export default function CartItemRow({
  isLast = false,
  item,
  isUpdating = false,
  onPendingChange,
  onSetQuantity,
  onRemove,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const subtitle = getCartItemSubtitle(item);
  const [hasImageError, setHasImageError] = React.useState(false);
  const [localQuantity, setLocalQuantity] = React.useState(item.quantity);
  const desiredQuantityRef = React.useRef(item.quantity);
  const inflightQuantityRef = React.useRef<number | null>(null);
  const queuedQuantityRef = React.useRef<number | null>(null);
  const isSyncingRef = React.useRef(false);
  const debounceTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPendingRef = React.useRef(false);
  const displayedLineTotal = item.unitPrice * localQuantity;
  const hasPendingState = isUpdating || localQuantity !== item.quantity;

  const clearDebounceTimeout = React.useCallback(() => {
    if (!debounceTimeoutRef.current) return;
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = null;
  }, []);

  const flushQuantity = React.useCallback(
    async (targetQuantity: number) => {
      if (targetQuantity < 1 || targetQuantity === item.quantity) return;

      isSyncingRef.current = true;
      inflightQuantityRef.current = targetQuantity;

      try {
        await onSetQuantity(targetQuantity);
      } finally {
        isSyncingRef.current = false;
        const queuedQuantity = queuedQuantityRef.current;
        if (queuedQuantity != null && queuedQuantity !== targetQuantity) {
          queuedQuantityRef.current = null;
          void flushQuantity(queuedQuantity);
        }
      }
    },
    [item.quantity, onSetQuantity],
  );

  const scheduleQuantitySync = React.useCallback(() => {
    clearDebounceTimeout();
    debounceTimeoutRef.current = setTimeout(() => {
      const targetQuantity = desiredQuantityRef.current;
      if (isSyncingRef.current) {
        queuedQuantityRef.current = targetQuantity;
        return;
      }
      void flushQuantity(targetQuantity);
    }, QUANTITY_SYNC_DEBOUNCE_MS);
  }, [clearDebounceTimeout, flushQuantity]);

  React.useEffect(() => {
    const desiredQuantity = desiredQuantityRef.current;
    const inflightQuantity = inflightQuantityRef.current;

    if (item.quantity === desiredQuantity) {
      desiredQuantityRef.current = item.quantity;
      inflightQuantityRef.current = null;
      setLocalQuantity(item.quantity);
      return;
    }
    if (inflightQuantity === item.quantity) return;

    desiredQuantityRef.current = item.quantity;
    inflightQuantityRef.current = null;
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  React.useEffect(() => () => clearDebounceTimeout(), [clearDebounceTimeout]);

  React.useEffect(() => {
    if (!onPendingChange || lastPendingRef.current === hasPendingState) return;
    lastPendingRef.current = hasPendingState;
    onPendingChange(item.id, hasPendingState);
  }, [hasPendingState, item.id, onPendingChange]);

  React.useEffect(
    () => () => {
      if (onPendingChange && lastPendingRef.current) onPendingChange(item.id, false);
    },
    [item.id, onPendingChange],
  );

  const updateLocalQuantity = React.useCallback(
    (nextQuantity: number) => {
      desiredQuantityRef.current = nextQuantity;
      setLocalQuantity(nextQuantity);
      scheduleQuantitySync();
    },
    [scheduleQuantitySync],
  );

  const handleRemove = React.useCallback(() => {
    clearDebounceTimeout();
    desiredQuantityRef.current = item.quantity;
    inflightQuantityRef.current = null;
    queuedQuantityRef.current = null;
    onRemove();
  }, [clearDebounceTimeout, item.quantity, onRemove]);

  const imageUri = item.imageUrl?.trim();

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
      {imageUri && !hasImageError ? (
        <Image
          accessibilityLabel={item.name}
          onError={() => setHasImageError(true)}
          resizeMode="cover"
          source={{ uri: imageUri }}
          style={[styles.image, { borderRadius: shape.radius.control }]}
        />
      ) : (
        <View
          style={[
            styles.imageFallback,
            {
              backgroundColor: colors.primarySoft,
              borderRadius: shape.radius.control,
            },
          ]}
        >
          <MaterialCommunityIcons color={colors.primary} name="food-outline" size={30} />
        </View>
      )}

      <View style={[styles.details, { gap: spacing.md }]}>
        <View style={[styles.copy, { gap: spacing.xs }]}>
          <View style={styles.titleRow}>
            <Text numberOfLines={2} style={styles.title} variant="cardTitle" weight="bold">
              {item.name}
            </Text>
            {hasPendingState ? <ActivityIndicator color={colors.primary} size="small" /> : null}
          </View>
          {subtitle ? (
            <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
              {subtitle}
            </Text>
          ) : null}
          {!item.inStock ? (
            <View
              style={[
                styles.unavailableBadge,
                {
                  backgroundColor: colors.dangerSoft,
                  borderRadius: shape.radius.pill,
                },
              ]}
            >
              <Text color={colors.danger} variant="badge" weight="bold">
                {t('cart_item_unavailable')}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.controlsRow}>
          <Text style={styles.price} variant="numeric" weight="bold">
            {formatCartPrice(displayedLineTotal)}
          </Text>

          <View
            style={[
              styles.quantityControls,
              {
                backgroundColor: colors.surfaceSunken,
                borderRadius: shape.radius.pill,
              },
            ]}
          >
            <PressableScale
              accessibilityLabel={localQuantity > 1 ? t('cart_decrement_item') : t('cart_remove_item')}
              accessibilityRole="button"
              onPress={localQuantity > 1 ? () => updateLocalQuantity(localQuantity - 1) : handleRemove}
              style={[
                styles.quantityButton,
                {
                  borderRadius: shape.radius.pill,
                  height: layout.touchTarget.minimum,
                  width: layout.touchTarget.minimum,
                },
              ]}
            >
              <Ionicons
                color={localQuantity > 1 ? colors.text : colors.danger}
                name={localQuantity > 1 ? 'remove' : 'trash-outline'}
                size={17}
              />
            </PressableScale>
            <Text style={styles.quantity} variant="label" weight="bold">
              {localQuantity}
            </Text>
            <PressableScale
              accessibilityLabel={t('cart_increment_item')}
              accessibilityRole="button"
              accessibilityState={{ disabled: !item.inStock }}
              disabled={!item.inStock}
              onPress={() => updateLocalQuantity(localQuantity + 1)}
              style={[
                styles.quantityButton,
                {
                  backgroundColor: colors.primary,
                  borderRadius: shape.radius.pill,
                  height: layout.touchTarget.minimum,
                  width: layout.touchTarget.minimum,
                },
              ]}
            >
              <Ionicons color={colors.onPrimary} name="add" size={19} />
            </PressableScale>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  controlsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  image: {
    height: 88,
    width: 88,
  },
  imageFallback: {
    alignItems: 'center',
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  price: {
    flexShrink: 1,
    fontVariant: ['tabular-nums'],
  },
  quantity: {
    minWidth: 22,
    textAlign: 'center',
  },
  quantityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  quantityControls: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  unavailableBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
