import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import Text from '../Text';
import PhoneNumberInput from '../auth/PhoneInput';
import OtpCodeInput from '../auth/OtpInput';
import { showToast } from '../AppToast';
import { profileService } from '../../api/profileService';
import { useTheme } from '../../theme/theme';
import { phoneVerificationErrorMessage } from '../../utils/phoneVerificationError';

export default function ProfilePhoneVerification({ visible, onClose, onVerified }: { visible: boolean; onClose: () => void; onVerified: () => Promise<unknown> }) {
  const { t } = useTranslation('general');
  const { colors } = useTheme();
  const [phoneText, setPhoneText] = useState('');
  const [phone, setPhone] = useState('');
  const [sentPhone, setSentPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const attempted = useRef('');

  const close = () => {
    if (busy) return;
    setPhoneText(''); setPhone(''); setSentPhone(''); setCode(''); attempted.current = '';
    onClose();
  };
  const sendCode = async () => {
    if (!/^\+[1-9]\d{7,14}$/.test(phone) || busy) return;
    setBusy(true);
    try {
      await profileService.sendPhoneVerificationOtp(phone);
      setSentPhone(phone); setCode(''); attempted.current = ''; setCodeError(false);
    } catch (error) {
      showToast.error(t('phone_profile_title'), phoneVerificationErrorMessage(error, t, t('phone_send_error')));
    } finally { setBusy(false); }
  };
  const verify = async (value: string) => {
    if (!sentPhone || !/^\d{4}$/.test(value) || busy) return;
    setBusy(true);
    try {
      await profileService.verifyPhoneVerificationOtp(sentPhone, value);
      await onVerified();
      showToast.success(t('phone_profile_title'), t('phone_verified'));
      setPhoneText(''); setPhone(''); setSentPhone(''); setCode(''); attempted.current = '';
      onClose();
    } catch (error) {
      setCodeError(true); attempted.current = '';
      showToast.error(t('phone_profile_title'), phoneVerificationErrorMessage(error, t, t('google_phone_code_error')));
    } finally { setBusy(false); }
  };
  return <Modal visible={visible} animationType="slide" onRequestClose={close} presentationStyle="pageSheet">
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 18 }}>
        <Text variant="title" weight="bold">{t('phone_profile_title')}</Text>
        <Text color={colors.mutedText}>{sentPhone ? t('google_phone_code_sent', { phone: sentPhone }) : t('phone_profile_description')}</Text>
        {!sentPhone ? <Text color={colors.mutedText}>{t('phone_transfer_warning')}</Text> : null}
        {sentPhone ? <>
          <OtpCodeInput onCodeFilled={(value) => { setCode(value); setCodeError(false); if (value.length === 4 && attempted.current !== value) { attempted.current = value; void verify(value); } }} onResend={() => { attempted.current = ''; void sendCode(); }} hasError={codeError} errorMessage={t('google_phone_code_error')} />
          <Button variant="primary" label={t('verify_otp')} onPress={() => void verify(code)} disabled={code.length !== 4 || busy} isLoading={busy} />
          <Button variant="secondary" label={t('google_phone_change')} onPress={() => { setSentPhone(''); setCode(''); }} disabled={busy} />
        </> : <>
          <PhoneNumberInput value={phoneText} onChangeText={setPhoneText} onChangeFormattedText={setPhone} disabled={busy} />
          <Button variant="primary" label={t('google_phone_send')} onPress={() => void sendCode()} disabled={!/^\+[1-9]\d{7,14}$/.test(phone) || busy} isLoading={busy} />
        </>}
        <Button variant="secondary" label={t('photo_cancel')} onPress={close} disabled={busy} />
      </ScrollView>
    </KeyboardAvoidingView>
  </Modal>;
}
