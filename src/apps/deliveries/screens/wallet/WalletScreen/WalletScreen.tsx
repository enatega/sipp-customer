import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useStripe } from '@stripe/stripe-react-native';

import { showToast } from '../../../../../general/components/AppToast';
import useProfile from '../../../../../general/hooks/useProfile';
import {
  useDeliveriesCurrencyCode,
  useDeliveriesCurrencyLabel,
} from '../../../../../general/stores/useAppConfigStore';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';
import {
  useWalletSavedCardsQuery,
  useWalletSetDefaultCardMutation,
  useWalletTransactionsQuery,
} from '../../../../../general/api/walletSavedCardsService';
import WalletBalanceHeader from '../../../components/wallet/WalletBalanceHeader';
import SavedCardRow from '../../../components/wallet/SavedCardRow';
import AddCardRow from '../../../components/wallet/AddCardRow';
import WalletTransactionItem from '../../../components/wallet/WalletTransactionItem';
import WalletTransactionsEmptyState from '../../../components/wallet/WalletTransactionsEmptyState';
import type { DeliveriesStackParamList } from '../../../navigation/types';
import {
  useConvertCustomerPoints,
  useCustomerLoyaltyWalletSummary,
  useWalletTopUp,
} from '../../../api/walletService';
import LoyaltyConversionCard from '../../../components/wallet/LoyaltyConversionCard';
import WalletTopUpCard from '../../../components/wallet/WalletTopUpCard';

