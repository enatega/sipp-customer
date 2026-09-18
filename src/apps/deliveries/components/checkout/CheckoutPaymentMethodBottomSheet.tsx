import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BottomSheetHandle from '../../../../general/components/BottomSheetHandle';
import Button from '../../../../general/components/Button';
import PressableScale from '../../../../general/components/PressableScale';
import SwipeableBottomSheet from '../../../../general/components/SwipeableBottomSheet';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import type { WalletSavedCard } from '../../../../general/api/walletSavedCardsService';
import type { CheckoutPaymentMethod } from '../../api/orderServiceTypes';
import {
  getCheckoutPaymentMethodSubtitle,
  getCheckoutPaymentMethodTitle,
} from './checkoutPaymentUtils';

type Props = {
  isCardEnabled: boolean;
  isWalletEnabled: boolean;
  walletBalance: number;
  currencyLabel: string;
  isVisible: boolean;
  isSavingCardSelection?: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: CheckoutPaymentMethod) => void;
  onManageCards: () => void;
  onSelectCard: (cardId: string) => void;
  savedCards: WalletSavedCard[];
  selectedCardId?: string | null;
  selectedMethod: CheckoutPaymentMethod;
};

type PaymentOptionProps = {
  description: string;
  disabled: boolean;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

function PaymentOption({
  description,
  disabled,
  icon,
  isSelected,
  label,
  onPress,
}: PaymentOptionProps) {
  const { colors, layout, shape, spacing } = useTheme();

  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected: isSelected }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.option,
        {
          backgroundColor: isSelected ? colors.primarySoft : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          borderRadius: shape.radius.surface,
          gap: spacing.md,
          minHeight: layout.touchTarget.comfortable + 16,
          padding: spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          {
            backgroundColor: isSelected ? colors.surfaceElevated : colors.surfaceSunken,
            borderRadius: shape.radius.control,
          },
        ]}
      >
        <Ionicons color={isSelected ? colors.primary : colors.text} name={icon} size={21} />
      </View>
      <View style={[styles.optionText, { gap: spacing.xs }]}>
        <Text numberOfLines={1} variant="label" weight="semiBold">
          {label}
        </Text>
        <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
          {description}
        </Text>
      </View>
      <Ionicons
        color={isSelected ? colors.primary : colors.iconDisabled}
        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
        size={21}
      />
    </PressableScale>
  );
}

