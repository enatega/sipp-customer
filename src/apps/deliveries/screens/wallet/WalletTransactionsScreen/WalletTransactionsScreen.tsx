import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '../../../../../general/components/ScreenHeader';
import { useTheme } from '../../../../../general/theme/theme';
import WalletTransactionItem from '../../../components/wallet/WalletTransactionItem';
import WalletTransactionsEmptyState from '../../../components/wallet/WalletTransactionsEmptyState';
import { useWalletTransactionsQuery } from '../../../../../general/api/walletSavedCardsService';
import { useDeliveriesCurrencyLabel } from '../../../../../general/stores/useAppConfigStore';
import Text from '../../../../../general/components/Text';

export default function WalletTransactionsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');
  const currency = useDeliveriesCurrencyLabel();
  const transactionsQuery = useWalletTransactionsQuery('deliveries', { offset: 0, limit: 50 });
  const transactions = transactionsQuery.data?.data ?? [];

  const renderTransaction = useCallback(({ item }: { item: (typeof transactions)[number] }) => (
    <WalletTransactionItem
      iconType={item.type}
      amount={item.amount}
      currency={currency}
      status={item.status}
      title={item.title}
      subtitle={item.subtitle}
      time={item.time}
    />
  ), [currency]);

  const keyExtractor = useCallback((item: (typeof transactions)[number]) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('wallet_recent_transactions')} />
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={transactions.length === 0 ? styles.emptyContent : styles.content}
        ListEmptyComponent={transactionsQuery.isPending ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : transactionsQuery.isError ? (
          <View style={styles.errorState}>
            <View style={[styles.errorIcon, { backgroundColor: colors.dangerSoft }]}> 
              <Ionicons name="cloud-offline-outline" size={28} color={colors.dangerText} />
            </View>
            <Text color={colors.text} weight="semiBold" style={styles.errorTitle}>{t('wallet_transactions_error')}</Text>
            <Pressable onPress={() => void transactionsQuery.refetch()} style={[styles.retry, { backgroundColor: colors.primarySoft }]}>
              <Text color={colors.primary} weight="semiBold">{t('generic_list_retry')}</Text>
            </Pressable>
          </View>
        ) : <WalletTransactionsEmptyState />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: { paddingBottom: 32 },
  emptyContent: { flexGrow: 1 },
  errorIcon: { alignItems: 'center', borderRadius: 18, height: 60, justifyContent: 'center', width: 60 },
  errorState: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', paddingHorizontal: 28 },
  errorTitle: { fontSize: 16, lineHeight: 22, textAlign: 'center' },
  loading: { marginTop: 80 },
  retry: { borderRadius: 10, minHeight: 44, justifyContent: 'center', paddingHorizontal: 18 },
});
