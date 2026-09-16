import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type TransactionIconType = 'cashback' | 'booking' | 'refund' | 'topup';

type Props = {
  amount?: number;
  currency: string;
  iconType: TransactionIconType;
  status?: string;
  title: string;
  subtitle: string;
  time: string;
};

const ICON_MAP: Record<TransactionIconType, keyof typeof Ionicons.glyphMap> = {
  cashback: 'sparkles-outline',
  booking: 'bag-handle-outline',
  refund: 'arrow-undo-outline',
  topup: 'add-circle-outline',
};

function formatTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  }).format(date);
}

export default function WalletTransactionItem({
  amount, currency, iconType, status, subtitle, time, title,
}: Props) {
  const { colors } = useTheme();
  const isCredit = iconType === 'cashback' || iconType === 'refund' || iconType === 'topup';
  const amountLabel = useMemo(() => {
    if (amount === undefined) return null;
    const formatted = Math.abs(amount).toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    return `${isCredit ? '+' : '−'}${currency} ${formatted}`;
  }, [amount, currency, isCredit]);
  const normalizedStatus = status?.replace(/_/g, ' ').trim();

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}> 
      <View style={[styles.iconWrap, { backgroundColor: isCredit ? colors.successSoft : colors.primarySoft }]}> 
        <Ionicons name={ICON_MAP[iconType]} size={20} color={isCredit ? colors.successText : colors.primary} />
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} weight="semiBold" color={colors.text} style={styles.title}>
          {title}
        </Text>
        {subtitle ? <Text numberOfLines={1} color={colors.mutedText} style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.metaRow}>
          {normalizedStatus ? <Text color={colors.textSubtle} weight="medium" style={styles.meta}>{normalizedStatus}</Text> : null}
          {normalizedStatus && time ? <View style={[styles.dot, { backgroundColor: colors.iconDisabled }]} /> : null}
          {time ? <Text color={colors.mutedText} style={styles.meta}>{formatTime(time)}</Text> : null}
        </View>
      </View>
      {amountLabel ? <Text color={isCredit ? colors.successText : colors.text} weight="semiBold" style={styles.amount}>{amountLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 76,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  amount: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    lineHeight: 20,
    textAlign: 'right',
  },
  dot: {
    borderRadius: 2,
    height: 3,
    width: 3,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
});