export default function CheckoutPaymentMethodBottomSheet({
  isCardEnabled,
  isWalletEnabled,
  walletBalance,
  currencyLabel,
  isVisible,
  isSavingCardSelection = false,
  onClose,
  onConfirm,
  onManageCards,
  onSelectCard,
  savedCards,
  selectedCardId,
  selectedMethod,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const [draftMethod, setDraftMethod] = React.useState<CheckoutPaymentMethod>(selectedMethod);
  const hasSavedCards = savedCards.length > 0;
  const visibleCardCount = draftMethod === 'stripe' ? savedCards.length + 1 : 0;
  const estimatedContentHeight = 116
    + (2 * 84)
    + (visibleCardCount > 0 ? Math.min(visibleCardCount, 4) * 58 + spacing.md : 0)
    + 88
    + Math.max(insets.bottom, spacing.lg);
  const sheetHeight = Math.min(Math.max(estimatedContentHeight, 430), Math.min(height * 0.84, 640));
  const horizontalInset = width > layout.contentMaxWidth.readable
    ? (width - layout.contentMaxWidth.readable) / 2
    : 0;
  const isConfirmDisabled = (draftMethod === 'stripe' && (!isCardEnabled || !selectedCardId))
    || (draftMethod === 'wallet' && !isWalletEnabled);

  React.useEffect(() => {
    if (isVisible) {
      setDraftMethod(selectedMethod);
    }
  }, [isVisible, selectedMethod]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.overlay, { zIndex: layout.layer.modal }]}>
      <Pressable
        accessibilityLabel={t('checkout_payment_close')}
        accessibilityRole="button"
        onPress={onClose}
        style={[styles.backdrop, { backgroundColor: colors.scrim }]}
      />
      <SwipeableBottomSheet
        collapsedHeight={0}
        expandedHeight={sheetHeight}
        handle={<BottomSheetHandle color={colors.iconDisabled} />}
        horizontalInset={horizontalInset}
        initialState="expanded"
        modal
        onStateChange={(state) => {
          if (state === 'collapsed') {
            onClose();
          }
        }}
        style={[
          styles.sheet,
          elevation.overlay,
          {
            backgroundColor: colors.surfaceElevated,
            borderTopLeftRadius: shape.radius.sheet,
            borderTopRightRadius: shape.radius.sheet,
          },
        ]}
      >
        <View style={[styles.header, { gap: spacing.md, paddingHorizontal: spacing.lg }]}>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
              {t('checkout_payment_selector_title')}
            </Text>
            <Text color={colors.textSubtle} variant="caption">
              {t('checkout_payment_selector_description')}
            </Text>
          </View>
          <PressableScale
            accessibilityLabel={t('checkout_payment_close')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: colors.surfaceSunken,
                borderRadius: shape.radius.pill,
                minHeight: layout.touchTarget.minimum,
              },
            ]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </PressableScale>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, { gap: spacing.md, padding: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          <PaymentOption
            description={isCardEnabled
              ? hasSavedCards
                ? getCheckoutPaymentMethodSubtitle('stripe', t)
                : t('checkout_payment_add_card_required')
              : t('checkout_payment_card_unavailable')}
            disabled={!isCardEnabled}
            icon="card-outline"
            isSelected={draftMethod === 'stripe'}
            label={getCheckoutPaymentMethodTitle('stripe', t)}
            onPress={() => setDraftMethod('stripe')}
          />
          <PaymentOption
            description={isWalletEnabled
              ? t('checkout_payment_wallet_balance', {
                currency: currencyLabel,
                amount: walletBalance.toFixed(2),
              })
              : t('checkout_payment_wallet_insufficient_balance')}
            disabled={!isWalletEnabled}
            icon="wallet-outline"
            isSelected={draftMethod === 'wallet'}
            label={getCheckoutPaymentMethodTitle('wallet', t)}
            onPress={() => setDraftMethod('wallet')}
          />

          {draftMethod === 'stripe' ? (
            <View style={[styles.cardsWrap, { gap: spacing.sm }]}>
              {savedCards.map((card) => {
                const isSelected = selectedCardId === card.id;

                return (
                  <PressableScale
                    key={card.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    disabled={isSavingCardSelection}
                    onPress={() => onSelectCard(card.id)}
                    style={[
                      styles.cardOption,
                      {
                        backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: shape.radius.control,
                        gap: spacing.md,
                        minHeight: layout.touchTarget.comfortable,
                        paddingHorizontal: spacing.md,
                      },
                    ]}
                  >
                    <Ionicons color={colors.text} name="card-outline" size={19} />
                    <View style={styles.cardOptionTextWrap}>
                      <Text numberOfLines={1} variant="label" weight="semiBold">
                        {`${card.brand.toUpperCase()} (•••• ${card.last4})`}
                      </Text>
                      <Text color={colors.textSubtle} variant="caption">
                        {`${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`}
                      </Text>
                    </View>
                    <Ionicons
                      color={isSelected ? colors.primary : colors.iconDisabled}
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={19}
                    />
                  </PressableScale>
                );
              })}

              <PressableScale
                accessibilityRole="button"
                onPress={onManageCards}
                style={[
                  styles.addCardButton,
                  {
                    backgroundColor: colors.surfaceSunken,
                    borderRadius: shape.radius.control,
                    gap: spacing.sm,
                    minHeight: layout.touchTarget.comfortable,
                  },
                ]}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text color={colors.primary} variant="label" weight="semiBold">
                  {t('wallet_add_card')}
                </Text>
              </PressableScale>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surfaceElevated,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
            },
          ]}
        >
          <Button
            disabled={isConfirmDisabled}
            fullWidth
            label={t('checkout_payment_selector_confirm')}
            onPress={() => onConfirm(draftMethod)}
            size="large"
          />
        </View>
      </SwipeableBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  addCardButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backdrop: StyleSheet.absoluteFillObject,
  cardOption: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  cardOptionTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  cardsWrap: {},
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
  },
  content: {},
  footer: {},
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 4,
  },
  headerCopy: {
    flex: 1,
  },
  option: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  optionIcon: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    overflow: 'hidden',
  },
});
