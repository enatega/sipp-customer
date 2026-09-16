import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../../../general/components/Button';
import BottomSheetHandle from '../../../../general/components/BottomSheetHandle';
import PressableScale from '../../../../general/components/PressableScale';
import SwipeableBottomSheet from '../../../../general/components/SwipeableBottomSheet';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import { formatCartPrice } from './cartUtils';

type Props = {
  currentSubtotal: number;
  deliveryFee?: number | null;
  minimumOrder?: number | null;
  onClose: () => void;
  visible: boolean;
};

export default function CartFeeInfoModal({
  currentSubtotal,
  deliveryFee,
  minimumOrder,
  onClose,
  visible,
}: Props) {
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const expandedHeight = Math.min(height * 0.54, 480) + insets.bottom;

  if (!visible) return null;

  const facts = [
    {
      icon: 'basket-outline' as const,
      label: t('cart_fee_modal_current_subtotal'),
      value: formatCartPrice(currentSubtotal),
    },
    minimumOrder && minimumOrder > 0
      ? {
          icon: 'shopping-outline' as const,
          label: t('cart_fee_modal_minimum_order'),
          value: formatCartPrice(minimumOrder),
        }
      : null,
    typeof deliveryFee === 'number'
      ? {
          icon: 'bike-fast' as const,
          label: t('cart_fee_modal_base_delivery'),
          value: formatCartPrice(deliveryFee),
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: 'basket-outline' | 'shopping-outline' | 'bike-fast';
    label: string;
    value: string;
  }>;

  return (
    <View pointerEvents="box-none" style={[styles.modalRoot, { zIndex: layout.layer.modal }]}>
      <Pressable
        accessibilityLabel={t('store_details_close')}
        accessibilityRole="button"
        onPress={onClose}
        style={[styles.overlay, { backgroundColor: colors.scrim }]}
      />

      <SwipeableBottomSheet
        collapsedHeight={0}
        expandedHeight={expandedHeight}
        handle={<BottomSheetHandle color={colors.border} />}
        initialState="expanded"
        modal
        onStateChange={(state) => {
          if (state === 'collapsed') onClose();
        }}
        style={[
          styles.sheet,
          elevation.overlay,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: shape.radius.sheet,
            borderTopRightRadius: shape.radius.sheet,
          },
        ]}
      >
        <View
          style={[
            styles.content,
            {
              gap: spacing.xl,
              paddingBottom: insets.bottom + spacing.xl,
              paddingHorizontal: spacing.xl,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={{ width: layout.touchTarget.minimum }} />
            <Text numberOfLines={1} style={styles.headerTitle} variant="sectionTitle" weight="bold">
              {t('cart_fee_modal_title')}
            </Text>
            <PressableScale
              accessibilityLabel={t('store_details_close')}
              accessibilityRole="button"
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.surfaceSunken,
                  borderRadius: shape.radius.pill,
                  height: layout.touchTarget.minimum,
                  width: layout.touchTarget.minimum,
                },
              ]}
            >
              <MaterialCommunityIcons color={colors.text} name="close" size={20} />
            </PressableScale>
          </View>

          <View style={[styles.factList, { borderColor: colors.border, borderRadius: shape.radius.surface }]}>
            {facts.map((fact, index) => (
              <View
                key={fact.label}
                style={[
                  styles.factRow,
                  {
                    borderBottomColor: colors.divider,
                    borderBottomWidth: index === facts.length - 1 ? 0 : StyleSheet.hairlineWidth,
                    gap: spacing.md,
                    minHeight: layout.touchTarget.comfortable,
                    paddingHorizontal: spacing.lg,
                  },
                ]}
              >
                <MaterialCommunityIcons color={colors.primary} name={fact.icon} size={20} />
                <Text color={colors.textSubtle} style={styles.factLabel} variant="body">
                  {fact.label}
                </Text>
                <Text variant="body" weight="semiBold">
                  {fact.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.notice, { backgroundColor: colors.primarySoft, borderRadius: shape.radius.control, gap: spacing.md, padding: spacing.lg }]}>
            <MaterialCommunityIcons color={colors.primary} name="information-outline" size={21} />
            <Text color={colors.textSubtle} style={styles.noticeCopy} variant="supporting">
              {t('cart_fee_modal_checkout_notice')}
            </Text>
          </View>

          <Button fullWidth label={t('store_details_close')} onPress={onClose} />
        </View>
      </SwipeableBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    paddingTop: 4,
  },
  factLabel: {
    flex: 1,
  },
  factList: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  factRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  modalRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  notice: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  noticeCopy: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    paddingTop: 12,
  },
});
