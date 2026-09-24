import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { WalletTransaction } from '../../../../general/api/walletSavedCardsService';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import {
  formatWalletStatementAmount,
  formatWalletStatementDate,
  statementDescriptionKeys,
  statementTitleKeys,
} from './walletStatementPresentation';

type Props = {
  transaction: WalletTransaction;
  currency: string;
  onPress?: () => void;
};

export default function WalletTransactionItem({ transaction, currency, onPress }: Props) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation('deliveries');
  const isCredit = transaction.direction === 'credit';
  const isUnknown = transaction.direction === 'unknown';
  const title = t(statementTitleKeys[transaction.reasonCode]);
  const description = t(statementDescriptionKeys[transaction.reasonCode]);
  const showDescription = transaction.reasonCode === 'credit' || transaction.reasonCode === 'debit' || transaction.reasonCode === 'unknown';
  const amount = formatWalletStatementAmount(transaction, currency, i18n.language);
  const icon = transaction.reasonCode === 'order_payment'
    ? 'bag-handle-outline'
    : transaction.reasonCode === 'order_refund'
      ? 'arrow-undo-outline'
      : transaction.reasonCode === 'loyalty_conversion'
        ? 'sparkles-outline'
        : isCredit ? 'arrow-down-outline' : isUnknown ? 'swap-horizontal-outline' : 'arrow-up-outline';
  const foreground = isCredit ? colors.successText : colors.text;
  const iconForeground = isCredit ? colors.successText : colors.walletBlue;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${amount}, ${formatWalletStatementDate(transaction.time, false, i18n.language)}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: colors.walletHairline, opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: isCredit ? colors.successSoft : colors.walletSurfaceAlt }]}>
        <Ionicons name={icon} size={18} color={iconForeground} />
      </View>
      <View style={styles.content}>
        <Text numberOfLines={2} weight="semiBold" color={colors.text} style={styles.title}>{title}</Text>
        {showDescription ? <Text numberOfLines={1} color={colors.walletTextMuted} style={styles.subtitle}>{description}</Text> : null}
        <Text color={colors.walletTextMuted} style={styles.time}>{formatWalletStatementDate(transaction.time, false, i18n.language)}</Text>
      </View>
      <View style={styles.trailing}>
        <Text color={foreground} weight="bold" style={styles.amount}>{amount}</Text>
        {onPress ? <Ionicons name="chevron-forward" size={15} color={colors.walletTextMuted} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    minHeight: 66,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconWrap: { alignItems: 'center', borderRadius: 12, height: 38, justifyContent: 'center', width: 38 },
  content: { flex: 1, gap: 1 },
  title: { fontSize: 14, lineHeight: 18 },
  subtitle: { fontSize: 12, lineHeight: 17 },
  time: { fontSize: 11, lineHeight: 15 },
  trailing: { alignItems: 'flex-end', flexDirection: 'row', gap: 5, justifyContent: 'flex-end', maxWidth: '43%' },
  amount: { fontSize: 14, fontVariant: ['tabular-nums'], lineHeight: 19, textAlign: 'right' },
});
