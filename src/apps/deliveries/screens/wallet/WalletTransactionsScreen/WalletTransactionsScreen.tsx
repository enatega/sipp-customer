import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '../../../../../general/components/ScreenHeader';
import Text from '../../../../../general/components/Text';
import { useWalletStatementQuery, type WalletStatementFilter, type WalletTransaction } from '../../../../../general/api/walletSavedCardsService';
import { useDeliveriesCurrencyLabel } from '../../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../../general/theme/theme';
import WalletTransactionItem from '../../../components/wallet/WalletTransactionItem';
import WalletTransactionsEmptyState from '../../../components/wallet/WalletTransactionsEmptyState';
import type { DeliveriesStackParamList } from '../../../navigation/types';

const FILTERS: WalletStatementFilter[] = ['all', 'credit', 'debit'];

function dayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function WalletTransactionsScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation('deliveries');
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const currency = useDeliveriesCurrencyLabel();
  const [filter, setFilter] = useState<WalletStatementFilter>('all');
  const transactionsQuery = useWalletStatementQuery('deliveries', filter);
  const transactions = useMemo(() => transactionsQuery.data?.pages.flatMap((page) => page.data) ?? [], [transactionsQuery.data]);

  const renderTransaction = useCallback(({ item, index }: { item: WalletTransaction; index: number }) => {
    const currentDay = dayKey(item.time);
    const previousDay = index > 0 ? dayKey(transactions[index - 1].time) : '';
    const today = dayKey(new Date().toISOString());
    const yesterday = dayKey(new Date(Date.now() - 86400000).toISOString());
    const dayTitle = currentDay && currentDay !== previousDay
      ? currentDay === today ? t('wallet_statement_today') : currentDay === yesterday ? t('wallet_statement_yesterday') : new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(item.time))
      : null;
    return (
      <View>
        {dayTitle ? <Text color={colors.text} weight="semiBold" style={styles.dayTitle}>{dayTitle}</Text> : null}
        <View style={[styles.row, { backgroundColor: colors.walletSurface, borderColor: colors.walletHairline }]}>
          <WalletTransactionItem transaction={item} currency={currency} onPress={() => navigation.navigate('WalletTransactionDetails', { transaction: item })} />
        </View>
      </View>
    );
  }, [colors.text, colors.walletHairline, colors.walletSurface, currency, i18n.language, navigation, t, transactions]);

  return (
    <View style={[styles.container, { backgroundColor: colors.walletBackground }]}>
      <ScreenHeader title={t('wallet_statement_title')} style={{ backgroundColor: colors.walletBackground }} />
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={transactions.length === 0 ? styles.emptyContent : styles.content}
        onEndReachedThreshold={0.4}
        onEndReached={() => { if (transactionsQuery.hasNextPage && !transactionsQuery.isFetchingNextPage) void transactionsQuery.fetchNextPage(); }}
        refreshing={transactionsQuery.isRefetching && !transactionsQuery.isFetchingNextPage}
        onRefresh={() => { void transactionsQuery.refetch(); }}
        ListHeaderComponent={
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {FILTERS.map((item) => {
              const selected = item === filter;
              const label = item === 'all' ? t('wallet_statement_all') : item === 'credit' ? t('wallet_statement_money_in') : t('wallet_statement_money_out');
              return (
                <Pressable key={item} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected }} onPress={() => setFilter(item)} style={[styles.filter, { backgroundColor: selected ? colors.walletBlue : colors.walletSurfaceAlt }]}>
                  <Text color={selected ? colors.white : colors.text} weight="semiBold" style={styles.filterText}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        }
        ListEmptyComponent={transactionsQuery.isPending ? (
          <ActivityIndicator color={colors.walletBlue} style={styles.loading} />
        ) : transactionsQuery.isError ? (
          <View style={styles.errorState}>
            <Ionicons name="cloud-offline-outline" size={30} color={colors.dangerText} />
            <Text color={colors.text} weight="semiBold" style={styles.errorTitle}>{t('wallet_transactions_error')}</Text>
            <Pressable accessibilityRole="button" onPress={() => void transactionsQuery.refetch()} style={[styles.retry, { backgroundColor: colors.walletSurfaceAlt }]}>
              <Text color={colors.walletBlue} weight="semiBold">{t('generic_list_retry')}</Text>
            </Pressable>
          </View>
        ) : filter === 'all' ? <WalletTransactionsEmptyState /> : (
          <View style={styles.errorState}>
            <Ionicons name="receipt-outline" size={30} color={colors.walletTextMuted} />
            <Text color={colors.text} weight="semiBold" style={styles.errorTitle}>{t('wallet_statement_no_filtered_activity')}</Text>
          </View>
        )}
        ListFooterComponent={transactionsQuery.isFetchingNextPage ? <ActivityIndicator color={colors.walletBlue} style={styles.footerLoading} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  emptyContent: { flexGrow: 1 },
  filters: { gap: 8, paddingBottom: 12, paddingHorizontal: 16, paddingTop: 4 },
  filter: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', minWidth: 86, paddingHorizontal: 16 },
  filterText: { fontSize: 12, lineHeight: 16 },
  dayTitle: { fontSize: 13, lineHeight: 18, marginHorizontal: 16, marginTop: 10, paddingBottom: 6 },
  row: { borderWidth: 1, borderRadius: 14, marginBottom: 4, marginHorizontal: 16, overflow: 'hidden' },
  errorState: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', paddingHorizontal: 28, paddingTop: 70 },
  errorTitle: { fontSize: 16, lineHeight: 22, textAlign: 'center' },
  loading: { marginTop: 80 },
  retry: { borderRadius: 10, justifyContent: 'center', minHeight: 44, paddingHorizontal: 18 },
  footerLoading: { marginVertical: 20 },
});
