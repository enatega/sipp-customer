import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  return (
    <LinearGradient
      colors={[colors.bannerGradientStart, colors.bannerGradientEnd]}
      start={{ x: 1, y: 0.5 }}
      end={{ x: 0, y: 0.5 }}
      style={styles.gradient}
    >
      <ScreenHeader
        style={styles.header}
        showBack
      />
      <View style={styles.balanceSection}>
        <Text weight="medium" color={colors.white} style={styles.label}>
          {balanceLabel}
        </Text>
        <Text weight="bold" color={colors.white} style={styles.amount}>
          {`${currency} ${balance.toLocaleString()}`}
        </Text>
        {loyaltyPointsLabel ? (
          <View style={styles.loyaltyDetails}>
            <Text color={colors.white}>{`${loyaltyPointsLabel}: ${loyaltyPoints ?? 0}`}</Text>
            <Text color={colors.white}>{loyaltyRateLabel}</Text>
            <Text color={colors.white}>{`${loyaltyAmountLabel}: ${currency} ${(loyaltyAmount ?? 0).toLocaleString()}`}</Text>
          </View>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: 'transparent',
  },
  balanceSection: {
    paddingHorizontal: 16,
    gap: 4,
  },
  label: {
    fontSize: 14,
    lineHeight: 22,
  },
  amount: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.36,
  },
  loyaltyDetails: {
    gap: 2,
    marginTop: 8,
  },
});
