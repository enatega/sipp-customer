import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
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

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text weight="bold" color={colors.text} style={styles.title}>
        {t('wallet_topup_title')}
      </Text>
      <Text color={colors.mutedText}>
        {cardLabel ?? t('wallet_topup_card_required')}
      </Text>
      <View style={[styles.inputWrap, { borderColor: colors.border }]}>
        <Text color={colors.text}>{currency}</Text>
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
      <Button
        disabled={!isValid}
        isLoading={isLoading}
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
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  title: { fontSize: 18 },
  inputWrap: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
});
