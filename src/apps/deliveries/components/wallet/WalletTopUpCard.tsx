import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  cardLabel?: string;
  cardExpiry?: string;
  currency: string;
  currencyCode: string;
  initialAmount?: number;
  value: string;
  onValueChange: (value: string) => void;
  isLoading: boolean;
  onAddCard: () => void;
  onSelectCard: () => void;
  onSubmit: (amount: number) => Promise<void>;
};

export default function WalletTopUpCard({ cardLabel, cardExpiry, currency, currencyCode, initialAmount, value, onValueChange, isLoading, onAddCard, onSelectCard, onSubmit }: Props) {
  const { t, i18n } = useTranslation('deliveries');
  const { colors } = useTheme();
  const amount = Number(value);
  const minimumAmount = currencyCode.toUpperCase() === 'CRC' ? 500 : 0.01;
  const suggestedAmount = initialAmount ? Math.max(initialAmount, minimumAmount) : undefined;
  const isValid = Number.isFinite(amount) && amount >= minimumAmount && /^\d+(?:\.\d{1,2})?$/.test(value);
  const quickAmounts = currencyCode.toUpperCase() === 'CRC' ? [500, 1000, 2500, 5000] : [10, 25, 50, 100];
  const minimumLabel = `${currency} ${minimumAmount.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedAmount = `${currency} ${amount.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}`;
  const cardBrand = cardLabel?.split(' ')[0];
  const ctaColors: [string, string] = isValid && cardLabel
    ? [colors.walletCtaStart, colors.walletCtaEnd]
    : [colors.walletSurfaceAlt, colors.walletSurfaceAlt];

  const handleValueChange = (next: string) => {
    const normalized = next.replace(',', '.').replace(/[^0-9.]/g, '');
    const [whole = '', ...fractions] = normalized.split('.');
    onValueChange(fractions.length ? `${whole}.${fractions.join('').slice(0, 2)}` : whole);
  };

  return (
    <View style={styles.form}>
      <Text color={colors.text} weight="semiBold" style={styles.label}>{t('wallet_select_payment_method')}</Text>
      <Pressable accessibilityRole="button" onPress={onSelectCard} disabled={isLoading} style={[styles.paymentRow, { borderColor: colors.walletHairline, backgroundColor: colors.walletSurface }]}>
        <View style={[styles.paymentIcon, { backgroundColor: colors.walletSurfaceAlt }]}>
          {cardBrand ? <Text color={colors.walletBlue} weight="bold" style={styles.cardBrand} numberOfLines={1}>{cardBrand}</Text> : <Ionicons name="card-outline" size={22} color={colors.walletBlue} />}
        </View>
        <View style={styles.paymentCopy}>
          <Text color={cardLabel ? colors.text : colors.walletTextMuted} weight="semiBold" style={styles.paymentLabel} numberOfLines={1}>
            {cardLabel ?? t('wallet_choose_payment_method')}
          </Text>
          {cardExpiry ? <Text color={colors.walletTextMuted} style={styles.paymentExpiry}>{cardExpiry}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.walletTextMuted} />
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onAddCard} disabled={isLoading} style={[styles.addCard, { backgroundColor: colors.walletSurfaceAlt }]}>
        <Ionicons name="add" size={20} color={colors.walletBlue} />
        <Text color={colors.walletBlue} weight="medium">{t('wallet_add_card')}</Text>
      </Pressable>

      <Text color={colors.text} weight="semiBold" style={[styles.label, styles.amountLabel]}>{t('wallet_topup_amount')}</Text>
      <View style={[styles.amountStage, { backgroundColor: colors.walletSurfaceAlt, borderColor: colors.walletHairline }]}>
        <Text color={colors.text} weight="bold" style={styles.currency}>{currency}</Text>
        <TextInput
          accessibilityLabel={t('wallet_topup_amount')}
          editable={!isLoading}
          keyboardType="decimal-pad"
          onChangeText={handleValueChange}
          placeholder="0"
          placeholderTextColor={colors.walletTextMuted}
          style={[styles.input, { color: colors.text }]}
          value={value}
        />
        {value ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('wallet_clear_amount')} onPress={() => onValueChange('')} disabled={isLoading} style={styles.clear}>
            <Ionicons name="close-circle" size={23} color={colors.walletTextMuted} />
          </Pressable>
        ) : null}
      </View>
      <Text color={value && !isValid ? colors.warningText : colors.walletTextMuted} style={styles.minimum}>
        {t('wallet_topup_minimum', { amount: minimumLabel })}
      </Text>
      {initialAmount ? (
        <Pressable accessibilityRole="button" onPress={() => onValueChange((suggestedAmount ?? initialAmount).toFixed(2))} disabled={isLoading} style={[styles.coverOrder, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="bag-handle-outline" size={18} color={colors.walletBlue} />
          <Text color={colors.walletBlue} weight="semiBold" style={styles.coverOrderText}>
            {t('wallet_cover_order', { amount: `${currency} ${(suggestedAmount ?? initialAmount).toFixed(2)}` })}
          </Text>
        </Pressable>
      ) : null}
      <View style={styles.presets}>
        {quickAmounts.map((quickAmount) => {
          const selected = amount === quickAmount;
          return (
            <Pressable
              key={quickAmount}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={isLoading}
              onPress={() => onValueChange(String(quickAmount))}
              style={[styles.preset, { backgroundColor: selected ? colors.walletBlue : colors.walletSurfaceAlt, borderColor: selected ? colors.walletBlue : colors.walletHairline }]}
            >
              <Text color={selected ? colors.white : colors.text} weight="semiBold" style={styles.presetText} numberOfLines={1}>
                {`${currency} ${quickAmount.toLocaleString(i18n.language)}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !isValid || !cardLabel || isLoading, busy: isLoading }}
        disabled={!isValid || !cardLabel || isLoading}
        onPress={() => { void onSubmit(amount).then(() => onValueChange('')).catch(() => undefined); }}
        style={styles.submit}
      >
        <LinearGradient colors={ctaColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGradient}>
          {isLoading ? <ActivityIndicator color={colors.white} /> : (
            <>
              <Text color={isValid && cardLabel ? colors.white : colors.walletTextMuted} weight="semiBold" style={styles.submitText} numberOfLines={2}>
                {isValid ? t('wallet_topup_action_amount', { amount: formattedAmount }) : t('wallet_topup_action')}
              </Text>
              {isValid && cardLabel ? <Ionicons name="arrow-forward" size={19} color={colors.white} /> : null}
            </>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { flexGrow: 1 },
  label: { fontSize: 14, lineHeight: 20 },
  paymentRow: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 12, height: 58, marginTop: 8, paddingHorizontal: 12 },
  paymentIcon: { alignItems: 'center', borderRadius: 10, height: 38, justifyContent: 'center', width: 38 },
  cardBrand: { fontSize: 9, letterSpacing: -0.3 },
  paymentCopy: { flex: 1, minWidth: 0 },
  paymentLabel: { fontSize: 14, lineHeight: 19 },
  paymentExpiry: { fontSize: 11, lineHeight: 15 },
  addCard: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', gap: 8, height: 46, marginTop: 6, paddingHorizontal: 14 },
  amountLabel: { marginTop: 24 },
  amountStage: { alignItems: 'center', borderRadius: 16, borderWidth: 1, flexDirection: 'row', height: 84, marginTop: 8, paddingHorizontal: 16 },
  currency: { fontSize: 24, lineHeight: 32 },
  input: { flex: 1, fontSize: 34, fontWeight: '600', fontVariant: ['tabular-nums'], minWidth: 0, paddingHorizontal: 8, paddingVertical: 12 },
  clear: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  minimum: { fontSize: 12, lineHeight: 16, marginTop: 6 },
  coverOrder: { alignItems: 'center', borderRadius: 12, flexDirection: 'row', gap: 8, minHeight: 44, marginTop: 10, paddingHorizontal: 12 },
  coverOrderText: { flex: 1, fontSize: 12 },
  presets: { flexDirection: 'row', gap: 6, marginTop: 12 },
  preset: { alignItems: 'center', borderRadius: 14, borderWidth: 1, flex: 1, height: 44, justifyContent: 'center', minWidth: 0, paddingHorizontal: 2 },
  presetText: { fontSize: 11, fontVariant: ['tabular-nums'] },
  submit: { borderRadius: 18, marginTop: 'auto', paddingTop: 24 },
  submitGradient: { alignItems: 'center', borderRadius: 18, flexDirection: 'row', gap: 8, height: 56, justifyContent: 'center', paddingHorizontal: 14 },
  submitText: { flexShrink: 1, fontSize: 16, lineHeight: 20, textAlign: 'center' },
});
