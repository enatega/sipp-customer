import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute, type NavigationProp, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useStripe } from '@stripe/stripe-react-native';

import { showToast } from '../../../../../general/components/AppToast';
import useProfile from '../../../../../general/hooks/useProfile';
import { useDeliveriesCurrencyCode, useDeliveriesCurrencyLabel } from '../../../../../general/stores/useAppConfigStore';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';
import { useWalletSavedCardsQuery, useWalletSetDefaultCardMutation, useWalletTransactionsQuery } from '../../../../../general/api/walletSavedCardsService';
import WalletBalanceHeader from '../../../components/wallet/WalletBalanceHeader';
import WalletQuickActions from '../../../components/wallet/WalletQuickActions';
import WalletLoyaltyStrip from '../../../components/wallet/WalletLoyaltyStrip';
import WalletSheet from '../../../components/wallet/WalletSheet';
import WalletPaymentMethodsContent from '../../../components/wallet/WalletPaymentMethodsContent';
import WalletSuccessOverlay from '../../../components/wallet/WalletSuccessOverlay';
import WalletTransactionItem from '../../../components/wallet/WalletTransactionItem';
import WalletTransactionsEmptyState from '../../../components/wallet/WalletTransactionsEmptyState';
import LoyaltyConversionCard from '../../../components/wallet/LoyaltyConversionCard';
import WalletTopUpCard from '../../../components/wallet/WalletTopUpCard';
import type { DeliveriesStackParamList } from '../../../navigation/types';
import { useConvertCustomerPoints, useCustomerLoyaltyWalletSummary, useWalletTopUp } from '../../../api/walletService';

type WalletSheetName = 'add' | 'convert' | 'cards' | null;
type SuccessState = { kind: 'topup' | 'conversion'; amount: number; newBalance?: number } | null;

