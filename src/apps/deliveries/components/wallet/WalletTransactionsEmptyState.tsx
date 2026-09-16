import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  compact?: boolean;
};

export default function WalletTransactionsEmptyState({ compact = false }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors } = useTheme();

  return (
    <View style={[styles.container, compact ? styles.containerCompact : null]}>
      <View style={[styles.iconWrap, compact ? styles.iconWrapCompact : null, { backgroundColor: colors.primarySoft }]}> 
        <Ionicons name="receipt-outline" size={compact ? 26 : 34} color={colors.primary} />
        <View style={[styles.sparkle, { backgroundColor: colors.quickActionDealsSurface }]}> 
          <Ionicons name="sparkles" size={13} color={colors.quickActionDealsForeground} />
        </View>
      </View>
      <Text color={colors.text} weight="semiBold" style={styles.title}>
        {t('wallet_transactions_empty_title')}
      </Text>
      <Text color={colors.mutedText} style={styles.description}>
        {t('wallet_transactions_empty_description')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    flex: 1,
    paddingBottom: 40,
    paddingTop: 64,
  },
  containerCompact: {
    paddingTop: 28,
  },
  iconWrap: { alignItems: 'center', borderRadius: 24, height: 88, justifyContent: 'center', marginBottom: 4, width: 88 },
  iconWrapCompact: { borderRadius: 18, height: 64, width: 64 },
  sparkle: { alignItems: 'center', borderRadius: 12, bottom: -2, height: 24, justifyContent: 'center', position: 'absolute', right: -2, width: 24 },
  title: {
    fontSize: 18,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
});
