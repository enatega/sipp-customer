import React from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import useStyles from "./styles";
import { useTheme } from "../../../theme/theme";
import SvgAndTextWrapper from "../../../components/auth/general/SvgAndTextWrapper";
import Footer from "../../../components/Footer";
import ScreenHeader from "../../../components/ScreenHeader";
import Button from "../../../components/Button";
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
import KeyboardDismissWrapper from "../../../components/KeyboardDismissWrapper";
import { useShallow } from "zustand/react/shallow";

const Signup = () => {
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const { t } = useTranslation();
  const navigation = useNavigation();

  const { formData, signupPhoneInput, setOtpType, setOtpSent, setSignupConflictFields } = useAuthStore(useShallow((state) => ({ formData: state.formData, signupPhoneInput: state.signupPhoneInput, setOtpType: state.setOtpType, setOtpSent: state.setOtpSent, setSignupConflictFields: state.setSignupConflictFields })));
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
        showToast.error(t('signup_request_error_title'), error.message);
      }
    },
  });

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    isValidEmail(formData.email) &&
    isValidSignupPassword(formData.password) &&
    formData.phone.startsWith('+') &&
    signupPhoneInput.replace(/\D/g, '').length >= 6;

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
    <KeyboardDismissWrapper style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container]}
      >
        <ScreenHeader />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.centerContent}
        >
          <SvgAndTextWrapper
            svgName="login"
            heading="signup_heading"
            description="signup_description"
          />
          <FieldsWrapper disabled={sendOtpMutation.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    </KeyboardDismissWrapper>
  );
};

export default Signup;
