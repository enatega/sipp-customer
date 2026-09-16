import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const handleAddCard = useCallback(() => {
    navigation.navigate('AddCard');
  }, [navigation]);

  const handleSeeAll = useCallback(() => {
    navigation.navigate('WalletTransactions');
  }, [navigation]);

  const renderTransaction = useCallback(({ item }: { item: (typeof transactions)[number] }) => (
    <WalletTransactionItem
      iconType={item.type}
      amount={item.amount}
      currency={currencyLabel}
      status={item.status}
      title={item.title}
      subtitle={item.subtitle}
      time={item.time}
    />
  ), [currencyLabel]);

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
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          walletTransactionsQuery.isPending ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} />
          ) : walletTransactionsQuery.isError ? null : <WalletTransactionsEmptyState compact />
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
            <View style={styles.sectionHeading}>
              <Text weight="bold" color={colors.text} style={styles.sectionTitle}>
                {t('wallet_cards_title')}
              </Text>
              <View style={[styles.secureBadge, { backgroundColor: colors.successSoft }]}> 
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.successText} />
                <Text color={colors.successText} weight="semiBold" style={styles.secureBadgeText}>{t('wallet_secure')}</Text>
              </View>
            </View>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              {savedCards.map((card) => (
                <SavedCardRow
                  key={card.id}
                  brand={card.brand}
                  holderName={card.name?.trim() || `${card.brand.toUpperCase()} Card`}
                  subtitle={`•••• •••• •••• ${card.last4}`}
                  secondarySubtitle={`${String(card.expMonth).padStart(2, '0')}/${String(card.expYear).slice(-2)}`}
                  isDefault={card.isDefault}
                  onPress={card.isDefault ? undefined : () => void handleSetDefaultCard(card.id)}
                />
              ))}
              {savedCardsQuery.isPending ? <ActivityIndicator color={colors.primary} style={styles.cardLoading} /> : null}
              {savedCardsQuery.isError ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void savedCardsQuery.refetch()}
                  style={styles.cardError}
                >
                  <Ionicons name="refresh-outline" size={17} color={colors.dangerText} />
                  <Text color={colors.dangerText} weight="medium" style={styles.cardErrorText}>{t('wallet_cards_error')}</Text>
                </Pressable>
              ) : null}
              {!savedCardsQuery.isPending && !savedCardsQuery.isError && savedCards.length === 0 ? (
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
                  { backgroundColor: colors.primarySoft, opacity: pressed ? 0.72 : 1 },
                ]}
                accessibilityRole="button"
              >
                <Text weight="semiBold" color={colors.primary} style={styles.seeAllText}>
                  {t('wallet_see_all')}
                </Text>
                <Ionicons name="arrow-forward" size={15} color={colors.primary} />
              </Pressable>
            </View>
            {walletTransactionsQuery.isError ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void walletTransactionsQuery.refetch()}
                style={[styles.errorBanner, { backgroundColor: colors.dangerSoft }]}
              >
                <Ionicons name="refresh-outline" size={18} color={colors.dangerText} />
                <Text color={colors.dangerText} weight="medium" style={styles.errorCopy}>{t('wallet_transactions_error')}</Text>
              </Pressable>
            ) : null}
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
  content: { paddingBottom: 36 },
  cardLoading: { marginVertical: 20 },
  cardError: { alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 48, paddingHorizontal: 16 },
  cardErrorText: { flex: 1, fontSize: 13, lineHeight: 18 },
  errorBanner: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 4, padding: 12 },
  errorCopy: { flex: 1, fontSize: 13, lineHeight: 18 },
  emptyCardsText: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 26,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 10,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  secureBadge: { alignItems: 'center', borderRadius: 8, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 5 },
  secureBadgeText: { fontSize: 11, lineHeight: 15 },
  loading: { marginVertical: 32 },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  seeAllButton: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  seeAllText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
