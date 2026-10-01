import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import OtpVerificationComponent from "../../../components/auth/OtpVerificationComponent";
import { useAuthStore, type OtpType } from "../../../stores/useAuthStore";
import { resolveSignupConflictFields } from '../../../utils/signupValidation';
import {
  useSignupVerifyOtp,
  useSignupSendOtp,
} from "../../../hooks/useAuthMutations";
import { useTooManyRequestsModal } from "../../../hooks/useTooManyRequestsModal";
import AppPopup from "../../../components/AppPopup";
import { showToast } from "../../../components/AppToast";
import KeyboardDismissWrapper from "../../../components/KeyboardDismissWrapper";

const EnterEmailOtpSignup = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { formData, setOtpType, otpType, setOtpSent, setSignupConflictFields } = useAuthStore();
  const rateLimitModal = useTooManyRequestsModal();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasError, sethasError] = useState<boolean>(false);

  const sendOtpMutation = useSignupSendOtp({
    onSuccess: (data) => {
      setOtpSent(true);
      setErrorMessage('');
      showToast.success("Success!", data?.message);
    },
    onError: async (error) => {
      if (error.status === 429) {
        rateLimitModal.show();
      } else if (error.status === 409) {
        const fields = await resolveSignupConflictFields(error, formData.email.trim(), formData.phone.trim());
        if (fields.length) {
          setSignupConflictFields(fields);
          navigation.navigate("signup" as never);
        } else {
          setErrorMessage(error.message);
          showToast.error("Error!", error.message);
        }
      } else {
        showToast.error("Error!", error?.message);
      }
    },
  });

  const requestOtp = (nextType: OtpType, onSent?: () => void) => {
    if (sendOtpMutation.isPending) return;
    sendOtpMutation.mutate({
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      otp_type: nextType,
    }, {
      onSuccess: () => {
        setOtpType(nextType);
        onSent?.();
      },
    });
  };

  const verifyOtpMutation = useSignupVerifyOtp({
    onSuccess: () => {
      showToast.success("Success!", "Account created successfully.");
      setOtpType("sms");
    },
    onError: async (error) => {
      if (error.status === 429) {
        rateLimitModal.show();
      } else if (error.status === 409) {
        const fields = await resolveSignupConflictFields(error, formData.email.trim(), formData.phone.trim());
        if (fields.length) {
          setSignupConflictFields(fields);
          navigation.navigate("signup" as never);
        } else {
          setErrorMessage(error.message);
          showToast.error("Error!", error.message);
        }
      } else {
        showToast.error("Error!", error?.message);
        setErrorMessage(error?.message);
      }
    },
  });

  const verificationOptions = [
    {
      id: "sms",
      icon: "message-square",
      title: t("sms_verification"),
      onSelect: () => requestOtp('sms', () => navigation.navigate("enterPhoneOtpSignup" as never)),
    },
    {
      id: "call",
      icon: "phone",
      title: t("call_verification"),
      onSelect: () => requestOtp('call', () => navigation.navigate("enterPhoneOtpSignup" as never)),
    },
    {
      id: "email",
      icon: "mail",
      title: t("email_verification"),
      onSelect: () => { if (otpType !== 'email') requestOtp('email'); },
    },
  ];

  const handleVerifyOtp = (otp: string) => {
    verifyOtpMutation.mutate({
      phone: formData.phone,
      otp,
      email: formData.email,
      otp_type: otpType,
      name: formData.name,
      password: formData.password,
    });
  };

  const handleResendOtp = () => {
    requestOtp('email');
  };

  return (
    <KeyboardDismissWrapper>
      <OtpVerificationComponent
        heading="verify_your_email"
        description={t("enter_otp_sent_to", { contact: formData.email })}
        showTryAnotherWay={true}
        verificationOptions={verificationOptions}
        defaultSelectedMethod={otpType}
        deferSelectedMethod
        onVerify={(otp) => {
          handleVerifyOtp(otp);
        }}
        onResend={handleResendOtp}
        errorMessage={errorMessage}
        hasError={hasError}
        setHasError={sethasError}
        isLoading={verifyOtpMutation.isPending || sendOtpMutation.isPending}
      />
      <AppPopup
        visible={rateLimitModal.visible}
        title={t("too_many_attempts")}
        description={t("too_many_attempts_desc")}
        onRequestClose={rateLimitModal.hide}
        dismissOnOverlayPress={true}
        primaryAction={{
          label: t("ok"),
          onPress: rateLimitModal.hide,
          variant: "danger",
        }}
      />
    </KeyboardDismissWrapper>
  );
};

export default EnterEmailOtpSignup;
