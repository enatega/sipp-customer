import React, { useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import useStyles from "./styles";
import { useTheme } from "../../../theme/theme";
import SvgAndTextWrapper from "../../../components/auth/general/SvgAndTextWrapper";
import Footer from "../../../components/Footer";
import ScreenHeader from "../../../components/ScreenHeader";
import Button from "../../../components/Button";
import Text from "../../../components/Text";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import FieldsWrapper from "../../../components/auth/signup/FieldsWrapper";
import { useAuthStore } from "../../../stores/useAuthStore";
import { isValidEmail } from "../../../utils/validation";
import { isValidSignupPassword, resolveSignupConflictFields } from '../../../utils/signupValidation';
import { useSignupSendOtp } from '../../../hooks/useAuthMutations';
import { useTooManyRequestsModal } from '../../../hooks/useTooManyRequestsModal';
import AppPopup from '../../../components/AppPopup';
import { showToast } from '../../../components/AppToast';
import { useShallow } from "zustand/react/shallow";
import { phoneVerificationErrorMessage } from '../../../utils/phoneVerificationError';

const Signup = () => {
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const [isAndroidKeyboardVisible, setIsAndroidKeyboardVisible] = useState(
    Platform.OS === 'android' && Keyboard.isVisible(),
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsAndroidKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsAndroidKeyboardVisible(false);
      requestAnimationFrame(() => {
        if (!Keyboard.isVisible()) {
          scrollRef.current?.scrollTo({ y: 0, animated: false });
        }
      });
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const { formData, setOtpType, setOtpSent, setSignupConflictFields } = useAuthStore(useShallow((state) => ({ formData: state.formData, setOtpType: state.setOtpType, setOtpSent: state.setOtpSent, setSignupConflictFields: state.setSignupConflictFields })));
  const rateLimitModal = useTooManyRequestsModal();
  const sendOtpMutation = useSignupSendOtp({
    onSuccess: () => {
      setOtpType('sms');
      setOtpSent(true);
      navigation.navigate('enterPhoneOtpSignup' as never);
    },
    onError: async (error) => {
      const fields = await resolveSignupConflictFields(error, formData.email.trim(), formData.phone.trim());
      if (fields.length) {
        setSignupConflictFields(fields);
      } else if (error.status === 429) {
        rateLimitModal.show();
      } else {
        showToast.error(t('signup_request_error_title'), phoneVerificationErrorMessage(error, t, error.message));
      }
    },
  });

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    isValidEmail(formData.email) &&
    isValidSignupPassword(formData.password) &&
    /^\+[1-9]\d{7,14}$/.test(formData.phone);

  const handleContinue = () => {
    if (!isFormValid || sendOtpMutation.isPending) return;
    setSignupConflictFields([]);
    sendOtpMutation.mutate({
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      otp_type: 'sms',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : isAndroidKeyboardVisible ? "height" : undefined}
      style={styles.container}
    >
      <ScreenHeader />
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.centerContent}
      >
        <SvgAndTextWrapper
          svgName="login"
          heading="signup_heading"
          description="signup_description"
        />
        <Text color={colors.mutedText} style={{ marginHorizontal: 24, marginBottom: 12 }}>{t('phone_transfer_warning')}</Text>
        <FieldsWrapper disabled={sendOtpMutation.isPending} />
      </ScrollView>
      <Footer>
        <Button
          variant={isFormValid ? "primary" : "secondary"}
          label={t("create_account")}
          onPress={handleContinue}
          disabled={!isFormValid || sendOtpMutation.isPending}
          isLoading={sendOtpMutation.isPending}
        />
      </Footer>
      <AppPopup
        visible={rateLimitModal.visible}
        title={t('too_many_attempts')}
        description={t('too_many_attempts_desc')}
        onRequestClose={rateLimitModal.hide}
        dismissOnOverlayPress
        primaryAction={{ label: t('ok'), onPress: rateLimitModal.hide, variant: 'danger' }}
      />
    </KeyboardAvoidingView>
  );
};

export default Signup;
