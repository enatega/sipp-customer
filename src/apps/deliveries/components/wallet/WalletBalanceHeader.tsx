import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '../../../../general/components/ScreenHeader';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  balanceLabel: string;
  balance: number;
  currency: string;
  loyaltyAmount?: number;
  loyaltyAmountLabel?: string;
  loyaltyPoints?: number;
  loyaltyPointsLabel?: string;
  loyaltyRateLabel?: string;
};

export default function WalletBalanceHeader({
  balanceLabel,
  balance,
  currency,
  loyaltyAmount,
  loyaltyAmountLabel,
  loyaltyPoints,
  loyaltyPointsLabel,
  loyaltyRateLabel,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');

  return (
    <LinearGradient
      colors={[colors.bannerGradientStart, colors.bannerGradientEnd]}
      start={{ x: 1, y: 0.5 }}
      end={{ x: 0, y: 0.5 }}
      style={styles.gradient}
    >
      <ScreenHeader foregroundColor={colors.white} title={t('wallet_title')} style={styles.header} showBack />
      <View style={styles.balanceSection}>
        <View style={[styles.walletGlyph, { backgroundColor: colors.glassHighlight }]}> 
          <Ionicons name="wallet-outline" size={22} color={colors.white} />
        </View>
        <View style={styles.balanceCopy}>
          <Text weight="medium" color={colors.white} style={styles.label}>{balanceLabel}</Text>
          <Text weight="extraBold" color={colors.white} style={styles.amount}>
            {`${currency} ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </Text>
        </View>
        {loyaltyPointsLabel ? (
          <View style={[styles.loyaltyPanel, { backgroundColor: colors.glassHighlight }]}> 
            <View style={styles.loyaltyMetric}>
              <Text color={colors.white} weight="bold" style={styles.loyaltyValue}>{(loyaltyPoints ?? 0).toLocaleString()}</Text>
              <Text color={colors.white} style={styles.loyaltyLabel}>{loyaltyPointsLabel}</Text>
            </View>
            <View style={[styles.loyaltyDivider, { backgroundColor: colors.glassBorder }]} />
            <View style={styles.loyaltyMetric}>
              <Text color={colors.white} weight="bold" style={styles.loyaltyValue}>{`${currency} ${(loyaltyAmount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}</Text>
              <Text color={colors.white} style={styles.loyaltyLabel}>{loyaltyAmountLabel}</Text>
            </View>
            <Text color={colors.white} style={styles.rateLabel}>{loyaltyRateLabel}</Text>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 24,
  },
  header: {
    backgroundColor: 'transparent',
  },
  balanceSection: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  balanceCopy: { flex: 1, gap: 2 },
  label: {
    fontSize: 14,
    lineHeight: 22,
  },
  amount: {
    fontSize: 30,
    fontVariant: ['tabular-nums'],
    lineHeight: 36,
    letterSpacing: -0.36,
  },
  loyaltyDivider: { height: 36, width: StyleSheet.hairlineWidth },
  loyaltyLabel: { fontSize: 11, lineHeight: 15, opacity: 0.82 },
  loyaltyMetric: { flex: 1, gap: 2 },
  loyaltyPanel: {
    alignItems: 'center',
    borderRadius: 16,
    flexBasis: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    padding: 14,
  },
  loyaltyValue: { fontSize: 16, fontVariant: ['tabular-nums'], lineHeight: 20 },
  rateLabel: { bottom: 4, fontSize: 10, opacity: 0.72, position: 'absolute', right: 12 },
  walletGlyph: { alignItems: 'center', borderRadius: 16, height: 52, justifyContent: 'center', width: 52 },
});
