import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  availablePoints: number;
  currency: string;
  isLoading: boolean;
  onConvert: (points: number) => Promise<void>;
  pointsEqualsOne: number;
  totalEarnedPoints?: number;
  loyaltyWalletAmount?: number;
};

export default function LoyaltyConversionCard({ availablePoints, currency, isLoading, onConvert, pointsEqualsOne, totalEarnedPoints, loyaltyWalletAmount }: Props) {
  const { t, i18n } = useTranslation('deliveries');
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [sliderWidth, setSliderWidth] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const points = Math.floor(Number(value));
  const isValid = points > 0 && points <= availablePoints && pointsEqualsOne > 0;
  const amount = useMemo(() => (isValid ? points / pointsEqualsOne : 0), [isValid, points, pointsEqualsOne]);
  const progress = availablePoints > 0 && Number.isFinite(points) ? Math.min(1, Math.max(0, points / availablePoints)) : 0;
  const ctaColors: [string, string] = isValid
    ? [colors.walletLoyaltyStart, colors.walletLoyaltyEnd]
    : [colors.walletSurfaceAlt, colors.walletSurfaceAlt];

  const updateSlider = (locationX: number) => {
    if (isLoading || availablePoints <= 0 || sliderWidth <= 0) return;
    const next = Math.round(Math.min(1, Math.max(0, locationX / sliderWidth)) * availablePoints);
    setValue(String(next));
  };

  return (
    <View style={styles.form}>
      <View style={[styles.summary, { backgroundColor: colors.walletLoyaltySurfaceStart }]}>
        <View style={[styles.summaryIcon, { backgroundColor: colors.walletSurface }]}>
          <Ionicons name="sparkles-outline" size={22} color={colors.walletPink} />
        </View>
        <View style={styles.summaryCopy}>
          <Text color={colors.walletTextMuted} style={styles.summaryLabel}>{t('wallet_loyalty_available_points')}</Text>
          <Text color={colors.text} weight="bold" style={styles.summaryValue}>{availablePoints.toLocaleString(i18n.language)}</Text>
          {pointsEqualsOne > 0 ? <Text color={colors.walletTextMuted} style={styles.rate}>{t('wallet_loyalty_rate', { points: pointsEqualsOne, currency })}</Text> : null}
        </View>
        {totalEarnedPoints !== undefined && loyaltyWalletAmount !== undefined ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t(showHistory ? 'wallet_loyalty_hide_details' : 'wallet_loyalty_details')} accessibilityState={{ expanded: showHistory }} onPress={() => setShowHistory((current) => !current)} style={styles.detailsButton}>
            <Ionicons name="information-circle-outline" size={22} color={colors.walletPurple} />
          </Pressable>
        ) : null}
      </View>

      {availablePoints <= 0 ? <Text color={colors.walletTextMuted} style={styles.zeroNote}>{t('wallet_loyalty_zero_state')}</Text> : null}
      <View style={styles.inputHeading}>
        <Text color={colors.text} weight="semiBold" style={styles.inputLabel}>{t('wallet_points_input')}</Text>
        {availablePoints > 0 ? (
          <Pressable accessibilityRole="button" disabled={isLoading} onPress={() => setValue(String(availablePoints))} style={styles.maxButton}>
            <Text color={colors.walletPurple} weight="semiBold">{t('wallet_points_max')}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.inputWrap, { backgroundColor: colors.walletSurfaceAlt, borderColor: colors.walletHairline }]}>
        <TextInput
          accessibilityLabel={t('wallet_points_input')}
          editable={!isLoading && availablePoints > 0}
          keyboardType="number-pad"
          onChangeText={(next) => setValue(next.replace(/[^0-9]/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.walletTextMuted}
          style={[styles.input, { color: colors.text }]}
          value={value}
        />
        {value ? <Pressable accessibilityRole="button" accessibilityLabel={t('wallet_clear_amount')} disabled={isLoading} onPress={() => setValue('')} style={styles.clear}><Ionicons name="close-circle" size={22} color={colors.walletTextMuted} /></Pressable> : null}
      </View>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('wallet_points_input')}
        accessibilityValue={{ min: 0, max: availablePoints, now: Number.isFinite(points) ? Math.min(points, availablePoints) : 0 }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          const step = Math.max(1, Math.round(availablePoints / 20));
          setValue(String(Math.min(availablePoints, Math.max(0, points + (event.nativeEvent.actionName === 'increment' ? step : -step)))));
        }}
        onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
        onTouchStart={(event) => updateSlider(event.nativeEvent.locationX)}
        onTouchMove={(event) => updateSlider(event.nativeEvent.locationX)}
        style={styles.sliderHit}
      >
        <View style={[styles.sliderTrack, { backgroundColor: colors.walletLoyaltySurfaceEnd }]}>
          <View style={[styles.sliderProgress, { backgroundColor: colors.walletPink, width: `${progress * 100}%` as `${number}%` }]} />
        </View>
        <View style={[styles.thumb, { backgroundColor: colors.walletPurple, left: Math.max(0, sliderWidth * progress - 12), borderColor: colors.walletSurface }]} />
      </View>
      <View style={styles.sliderLabels}>
        <Text color={colors.walletTextMuted} style={styles.sliderLabel}>0</Text>
        <Text color={colors.walletTextMuted} style={styles.sliderLabel}>{availablePoints.toLocaleString(i18n.language)}</Text>
      </View>
      <View style={[styles.preview, { backgroundColor: colors.successSoft }]}>
        <Ionicons name="sparkles-outline" size={20} color={colors.successText} />
        <View style={styles.previewCopy}>
          <Text color={colors.successText} style={styles.previewLabel}>{t('wallet_loyalty_receive_label')}</Text>
          <Text color={colors.successText} weight="bold" style={styles.previewAmount}>{`${currency} ${amount.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text>
        </View>
      </View>
      {showHistory && totalEarnedPoints !== undefined && loyaltyWalletAmount !== undefined ? (
        <View style={[styles.historyMetrics, { borderColor: colors.walletHairline }]}>
          <View style={styles.historyMetric}>
            <Text color={colors.walletTextMuted} style={styles.historyLabel}>{t('wallet_loyalty_total_points')}</Text>
            <Text color={colors.text} weight="semiBold" style={styles.historyValue}>{totalEarnedPoints.toLocaleString(i18n.language)}</Text>
          </View>
          <View style={styles.historyMetric}>
            <Text color={colors.walletTextMuted} style={styles.historyLabel}>{t('wallet_loyalty_amount')}</Text>
            <Text color={colors.text} weight="semiBold" style={styles.historyValue}>{`${currency} ${loyaltyWalletAmount.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text>
          </View>
        </View>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: !isValid || isLoading, busy: isLoading }} disabled={!isValid || isLoading} onPress={() => { void onConvert(points).then(() => setValue('')).catch(() => undefined); }} style={styles.submit}>
        <LinearGradient colors={ctaColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient}>
          {isLoading ? <ActivityIndicator color={colors.white} /> : (
            <>
              <Text color={isValid ? colors.white : colors.walletTextMuted} weight="semiBold" style={styles.submitText}>{t('wallet_convert_points_action')}</Text>
              {isValid ? <Ionicons name="arrow-forward" size={19} color={colors.white} /> : null}
            </>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { flexGrow: 1 },
  summary: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 12, minHeight: 78, paddingHorizontal: 16 },
  summaryIcon: { alignItems: 'center', borderRadius: 16, height: 40, justifyContent: 'center', width: 40 },
  summaryCopy: { flex: 1 },
  detailsButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  summaryLabel: { fontSize: 12, lineHeight: 16 },
  summaryValue: { fontSize: 20, fontVariant: ['tabular-nums'], lineHeight: 25 },
  rate: { fontSize: 11, lineHeight: 15 },
  zeroNote: { fontSize: 13, lineHeight: 19, marginTop: 12 },
  inputHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  inputLabel: { fontSize: 14, lineHeight: 20 },
  maxButton: { justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
  inputWrap: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flexDirection: 'row', height: 58, marginTop: 6, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 24, fontVariant: ['tabular-nums'], paddingVertical: 10 },
  clear: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  sliderHit: { height: 44, justifyContent: 'center', marginTop: 10 },
  sliderTrack: { borderRadius: 2, height: 4, overflow: 'hidden' },
  sliderProgress: { height: 4 },
  thumb: { borderRadius: 14, borderWidth: 2, height: 24, position: 'absolute', width: 24 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 12, lineHeight: 16 },
  preview: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', gap: 12, minHeight: 78, marginTop: 18, paddingHorizontal: 16 },
  previewCopy: { gap: 2 },
  previewLabel: { fontSize: 12, lineHeight: 16 },
  previewAmount: { fontSize: 22, fontVariant: ['tabular-nums'], lineHeight: 27 },
  historyMetrics: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, marginTop: 16, paddingTop: 14 },
  historyMetric: { flex: 1, gap: 3 },
  historyLabel: { fontSize: 11, lineHeight: 15 },
  historyValue: { fontSize: 13, fontVariant: ['tabular-nums'], lineHeight: 18 },
  submit: { borderRadius: 18, marginTop: 'auto', paddingTop: 24 },
  submitGradient: { alignItems: 'center', borderRadius: 18, flexDirection: 'row', gap: 8, height: 56, justifyContent: 'center' },
  submitText: { fontSize: 16, lineHeight: 20 },
});