export default function WalletScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');
  const currencyLabel = useDeliveriesCurrencyLabel();
  const currencyCode = useDeliveriesCurrencyCode();
  const { handleNextAction } = useStripe();
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const { wallet, refetch: refetchProfile } = useProfile('deliveries');
  const savedCardsQuery = useWalletSavedCardsQuery('deliveries');
  const setDefaultCardMutation = useWalletSetDefaultCardMutation('deliveries');
  const walletTransactionsQuery = useWalletTransactionsQuery('deliveries', { offset: 0, limit: 10 });
  const loyaltyQuery = useCustomerLoyaltyWalletSummary();
  const convertPoints = useConvertCustomerPoints();
  const topUp = useWalletTopUp();
  const savedCards = savedCardsQuery.data?.cards ?? [];
  const transactions = walletTransactionsQuery.data?.data ?? [];
  const defaultCard = savedCards.find((card) => card.isDefault) ?? savedCards[0];

  React.useEffect(() => {
    console.log('[Wallet][SavedCards][Response]', {
      count: savedCards.length,
      cards: savedCards.map((card) => ({
        id: card.id,
        name: card.name ?? null,
        brand: card.brand,
        last4: card.last4,
        expMonth: card.expMonth,
        expYear: card.expYear,
        isDefault: card.isDefault,
      })),
    });
  }, [savedCards]);

  const handleAddCard = useCallback(() => {
    navigation.navigate('AddCard');
  }, [navigation]);

  const handleSeeAll = useCallback(() => {
    navigation.navigate('WalletTransactions');
  }, [navigation]);

  const renderTransaction = useCallback(({ item }: { item: (typeof transactions)[number] }) => (
    <WalletTransactionItem
      iconType={item.type}
      title={item.title}
      subtitle={item.subtitle}
      time={item.time}
    />
  ), []);

  const keyExtractor = useCallback((item: (typeof transactions)[number]) => item.id, []);
  const handleSetDefaultCard = useCallback(
    async (cardId: string) => {
      try {
        await setDefaultCardMutation.mutateAsync(cardId);
      } catch (error) {
        const message = error instanceof Error ? error.message : t('wallet_add_card_error');
        showToast.error(t('wallet_add_card_error'), message);
      }
    },
    [setDefaultCardMutation, t],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !walletTransactionsQuery.isPending ? <WalletTransactionsEmptyState compact /> : null
        }
        ListHeaderComponent={
          <>
            <WalletBalanceHeader
              balanceLabel={t('wallet_balance_label')}
              balance={wallet?.wallet_balance ?? 0}
              currency={currencyLabel}
              loyaltyAmount={loyaltyQuery.data?.loyalty_wallet_amount}
              loyaltyAmountLabel={loyaltyQuery.data ? t('wallet_loyalty_amount') : undefined}
              loyaltyPoints={loyaltyQuery.data?.total_earned_points}
              loyaltyPointsLabel={loyaltyQuery.data ? t('wallet_loyalty_total_points') : undefined}
              loyaltyRateLabel={loyaltyQuery.data ? t('wallet_loyalty_rate', {
                points: loyaltyQuery.data?.points_equals_one ?? 0,
                currency: currencyLabel,
              }) : undefined}
            />

            {loyaltyQuery.data ? (
              <LoyaltyConversionCard
                availablePoints={loyaltyQuery.data.earned_points}
                currency={currencyLabel}
                isLoading={convertPoints.isPending}
                pointsEqualsOne={loyaltyQuery.data.points_equals_one}
                onConvert={async (points) => {
                  try {
                    const result = await convertPoints.mutateAsync(points);
                    await Promise.all([
                      loyaltyQuery.refetch(),
                      walletTransactionsQuery.refetch(),
                      refetchProfile(),
                    ]);
                    showToast.success(
                      t('wallet_points_converted_title'),
                      t('wallet_points_converted_message', {
                        amount: result.amount.toFixed(2),
                        currency: currencyLabel,
                      }),
                    );
                  } catch (error) {
                    showToast.error(
                      t('wallet_points_convert_error'),
                      error instanceof Error ? error.message : t('wallet_points_convert_error'),
                    );
                    throw error;
                  }
                }}
              />
            ) : null}

            <WalletTopUpCard
              cardLabel={defaultCard
                ? `${defaultCard.brand.toUpperCase()} •••• ${defaultCard.last4}`
                : undefined}
              currency={currencyLabel}
              isLoading={topUp.isPending}
              onSubmit={async (amount) => {
                if (!defaultCard) return;
                try {
                  const result = await topUp.mutateAsync({
                    amount,
                    currency: currencyCode,
                    paymentMethodId: defaultCard.id,
                  });
                  if (result.status === 'requires_action' && result.clientSecret) {
                    const { error, paymentIntent } = await handleNextAction(result.clientSecret);
                    if (error) throw new Error(error.message);
                    if (paymentIntent?.status !== 'succeeded' && paymentIntent?.status !== 'processing') {
                      throw new Error(t('wallet_topup_error'));
                    }
                  }
                  await Promise.all([refetchProfile(), walletTransactionsQuery.refetch()]);
                  setTimeout(() => {
                    void refetchProfile();
                    void walletTransactionsQuery.refetch();
                  }, 2500);
                  showToast.success(t('wallet_topup_success'), t('wallet_topup_pending'));
                } catch (error) {
                  showToast.error(
                    t('wallet_topup_error'),
                    error instanceof Error ? error.message : t('wallet_topup_error'),
                  );
                  throw error;
                }
              }}
            />

            {/* Cards section */}
            <View style={styles.section}>
              <Text weight="bold" color={colors.text} style={styles.sectionTitle}>
                {t('wallet_cards_title')}
              </Text>
              {savedCards.map((card) => (
                <SavedCardRow
                  key={card.id}
                  brand={card.brand}
                  holderName={card.name?.trim() || `${card.brand.toUpperCase()} Card`}
                  subtitle={`•••• •••• •••• ${card.last4}`}
                  secondarySubtitle={`${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`}
                  isDefault={card.isDefault}
                  onPress={() => {
                    if (!card.isDefault) {
                      void handleSetDefaultCard(card.id);
                    }
                  }}
                />
              ))}
              {!savedCardsQuery.isPending && savedCards.length === 0 ? (
                <Text color={colors.mutedText} style={styles.emptyCardsText}>
                  {t('wallet_no_saved_cards')}
                </Text>
              ) : null}
              <AddCardRow
                label={t('wallet_add_card')}
                onPress={handleAddCard}
              />
            </View>

            {/* Transactions header */}
            <View style={styles.transactionsHeader}>
              <Text weight="bold" color={colors.text} style={styles.sectionTitle}>
                {t('wallet_recent_transactions')}
              </Text>
              <Pressable
                onPress={handleSeeAll}
                style={({ pressed }) => [
                  styles.seeAllButton,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
              >
                <Text weight="medium" color={colors.text} style={styles.seeAllText}>
                  {t('wallet_see_all')}
                </Text>
              </Pressable>
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingTop: 20,
    paddingBottom: 8,
  },
  emptyCardsText: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 26,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  seeAllButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
