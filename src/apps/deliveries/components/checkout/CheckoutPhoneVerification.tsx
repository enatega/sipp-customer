import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import ScreenHeader from '../../../../general/components/ScreenHeader';
import Text from '../../../../general/components/Text';
import PhoneNumberInput from '../../../../general/components/auth/PhoneInput';
import OtpCodeInput from '../../../../general/components/auth/OtpInput';
import { showToast } from '../../../../general/components/AppToast';
import { profileService } from '../../../../general/api/profileService';
import { useTheme } from '../../../../general/theme/theme';

export default function CheckoutPhoneVerification({ onBack, onVerified }: { onBack: () => void; onVerified: () => Promise<unknown> }) {
  const { t } = useTranslation('deliveries');
  const { colors } = useTheme();
  const [phoneText, setPhoneText] = useState('');
  const [phone, setPhone] = useState('');
  const [sentPhone, setSentPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const attempted = useRef('');

  const sendCode = async () => {
    if (!/^\+[1-9]\d{7,14}$/.test(phone) || busy) return;
    setBusy(true);
    try {
      await profileService.sendPhoneVerificationOtp(phone);
      setSentPhone(phone);
      setCode('');
      attempted.current = '';
      setHasError(false);
    } catch (error) {
      showToast.error(t('checkout_phone_verify_title'), error instanceof Error ? error.message : t('checkout_phone_send_error'));
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (nextCode: string) => {
    if (!sentPhone || !/^\d{4}$/.test(nextCode) || busy) return;
    setBusy(true);
    setHasError(false);
    try {
      await profileService.verifyPhoneVerificationOtp(sentPhone, nextCode);
      await onVerified();
    } catch (error) {
      setHasError(true);
      showToast.error(t('checkout_phone_verify_title'), error instanceof Error ? error.message : t('checkout_phone_code_error'));
    } finally {
      setBusy(false);
    }
  };

  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    <ScreenHeader onBack={onBack} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 20 }}>
        <Text variant="title" weight="bold">{t('checkout_phone_verify_title')}</Text>
        <Text variant="supporting" color={colors.mutedText}>{sentPhone ? t('checkout_phone_code_sent', { phone: sentPhone }) : t('checkout_phone_verify_description')}</Text>
        {sentPhone ? <>
          <OtpCodeInput onCodeFilled={(value) => {
            setCode(value);
            setHasError(false);
            if (value.length === 4 && attempted.current !== value) {
              attempted.current = value;
              void verifyCode(value);
            }
          }} onResend={() => { attempted.current = ''; void sendCode(); }} hasError={hasError} errorMessage={t('checkout_phone_code_error')} />
          <Button variant="primary" label={t('checkout_phone_confirm')} onPress={() => void verifyCode(code)} disabled={code.length !== 4 || busy} isLoading={busy} />
          <Button variant="secondary" label={t('checkout_phone_change')} onPress={() => { setSentPhone(''); setCode(''); }} disabled={busy} />
        </> : <>
          <PhoneNumberInput value={phoneText} onChangeText={setPhoneText} onChangeFormattedText={setPhone} disabled={busy} />
          <Button variant="primary" label={t('checkout_phone_send')} onPress={() => void sendCode()} disabled={!/^\+[1-9]\d{7,14}$/.test(phone) || busy} isLoading={busy} />
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}
