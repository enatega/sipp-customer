import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = { compact?: boolean };

export default function WalletTransactionsEmptyState({ compact = false }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors } = useTheme();
  return (
    <View style={[styles.container, compact ? styles.compact : styles.full, { backgroundColor: colors.walletSurface, borderColor: colors.walletHairline }]}>
      <Image
        source={require('../../assets/wallet/empty_receipt.png')}
        resizeMode="contain"
        style={compact ? styles.artCompact : styles.art}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <Text color={colors.text} weight="semiBold" style={styles.title}>{t('wallet_transactions_empty_title')}</Text>
      <Text color={colors.walletTextMuted} style={styles.description}>{t('wallet_transactions_empty_description')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', borderRadius: 18, borderWidth: 1, marginHorizontal: 16, paddingHorizontal: 24 },
  compact: { minHeight: 190, paddingBottom: 20, paddingTop: 12 },
  full: { flex: 1, marginTop: 20, paddingBottom: 30, paddingTop: 24 },
  art: { pointerEvents: 'none', height: 132, width: 132 },
  artCompact: { pointerEvents: 'none', height: 74, width: 74 },
  title: { fontSize: 17, lineHeight: 23, marginTop: 4, textAlign: 'center' },
  description: { fontSize: 13, lineHeight: 19, marginTop: 4, textAlign: 'center' },
});
