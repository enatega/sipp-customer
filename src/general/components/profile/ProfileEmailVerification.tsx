import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import Text from '../Text';
import OtpCodeInput from '../auth/OtpInput';
import { showToast } from '../AppToast';
import { profileService } from '../../api/profileService';
import { useTheme } from '../../theme/theme';

type Props = {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => Promise<unknown>;
};

export default function ProfileEmailVerification({ visible, email, onClose, onVerified }: Props) {
  const { t } = useTranslation('general');
  const { colors } = useTheme();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const attempted = useRef('');
  const resendAllowedAt = useRef(0);

  const close = () => {
    if (busy) return;
    setSent(false);
    setCode('');
    setError(false);
    attempted.current = '';
    onClose();
  };

  const sendCode = async () => {
    if (busy || !email) return;
    const remaining = Math.ceil((resendAllowedAt.current - Date.now()) / 1000);
    if (remaining > 0) {
      showToast.error(t('profile_verify_email'), `${t('resend_in')} ${remaining}s`);
      return;
    }
    setBusy(true);
    try {
      await profileService.sendEmailVerificationOtp();
      resendAllowedAt.current = Date.now() + 60_000;
      setSent(true);
      setCode('');
      setError(false);
      attempted.current = '';
    } catch (requestError) {
      showToast.error(t('profile_verify_email'), requestError instanceof Error ? requestError.message : t('something_went_wrong'));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value: string) => {
    if (busy || !/^\d{4}$/.test(value)) return;
    setBusy(true);
    try {
      await profileService.verifyEmailVerificationOtp(value);
      await onVerified();
      showToast.success(t('profile_verify_email'), t('profile_email_verified'));
      setSent(false);
      setCode('');
      setError(false);
      attempted.current = '';
      onClose();
    } catch (requestError) {
      setError(true);
      attempted.current = '';
      showToast.error(t('profile_verify_email'), requestError instanceof Error ? requestError.message : t('profile_email_code_error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close} presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.surface }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, gap: 18 }}>
          <Text variant="title" weight="bold">{t('profile_verify_email')}</Text>
          <Text color={colors.mutedText}>{t('profile_email_code_sent', { email })}</Text>
          {sent ? (
            <>
              <OtpCodeInput
                timerDuration={60}
                onCodeFilled={(value) => {
                  setCode(value);
                  setError(false);
                  if (value.length === 4 && attempted.current !== value) {
                    attempted.current = value;
                    void verify(value);
                  }
                }}
                onResend={() => { attempted.current = ''; void sendCode(); }}
                hasError={error}
                errorMessage={t('profile_email_code_error')}
              />
              <Button variant="primary" label={t('verify_otp')} onPress={() => void verify(code)} disabled={code.length !== 4 || busy} isLoading={busy} />
            </>
          ) : (
            <Button variant="primary" label={t('profile_email_send_code')} onPress={() => void sendCode()} disabled={busy} isLoading={busy} />
          )}
          <Button variant="secondary" label={t('photo_cancel')} onPress={close} disabled={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
