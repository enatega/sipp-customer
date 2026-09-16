import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  cardLabel?: string;
  currency: string;
  isLoading: boolean;
  onSubmit: (amount: number) => Promise<void>;
};

export default function WalletTopUpCard({ cardLabel, currency, isLoading, onSubmit }: Props) {
  const { t } = useTranslation('deliveries');
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const amount = Number(value);
  const isValid = Number.isFinite(amount) && amount > 0 && Boolean(cardLabel);
  const quickAmounts = [10, 25, 50];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.headingRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}> 
          <Ionicons name="add" size={20} color={colors.primary} />
        </View>
        <View style={styles.headingCopy}>
          <Text weight="bold" color={colors.text} style={styles.title}>{t('wallet_topup_title')}</Text>
          <Text color={colors.mutedText} style={styles.supporting}>{cardLabel ?? t('wallet_topup_card_required')}</Text>
        </View>
      </View>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSunken }]}> 
        <Text weight="semiBold" color={colors.text} style={styles.currency}>{currency}</Text>
        <TextInput
          accessibilityLabel={t('wallet_topup_amount')}
          keyboardType="decimal-pad"
          onChangeText={(next) => setValue(next.replace(/[^0-9.]/g, ''))}
          placeholder={t('wallet_topup_amount')}
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text }]}
          value={value}
        />
      </View>
      <View style={styles.quickRow}>
        {quickAmounts.map((quickAmount) => (
          <Pressable
            accessibilityRole="button"
            key={quickAmount}
            onPress={() => setValue(String(quickAmount))}
            style={({ pressed }) => [
              styles.quickAmount,
              {
                backgroundColor: Number(value) === quickAmount ? colors.primarySoft : colors.backgroundTertiary,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <Text color={Number(value) === quickAmount ? colors.primary : colors.text} weight="semiBold" style={styles.quickAmountText}>
              {`${currency} ${quickAmount}`}
            </Text>
          </Pressable>
        ))}
      </View>
      <Button
        disabled={!isValid}
        isLoading={isLoading}
        fullWidth
        label={t('wallet_topup_action')}
        onPress={() => {
          void onSubmit(amount).then(() => setValue('')).catch(() => undefined);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
  },
  currency: { fontSize: 16, minWidth: 32 },
  headingCopy: { flex: 1, gap: 2 },
  headingRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconWrap: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  inputWrap: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  quickAmount: { alignItems: 'center', borderRadius: 10, flex: 1, minHeight: 38, justifyContent: 'center', paddingHorizontal: 8 },
  quickAmountText: { fontSize: 13, fontVariant: ['tabular-nums'], lineHeight: 18 },
  quickRow: { flexDirection: 'row', gap: 8 },
  supporting: { fontSize: 13, lineHeight: 18 },
  title: { fontSize: 18, lineHeight: 24 },
});
