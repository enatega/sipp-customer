import React from 'react';
import { Image, Modal, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  visible: boolean;
  kind: 'topup' | 'conversion';
  amount: number;
  currency: string;
  newBalance?: number;
  onDone: () => void;
  onViewTransactions: () => void;
};

export default function WalletSuccessOverlay({ visible, kind, amount, currency, newBalance, onDone, onViewTransactions }: Props) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const formattedAmount = `${currency} ${amount.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onDone} statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor={colors.walletSuccessBackground} />
      <View style={[styles.screen, { backgroundColor: colors.walletSuccessBackground, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]} accessibilityViewIsModal>
        <View style={styles.center}>
          <Image
            source={kind === 'topup' ? require('../../assets/wallet/success_wallet.png') : require('../../assets/wallet/success_check.png')}
            resizeMode="contain"
            style={styles.art}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Text color={colors.white} weight="bold" style={styles.title} accessibilityRole="header">
            {kind === 'topup' ? t('wallet_topup_success_title') : t('wallet_points_converted_title')}
          </Text>
          <Text color={colors.white} style={styles.description}>
            {kind === 'topup'
              ? t('wallet_topup_success_message', { amount: formattedAmount })
              : t('wallet_points_converted_message', { amount: amount.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), currency })}
          </Text>
          {newBalance !== undefined ? (
            <View style={[styles.balanceCard, { borderColor: colors.glassBorder, backgroundColor: colors.glassSurface }]}>
              <Text color={colors.white} style={styles.balanceLabel}>{t('wallet_statement_balance')}</Text>
              <Text color={colors.white} weight="bold" style={styles.balanceAmount}>
                {`${currency} ${newBalance.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onDone} style={styles.action}>
            <LinearGradient colors={[colors.walletCtaStart, colors.walletCtaEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
              <Text color={colors.white} weight="semiBold">{t('wallet_done')}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onViewTransactions} style={[styles.secondary, { borderColor: colors.glassBorder }]}>
            <Text color={colors.white} weight="medium">{t('wallet_view_transactions')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 18 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  art: { pointerEvents: 'none', height: 245, width: 245 },
  title: { fontSize: 28, lineHeight: 34, marginTop: 10, textAlign: 'center' },
  description: { fontSize: 14, lineHeight: 20, marginTop: 10, opacity: 0.86, textAlign: 'center' },
  balanceCard: { alignSelf: 'stretch', borderRadius: 18, borderWidth: 1, marginTop: 28, padding: 18 },
  balanceLabel: { fontSize: 12, lineHeight: 16, opacity: 0.8 },
  balanceAmount: { fontSize: 24, fontVariant: ['tabular-nums'], lineHeight: 30, marginTop: 4 },
  actions: { gap: 10 },
  action: { borderRadius: 18 },
  primary: { alignItems: 'center', borderRadius: 18, height: 56, justifyContent: 'center' },
  secondary: { alignItems: 'center', borderRadius: 18, borderWidth: 1, height: 52, justifyContent: 'center' },
});
