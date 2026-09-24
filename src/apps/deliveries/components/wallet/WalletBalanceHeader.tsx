import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import ScreenHeader from '../../../../general/components/ScreenHeader';
import PlatformGlassSurface from '../../../../general/components/PlatformGlassSurface';
import { useTheme } from '../../../../general/theme/theme';
import WalletBalanceCard from './WalletBalanceCard';

type Props = {
  balanceLabel: string;
  balance: number;
  currency: string;
  isLoading?: boolean;
  isError?: boolean;
  onViewDetails: () => void;
  onOpenSettings: () => void;
};

export default function WalletBalanceHeader({ balanceLabel, balance, currency, isLoading = false, isError = false, onViewDetails, onOpenSettings }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');
  const { t: tGeneral } = useTranslation('general');
  const navigation = useNavigation();

  return (
    <View>
      <ScreenHeader
        title={t('wallet_title')}
        style={{ backgroundColor: colors.walletBackground, paddingBottom: 4 }}
        leftSlot={
          <Pressable accessibilityRole="button" accessibilityLabel={tGeneral('navigation_back')} onPress={() => navigation.goBack()} style={styles.headerControl}>
            <PlatformGlassSurface style={styles.headerGlass}>
              <Ionicons name="arrow-back" size={21} color={colors.text} />
            </PlatformGlassSurface>
          </Pressable>
        }
        rightSlot={
          <Pressable accessibilityRole="button" accessibilityLabel={t('settings_title')} onPress={onOpenSettings} style={styles.headerControl}>
            <PlatformGlassSurface style={styles.headerGlass}>
              <Ionicons name="settings-outline" size={20} color={colors.text} />
            </PlatformGlassSurface>
          </Pressable>
        }
      />
      <WalletBalanceCard
        balance={balance}
        balanceLabel={balanceLabel}
        currency={currency}
        actionLabel={t('wallet_view_details')}
        onAction={onViewDetails}
        isLoading={isLoading}
        isError={isError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerControl: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  headerGlass: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', overflow: 'hidden', width: 40 },
});