export default function WalletScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation('deliveries');
  const currencyLabel = useDeliveriesCurrencyLabel();
  const currencyCode = useDeliveriesCurrencyCode();
  const { handleNextAction } = useStripe();
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const route = useRoute<RouteProp<DeliveriesStackParamList, 'Wallet'>>();
  const [activeSheet, setActiveSheet] = useState<WalletSheetName>(null);
  const [cardsOpenedFromAdd, setCardsOpenedFromAdd] = useState(false);
  const [success, setSuccess] = useState<SuccessState>(null);
  const [isConfirmingTopUp, setIsConfirmingTopUp] = useState(false);
  const [topUpValue, setTopUpValue] = useState('');
  const didOpenSuggestedAmount = useRef(false);
  const resumeAddAfterCard = useRef(false);
  const topUpLock = useRef(false);
  const convertLock = useRef(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (successTimer.current) clearTimeout(successTimer.current);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  const { wallet, isLoading: isProfileLoading, error: profileError, refetch: refetchProfile } = useProfile('deliveries');
  const savedCardsQuery = useWalletSavedCardsQuery('deliveries');
  const setDefaultCardMutation = useWalletSetDefaultCardMutation('deliveries');
  const walletTransactionsQuery = useWalletTransactionsQuery('deliveries', { offset: 0, limit: 3 });
  const loyaltyQuery = useCustomerLoyaltyWalletSummary();
  const convertPoints = useConvertCustomerPoints();
  const topUp = useWalletTopUp();
  const savedCards = savedCardsQuery.data?.cards ?? [];
  const transactions = walletTransactionsQuery.data?.data ?? [];
  const defaultCard = savedCards.find((card) => card.isDefault) ?? savedCards[0];

  useFocusEffect(useCallback(() => {
    void savedCardsQuery.refetch();
    void walletTransactionsQuery.refetch();
    if (resumeAddAfterCard.current) {
      resumeAddAfterCard.current = false;
      setActiveSheet('add');
    }
  }, [savedCardsQuery.refetch, walletTransactionsQuery.refetch]));

  useEffect(() => {
    if (route.params?.suggestedTopUpAmount && !didOpenSuggestedAmount.current) {
      didOpenSuggestedAmount.current = true;
      setTopUpValue(Math.max(route.params.suggestedTopUpAmount, currencyCode.toUpperCase() === 'CRC' ? 500 : 0.01).toFixed(2));
      setActiveSheet('add');
    }
  }, [currencyCode, route.params?.suggestedTopUpAmount]);

  const handleAddCard = () => {
    resumeAddAfterCard.current = activeSheet === 'add' || cardsOpenedFromAdd;
    setActiveSheet(null);
    navigation.navigate('AddCard');
  };
  const handleSeeAll = () => navigation.navigate('WalletTransactions');
  const handleSelectCard = async (cardId: string) => {
    try {
      await setDefaultCardMutation.mutateAsync(cardId);
      await savedCardsQuery.refetch();
      if (cardsOpenedFromAdd) setActiveSheet('add');
    } catch (error) {
      showToast.error(t('wallet_add_card_error'), error instanceof Error ? error.message : t('wallet_add_card_error'));
    }
  };

  const handleTopUp = async (amount: number) => {
    if (!defaultCard || topUpLock.current) return;
    topUpLock.current = true;
    setIsConfirmingTopUp(true);
    try {
      const result = await topUp.mutateAsync({ amount, currency: currencyCode, paymentMethodId: defaultCard.id });
      let finalStatus = result.status;
      if (result.status === 'requires_action' && result.clientSecret) {
        const { error, paymentIntent } = await handleNextAction(result.clientSecret);
        if (error) throw new Error(error.message);
        finalStatus = paymentIntent?.status ?? '';
      }
      if (finalStatus !== 'succeeded' && finalStatus !== 'processing') throw new Error(t('wallet_topup_error'));
      await Promise.all([refetchProfile(), walletTransactionsQuery.refetch()]);
      refreshTimer.current = setTimeout(() => {
        void refetchProfile();
        void walletTransactionsQuery.refetch();
      }, 2500);
      setActiveSheet(null);
      if (finalStatus === 'succeeded') successTimer.current = setTimeout(() => setSuccess({ kind: 'topup', amount }), 320);
      else showToast.info(t('wallet_topup_processing'), t('wallet_topup_pending'));
    } catch (error) {
      showToast.error(t('wallet_topup_error'), error instanceof Error ? error.message : t('wallet_topup_error'));
      throw error;
    } finally {
      topUpLock.current = false;
      setIsConfirmingTopUp(false);
    }
  };

  const handleConvert = async (points: number) => {
    if (convertLock.current) return;
    convertLock.current = true;
    try {
      const result = await convertPoints.mutateAsync(points);
      await Promise.all([loyaltyQuery.refetch(), walletTransactionsQuery.refetch(), refetchProfile()]);
      setActiveSheet(null);
      successTimer.current = setTimeout(() => setSuccess({ kind: 'conversion', amount: result.amount, newBalance: result.newWalletBalance }), 320);
    } catch (error) {
      showToast.error(t('wallet_points_convert_error'), error instanceof Error ? error.message : t('wallet_points_convert_error'));
      throw error;
    } finally {
      convertLock.current = false;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.walletBackground }]}>
      {isDark ? <Image source={require('../../../assets/wallet/ambient_blue.png')} resizeMode="cover" style={styles.ambient} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WalletBalanceHeader balanceLabel={t('wallet_balance_label')} balance={wallet?.wallet_balance ?? 0} currency={currencyLabel} isLoading={isProfileLoading} isError={Boolean(profileError)} onViewDetails={handleSeeAll} onOpenSettings={() => navigation.navigate('Settings')} />
        {profileError ? (
          <Pressable accessibilityRole="button" onPress={() => void refetchProfile()} style={[styles.error, { backgroundColor: colors.dangerSoft }]}>
            <Ionicons name="refresh-outline" size={18} color={colors.dangerText} />
            <Text color={colors.dangerText} style={styles.errorText}>{t('wallet_balance_load_error')}</Text>
          </Pressable>
        ) : null}
        <WalletQuickActions
          addMoneyLabel={t('wallet_topup_title')}
          convertLabel={t('wallet_action_convert')}
          cardsLabel={t('wallet_action_cards')}
          onAddMoney={() => setActiveSheet('add')}
          onConvert={() => setActiveSheet('convert')}
          onCards={() => { setCardsOpenedFromAdd(false); setActiveSheet('cards'); }}
        />
        <WalletLoyaltyStrip label={t('wallet_loyalty_available_points')} points={loyaltyQuery.data?.earned_points ?? null} isLoading={loyaltyQuery.isPending || loyaltyQuery.isError} />
        <View style={styles.transactionsHeading}>
          <Text color={colors.text} weight="semiBold" style={styles.sectionTitle}>{t('wallet_recent_transactions')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('wallet_see_all')} onPress={handleSeeAll} style={styles.seeAll}>
            <Text color={colors.walletBlue} weight="semiBold" style={styles.seeAllText}>{t('wallet_see_all')}</Text>
            <Ionicons name="chevron-forward" size={17} color={colors.walletBlue} />
          </Pressable>
        </View>
        {walletTransactionsQuery.isPending ? <ActivityIndicator color={colors.walletBlue} style={styles.loading} /> : null}
        {walletTransactionsQuery.isError ? (
          <Pressable accessibilityRole="button" onPress={() => void walletTransactionsQuery.refetch()} style={[styles.error, { backgroundColor: colors.dangerSoft }]}>
            <Ionicons name="refresh-outline" size={18} color={colors.dangerText} />
            <Text color={colors.dangerText} style={styles.errorText}>{t('wallet_transactions_error')}</Text>
          </Pressable>
        ) : null}
        {!walletTransactionsQuery.isPending && !walletTransactionsQuery.isError ? (
          transactions.length > 0 ? (
            <View style={[styles.transactionsCard, { backgroundColor: colors.walletSurface, borderColor: colors.walletHairline }]}>
              {transactions.slice(0, 3).map((transaction) => (
                <WalletTransactionItem key={transaction.id} transaction={transaction} currency={currencyLabel} onPress={() => navigation.navigate('WalletTransactionDetails', { transaction })} />
              ))}
            </View>
          ) : <WalletTransactionsEmptyState compact />
        ) : null}
      </ScrollView>

      <WalletSheet
        visible={activeSheet !== null}
        title={activeSheet === 'convert' ? t('wallet_convert_points_title') : activeSheet === 'cards' ? t('wallet_payment_methods_title') : t('wallet_topup_title')}
        description={activeSheet === 'convert' ? t('wallet_convert_sheet_description') : activeSheet === 'cards' ? t('wallet_cards_sheet_description') : t('wallet_topup_sheet_description')}
        closeLabel={t('wallet_close')}
        onClose={() => {
          if (activeSheet === 'add' && (topUp.isPending || isConfirmingTopUp)) return;
          if (activeSheet === 'convert' && convertPoints.isPending) return;
          if (activeSheet === 'cards' && setDefaultCardMutation.isPending) return;
          setActiveSheet(activeSheet === 'cards' && cardsOpenedFromAdd ? 'add' : null);
        }}
        decorativeImage={activeSheet === 'add' ? require('../../../assets/wallet/add_money_float.png') : activeSheet === 'convert' ? require('../../../assets/wallet/loyalty_crystal.png') : undefined}
        heightFraction={0.79}
      >
        <View style={[styles.sheetBody, activeSheet === 'add' ? null : styles.hidden]}>
          <WalletTopUpCard cardLabel={defaultCard ? `${defaultCard.brand.toUpperCase()} •••• ${defaultCard.last4}` : undefined} cardExpiry={defaultCard ? `${String(defaultCard.expMonth).padStart(2, '0')}/${String(defaultCard.expYear).slice(-2)}` : undefined} currency={currencyLabel} currencyCode={currencyCode} initialAmount={route.params?.suggestedTopUpAmount} value={topUpValue} onValueChange={setTopUpValue} isLoading={topUp.isPending || isConfirmingTopUp} onAddCard={handleAddCard} onSelectCard={() => { setCardsOpenedFromAdd(true); setActiveSheet('cards'); }} onSubmit={handleTopUp} />
        </View>
        <View style={[styles.sheetBody, activeSheet === 'convert' ? null : styles.hidden]}>
          <LoyaltyConversionCard availablePoints={loyaltyQuery.data?.earned_points ?? 0} currency={currencyLabel} isLoading={convertPoints.isPending} pointsEqualsOne={loyaltyQuery.data?.points_equals_one ?? 0} totalEarnedPoints={loyaltyQuery.data?.total_earned_points} loyaltyWalletAmount={loyaltyQuery.data?.loyalty_wallet_amount} onConvert={handleConvert} />
        </View>
        <View style={[styles.sheetBody, activeSheet === 'cards' ? null : styles.hidden]}>
          <WalletPaymentMethodsContent cards={savedCards} isLoading={savedCardsQuery.isPending} isError={savedCardsQuery.isError} isSelecting={setDefaultCardMutation.isPending} onSelect={(cardId) => { void handleSelectCard(cardId); }} onAddCard={handleAddCard} onRetry={() => { void savedCardsQuery.refetch(); }} onDone={() => setActiveSheet(cardsOpenedFromAdd ? 'add' : null)} />
        </View>
      </WalletSheet>
      <WalletSuccessOverlay visible={success !== null} kind={success?.kind ?? 'topup'} amount={success?.amount ?? 0} currency={currencyLabel} newBalance={success?.newBalance} onDone={() => setSuccess(null)} onViewTransactions={() => { setSuccess(null); handleSeeAll(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  ambient: { height: 560, left: 0, opacity: 0.26, position: 'absolute', right: 0, top: 0, width: '100%' },
  content: { alignSelf: 'center', maxWidth: 480, paddingBottom: 32, width: '100%' },
  transactionsHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 20, minHeight: 36 },
  sectionTitle: { fontSize: 18, lineHeight: 24 },
  seeAll: { alignItems: 'center', flexDirection: 'row', gap: 3, minHeight: 44, paddingHorizontal: 6 },
  seeAllText: { fontSize: 12, lineHeight: 16 },
  transactionsCard: { borderRadius: 18, borderWidth: 1, marginHorizontal: 16, overflow: 'hidden' },
  loading: { marginVertical: 30 },
  error: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 10, minHeight: 48, paddingHorizontal: 12 },
  errorText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sheetBody: { flexGrow: 1 },
  hidden: { display: 'none' },
});
