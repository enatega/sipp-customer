import React, { useCallback, useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CardField, useConfirmSetupIntent } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../../../../../general/components/ScreenHeader';
import Text from '../../../../../general/components/Text';
import Button from '../../../../../general/components/Button';
import { showToast } from '../../../../../general/components/AppToast';
import {
  useWalletSetupIntentMutation,
  walletSavedCardsKeys,
} from '../../../../../general/api/walletSavedCardsService';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveriesStackParamList } from '../../../navigation/types';

export default function AddCardScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation('deliveries');
  const navigation = useNavigation<NavigationProp<DeliveriesStackParamList>>();
  const queryClient = useQueryClient();
  const setupIntentMutation = useWalletSetupIntentMutation('deliveries');
  const { confirmSetupIntent } = useConfirmSetupIntent();

  const [holderName, setHolderName] = useState('');
  const [isCardComplete, setIsCardComplete] = useState(false);
  const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
  const hasStripeKey = stripePublishableKey.trim().length > 0;
  const isValid = hasStripeKey && isCardComplete;

  const handleSave = useCallback(async () => {
    Keyboard.dismiss();

    if (!stripePublishableKey) {
      showToast.error(t('wallet_add_card_error'), t('wallet_stripe_publishable_key_missing'));
      return;
    }

    if (!isCardComplete) {
      showToast.error(t('wallet_add_card_error'), t('wallet_card_incomplete'));
      return;
    }

    try {
      const setupIntent = await setupIntentMutation.mutateAsync();
      const { error } = await confirmSetupIntent(setupIntent.clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: holderName.trim() || undefined,
          },
        },
      });

      if (error) {
        showToast.error(t('wallet_add_card_error'), error.message);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: walletSavedCardsKeys.byApp('deliveries'),
      });
      showToast.success(t('wallet_card_saved_success_title'), t('wallet_card_saved_success_message'));
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('wallet_add_card_error');
      showToast.error(t('wallet_add_card_error'), message);
    }
  }, [
    confirmSetupIntent,
    holderName,
    isCardComplete,
    navigation,
    queryClient,
    setupIntentMutation,
    stripePublishableKey,
    t,
  ]);

  const saveDisabled = useMemo(
    () => !isValid || setupIntentMutation.isPending,
    [isValid, setupIntentMutation.isPending],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('wallet_add_card_title')} variant="close" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={[styles.secureIcon, { backgroundColor: colors.successSoft }]}> 
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.successText} />
          </View>
          <View style={styles.introCopy}>
            <Text color={colors.text} weight="semiBold" style={styles.introTitle}>{t('wallet_card_secure_title')}</Text>
            <Text color={colors.mutedText} style={styles.introBody}>{t('wallet_card_secure_description')}</Text>
          </View>
        </View>
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <View style={styles.fieldGroup}>
          <Text weight="medium" color={colors.text} style={styles.label}>
            {t('wallet_name_on_card')}
          </Text>
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceSunken }]}> 
            <TextInput
              value={holderName}
              onChangeText={setHolderName}
              placeholder={t('wallet_name_placeholder')}
              placeholderTextColor={colors.mutedText}
              style={[styles.input, { color: colors.text }]}
              accessibilityLabel={t('wallet_name_on_card')}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text weight="medium" color={colors.text} style={styles.label}>
            {t('wallet_card_number_label')}
          </Text>
          {hasStripeKey ? (
            <View style={[styles.cardFieldWrap, { borderColor: colors.border, backgroundColor: colors.surfaceSunken }]}> 
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                  backgroundColor: colors.surfaceSunken,
                  borderColor: colors.surfaceSunken,
                  borderWidth: 0,
                  textColor: colors.text,
                  placeholderColor: colors.mutedText,
                }}
                style={styles.cardField}
                onCardChange={(details) => {
                  setIsCardComplete(Boolean(details.complete));
                }}
              />
            </View>
          ) : (
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceSunken }]}> 
              <Text color={colors.mutedText}>{t('wallet_stripe_publishable_key_missing')}</Text>
            </View>
          )}
        </View>
        </View>

        <View style={styles.stripeRow}>
          <Ionicons name="lock-closed-outline" size={15} color={colors.mutedText} />
          <Text color={colors.mutedText} style={[styles.secureText, { fontSize: typography.size.sm2 }]}>{t('wallet_pay_securely')} Stripe</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.divider }]}> 
        <Button
          label={t('wallet_save_card')}
          onPress={() => {
            void handleSave();
          }}
          disabled={saveDisabled}
          isLoading={setupIntentMutation.isPending}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 18, paddingBottom: 140 },
  formCard: { borderRadius: 16, borderWidth: 1, gap: 20, padding: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, lineHeight: 22 },
  inputRow: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  input: { flex: 1, fontSize: 16, lineHeight: 24 },
  cardFieldWrap: {
    borderWidth: 1,
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
  cardField: {
    width: '100%',
    height: 48,
  },
  secureText: {
    lineHeight: 22,
  },
  intro: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  introBody: { fontSize: 13, lineHeight: 19 },
  introCopy: { flex: 1, gap: 2 },
  introTitle: { fontSize: 16, lineHeight: 22 },
  secureIcon: { alignItems: 'center', borderRadius: 18, height: 56, justifyContent: 'center', width: 56 },
  stripeRow: { alignItems: 'center', flexDirection: 'row', gap: 7, justifyContent: 'center' },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
  },
  saveButton: { borderRadius: 12 },
});
