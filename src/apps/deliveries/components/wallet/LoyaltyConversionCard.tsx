import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

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
      <View style={styles.headingRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.quickActionDealsSurface }]}> 
          <Ionicons name="sparkles-outline" size={20} color={colors.quickActionDealsForeground} />
        </View>
        <View style={styles.headingCopy}>
          <Text weight="bold" color={colors.text} style={styles.title}>{t('wallet_convert_points_title')}</Text>
          <Text color={colors.mutedText} style={styles.supporting}>{t('wallet_points_available', { points: availablePoints })}</Text>
        </View>
      </View>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSunken }]}> 
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
      <View style={[styles.conversionPreview, { backgroundColor: colors.successSoft }]}> 
        <Ionicons name="arrow-forward" size={17} color={colors.successText} />
        <Text color={colors.successText} weight="semiBold" style={styles.previewText}>{t('wallet_points_receive', { amount: amount.toFixed(2), currency })}</Text>
      </View>
      <Button
        disabled={!isValid}
        fullWidth
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
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
  },
  conversionPreview: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 8, minHeight: 44, paddingHorizontal: 12 },
  headingCopy: { flex: 1, gap: 2 },
  headingRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconWrap: { alignItems: 'center', borderRadius: 13, height: 42, justifyContent: 'center', width: 42 },
  input: {
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1,
  },
  previewText: { flex: 1, fontSize: 13, lineHeight: 18 },
  supporting: { fontSize: 13, lineHeight: 18 },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
});
