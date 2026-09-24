import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type NavigationProp, type RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Button from '../../../../../general/components/Button';
import ScreenHeader from '../../../../../general/components/ScreenHeader';
import Text from '../../../../../general/components/Text';
import { useDeliveriesCurrencyLabel } from '../../../../../general/stores/useAppConfigStore';
import { useTheme } from '../../../../../general/theme/theme';
import {
  formatWalletStatementAmount,
  formatWalletStatementDate,
  statementDescriptionKeys,
  statementTitleKeys,
} from '../../../components/wallet/walletStatementPresentation';
import type { DeliveriesStackParamList } from '../../../navigation/types';

export default function WalletTransactionDetailsScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation('deliveries');
  const currency = useDeliveriesCurrencyLabel();
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const route = useRoute<RouteProp<DeliveriesStackParamList, 'WalletTransactionDetails'>>();
  const transaction = route.params.transaction;
  const title = t(statementTitleKeys[transaction.reasonCode]);
  const description = t(statementDescriptionKeys[transaction.reasonCode]);
  const direction = transaction.direction === 'credit'
    ? t('wallet_statement_money_in')
    : transaction.direction === 'debit'
      ? t('wallet_statement_money_out')
      : t('wallet_statement_unknown_direction');
  const status = transaction.status?.toLowerCase();
  const statusLabel = status === 'completed'
    ? t('wallet_statement_completed')
    : status === 'approved'
      ? t('wallet_statement_approved')
      : status === 'pending'
        ? t('wallet_statement_pending')
        : status === 'rejected'
          ? t('wallet_statement_rejected')
          : t('wallet_statement_unknown_status');
  const accent = transaction.direction === 'credit' ? colors.successText : colors.walletBlue;

  return (
    <View style={[styles.container, { backgroundColor: colors.walletBackground }]}>
      <ScreenHeader title={t('wallet_statement_details')} style={{ backgroundColor: colors.walletBackground }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.walletSurfaceAlt }]}>
          <View style={[styles.heroIcon, { backgroundColor: transaction.direction === 'credit' ? colors.successSoft : colors.walletSurface }]}>
            <Ionicons name={transaction.direction === 'credit' ? 'arrow-down-outline' : transaction.direction === 'debit' ? 'arrow-up-outline' : 'swap-horizontal-outline'} size={25} color={accent} />
          </View>
          <Text color={colors.walletTextMuted} weight="medium" style={styles.direction}>{direction}</Text>
          <Text color={colors.text} weight="extraBold" style={styles.amount}>
            {formatWalletStatementAmount(transaction, currency, i18n.language)}
          </Text>
          <Text color={colors.text} weight="semiBold" style={styles.title}>{title}</Text>
          <Text color={colors.walletTextMuted} style={styles.description}>{description}</Text>
        </View>

        <View style={[styles.details, { backgroundColor: colors.walletSurface, borderColor: colors.walletHairline }]}>
          <View style={[styles.detailRow, { borderBottomColor: colors.walletHairline }]}>
            <Text color={colors.walletTextMuted} style={styles.detailLabel}>{t('wallet_statement_date')}</Text>
            <Text color={colors.text} weight="medium" style={styles.detailValue}>{formatWalletStatementDate(transaction.time, true, i18n.language)}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: colors.walletHairline }]}>
            <Text color={colors.walletTextMuted} style={styles.detailLabel}>{t('wallet_statement_status')}</Text>
            <Text color={colors.text} weight="medium" style={styles.detailValue}>{statusLabel}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: colors.walletHairline }]}>
            <Text color={colors.walletTextMuted} style={styles.detailLabel}>{t('wallet_statement_reason')}</Text>
            <Text color={colors.text} weight="medium" style={styles.detailValue}>{description}</Text>
          </View>
          {transaction.referenceId && transaction.referenceId !== transaction.id ? (
            <View style={[styles.detailRow, { borderBottomColor: colors.walletHairline }]}>
              <Text color={colors.walletTextMuted} style={styles.detailLabel}>{t('wallet_statement_reference')}</Text>
              <Text color={colors.text} weight="medium" style={styles.reference} selectable>{transaction.referenceId}</Text>
            </View>
          ) : null}
          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <Text color={colors.walletTextMuted} style={styles.detailLabel}>{t('wallet_statement_transaction_id')}</Text>
            <Text color={colors.text} weight="medium" style={styles.reference} selectable>{transaction.id}</Text>
          </View>
        </View>

        {transaction.orderId ? (
          <Button
            label={t('wallet_statement_view_order')}
            fullWidth
            onPress={() => navigation.navigate('OrderDetailsScreen', { orderId: transaction.orderId! })}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignSelf: 'center', gap: 16, maxWidth: 480, padding: 16, paddingBottom: 40, width: '100%' },
  hero: { alignItems: 'center', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 28 },
  heroIcon: { alignItems: 'center', borderRadius: 18, height: 54, justifyContent: 'center', width: 54 },
  direction: { fontSize: 13, lineHeight: 18, marginTop: 14 },
  amount: { fontSize: 34, fontVariant: ['tabular-nums'], lineHeight: 42, marginTop: 3 },
  title: { fontSize: 18, lineHeight: 24, marginTop: 14, textAlign: 'center' },
  description: { fontSize: 13, lineHeight: 19, marginTop: 3, textAlign: 'center' },
  details: { borderRadius: 18, borderWidth: 1, paddingHorizontal: 16 },
  detailRow: { borderBottomWidth: StyleSheet.hairlineWidth, gap: 5, minHeight: 68, paddingVertical: 13 },
  lastDetailRow: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 12, lineHeight: 17 },
  detailValue: { fontSize: 15, lineHeight: 21 },
  reference: { fontSize: 13, lineHeight: 20 },
});
