import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Button from '../../../../general/components/Button';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  availablePoints: number;
  currency: string;
  isLoading: boolean;
  onConvert: (points: number) => Promise<void>;
  pointsEqualsOne: number;
};

export default function LoyaltyConversionCard({
  availablePoints,
  currency,
  isLoading,
  onConvert,
  pointsEqualsOne,
}: Props) {
  const { t } = useTranslation('deliveries');
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const points = Math.floor(Number(value));
  const isValid = points > 0 && points <= availablePoints && pointsEqualsOne > 0;
  const amount = useMemo(
    () => (isValid ? points / pointsEqualsOne : 0),
    [isValid, points, pointsEqualsOne],
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text weight="bold" color={colors.text} style={styles.title}>
        {t('wallet_convert_points_title')}
      </Text>
      <Text color={colors.mutedText}>
        {t('wallet_points_available', { points: availablePoints })}
      </Text>
      <View style={[styles.inputWrap, { borderColor: colors.border }]}>
        <TextInput
          accessibilityLabel={t('wallet_points_input')}
          keyboardType="number-pad"
          onChangeText={(next) => setValue(next.replace(/[^0-9]/g, ''))}
          placeholder={t('wallet_points_input')}
          placeholderTextColor={colors.mutedText}
          style={[styles.input, { color: colors.text }]}
          value={value}
        />
      </View>
      <Text color={colors.text}>
        {t('wallet_points_receive', {
          amount: amount.toFixed(2),
          currency,
        })}
      </Text>
      <Button
        disabled={!isValid}
        isLoading={isLoading}
        label={t('wallet_convert_points_action')}
        onPress={() => {
          void onConvert(points)
            .then(() => setValue(''))
            .catch(() => undefined);
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
  input: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrap: {
    borderRadius: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
  },
});
