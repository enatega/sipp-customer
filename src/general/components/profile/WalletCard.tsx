import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveriesCurrencyLabel } from '../../../general/stores/useAppConfigStore';
import Text from '../Text';
import PressableScale from '../PressableScale';
import { useTheme } from '../../theme/theme';

type Props = {
  balance: number | null | undefined;
  balanceLabel: string;
  buttonLabel: string;
  onPressWallet?: () => void;
};

export default function WalletCard({
  balance,
  balanceLabel,
  buttonLabel,
  onPressWallet,
}: Props) {
  const { colors } = useTheme();
  const currencyLabel = useDeliveriesCurrencyLabel();
  const formattedBalance = `${currencyLabel} ${(balance ?? 0).toLocaleString()}`;

  return (
    <View style={styles.wrapper}>
      <PressableScale
        accessibilityLabel={buttonLabel}
        accessibilityRole="button"
        onPress={onPressWallet}
        style={styles.pressable}
      >
        <LinearGradient
          colors={[colors.bannerGradientStart, colors.bannerGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={[styles.iconWell, { backgroundColor: colors.glassHighlight }]}> 
            <Ionicons name="wallet-outline" size={22} color={colors.white} />
          </View>
          <View style={styles.balanceSection}>
            <Text weight="medium" color={colors.white} style={styles.label}>
              {balanceLabel}
            </Text>
            <Text weight="bold" color={colors.white} style={styles.amount}>
              {formattedBalance}
            </Text>
          </View>
          <View style={[styles.arrow, { backgroundColor: colors.glassHighlight }]}> 
            <Ionicons name="arrow-forward" size={19} color={colors.white} />
          </View>
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: 20,
    letterSpacing: -0.27,
    lineHeight: 22,
  },
  balanceSection: {
    flex: 1,
    gap: 6,
  },
  arrow: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  gradient: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    minHeight: 104,
    overflow: 'hidden',
    padding: 16,
  },
  iconWell: {
    alignItems: 'center',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  label: {
    fontSize: 14,
    lineHeight: 22,
  },
  pressable: { borderRadius: 18, overflow: 'hidden' },
  wrapper: {
    paddingHorizontal: 16,
  },
});
