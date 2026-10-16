import React, { useEffect, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../../../../general/components/Button';
import ScreenHeader from '../../../../general/components/ScreenHeader';
import Text from '../../../../general/components/Text';
import PhoneNumberInput from '../../../../general/components/auth/PhoneInput';
import OtpCodeInput from '../../../../general/components/auth/OtpInput';
import { showToast } from '../../../../general/components/AppToast';
import { profileService } from '../../../../general/api/profileService';
import { useTheme } from '../../../../general/theme/theme';
import { ApiError } from '../../../../general/api/apiClient';
import { phoneVerificationErrorMessage } from '../../../../general/utils/phoneVerificationError';

export default function CheckoutPhoneVerification({ onBack, onVerified }: { onBack: () => void; onVerified: () => Promise<unknown> }) {
  const { t } = useTranslation('deliveries');
  const { t: tg } = useTranslation('general');
  const { colors } = useTheme();
  const [phoneText, setPhoneText] = useState('');
  const [phone, setPhone] = useState('');
  const [sentPhone, setSentPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const attempted = useRef('');
  const requestInFlight = useRef(false);
  const [resendAt, setResendAt] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [otpVersion, setOtpVersion] = useState(0);
  useEffect(() => {
    const update = () => setResendIn(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') update(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [resendAt]);

  const sendCode = async () => {
    const recipient = sentPhone || phone;
    if (!/^\+[1-9]\d{7,14}$/.test(recipient) || requestInFlight.current || Date.now() < resendAt) return;
    requestInFlight.current = true;
    setBusy(true);
    try {
      await profileService.sendPhoneVerificationOtp(recipient);
      setSentPhone(recipient);
      setResendAt(Date.now() + 30_000);
      setResendIn(30);
      setOtpVersion(value => value + 1);
      setCode('');
      attempted.current = '';
      setHasError(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setResendAt(Date.now() + 30_000);
        setResendIn(30);
      }
      showToast.error(t('checkout_phone_verify_title'), phoneVerificationErrorMessage(error, tg, t('checkout_phone_send_error')));
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  };

  const verifyCode = async (nextCode: string) => {
    if (!sentPhone || !/^\d{4}$/.test(nextCode) || requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    setHasError(false);
    try {
      await profileService.verifyPhoneVerificationOtp(sentPhone, nextCode);
      await onVerified();
    } catch (error) {
      setHasError(true);
      showToast.error(t('checkout_phone_verify_title'), phoneVerificationErrorMessage(error, tg, t('checkout_phone_code_error')));
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  };

  return <View style={{ flex: 1, backgroundColor: colors.surface }}>
    <ScreenHeader onBack={onBack} />
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="none" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 20 }}>
        <Text variant="title" weight="bold">{t('checkout_phone_verify_title')}</Text>
        <Text variant="supporting" color={colors.mutedText}>{sentPhone ? t('checkout_phone_code_sent', { phone: sentPhone }) : t('checkout_phone_verify_description')}</Text>
        {sentPhone ? <>
          <OtpCodeInput key={otpVersion} hideResend disabled={busy} onCodeChange={(value) => {
            setCode(value);
            if (value.length < 4) attempted.current = '';
          }} onCodeFilled={(value) => {
            setCode(value);
            setHasError(false);
            if (value.length === 4 && attempted.current !== value) {
              attempted.current = value;
              void verifyCode(value);
            }
          }} onResend={() => void sendCode()} hasError={hasError} errorMessage={t('checkout_phone_code_error')} />
          <Button variant="secondary" label={resendIn > 0 ? `${tg('resend_in')} 0:${String(resendIn).padStart(2, '0')}` : tg('resend')} onPress={() => void sendCode()} disabled={busy || resendIn > 0} />
          <Button variant="primary" label={t('checkout_phone_confirm')} onPress={() => void verifyCode(code)} disabled={code.length !== 4 || busy} isLoading={busy} />
          <Button variant="secondary" label={t('checkout_phone_change')} onPress={() => { setSentPhone(''); setCode(''); setHasError(false); attempted.current = ''; }} disabled={busy} />
        </> : <>
          <PhoneNumberInput value={phoneText} onChangeText={setPhoneText} onChangeFormattedText={setPhone} disabled={busy} />
          <Button variant="primary" label={resendIn > 0 ? `${tg('resend_in')} 0:${String(resendIn).padStart(2, '0')}` : t('checkout_phone_send')} onPress={() => void sendCode()} disabled={!/^\+[1-9]\d{7,14}$/.test(phone) || busy || resendIn > 0} isLoading={busy} />
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}
