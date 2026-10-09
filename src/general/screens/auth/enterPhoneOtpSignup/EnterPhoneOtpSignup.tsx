import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import OtpVerificationComponent from "../../../components/auth/OtpVerificationComponent";
import {
  useSignupVerifyOtp,
  useSignupSendOtp,
} from "../../../hooks/useAuthMutations";
import { useTooManyRequestsModal } from "../../../hooks/useTooManyRequestsModal";
import AppPopup from "../../../components/AppPopup";
import { showToast } from "../../../components/AppToast";
import { useAuthStore, type OtpType } from "../../../stores/useAuthStore";
import { resolveSignupConflictFields } from '../../../utils/signupValidation';
import KeyboardDismissWrapper from "../../../components/KeyboardDismissWrapper";
import { useShallow } from "zustand/react/shallow";

const EnterPhoneOtpSignup = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { formData, setOtpType, otpType, setOtpSent, setSignupConflictFields } = useAuthStore(useShallow((state) => ({ formData: state.formData, setOtpType: state.setOtpType, otpType: state.otpType, setOtpSent: state.setOtpSent, setSignupConflictFields: state.setSignupConflictFields })));
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
        setErrorMessage(error?.message);
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
      sethasError(true);
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
        setErrorMessage(error?.message);
        showToast.error("Error!", error?.message);
      }
    },
  });

  const handleVerifyOtp = (otp: string) => {
    verifyOtpMutation.mutate({
      phone: formData.phone,
      email: formData.email,
      otp,
      otp_type: otpType,
      name: formData.name,
      password: formData.password,
    });
  };

  const handleResendOtp = () => {
    requestOtp(otpType);
  };

  const verificationOptions = [
    {
      id: "sms",
      icon: "message-square",
      title: t("sms_verification"),
      onSelect: () => { if (otpType !== 'sms') requestOtp('sms'); },
    },
    {
      id: "call",
      icon: "phone",
      title: t("call_verification"),
      onSelect: () => { if (otpType !== 'call') requestOtp('call'); },
    },
    {
      id: "email",
      icon: "mail",
      title: t("email_verification"),
      onSelect: () => requestOtp('email', () => navigation.navigate("enterEmailOtpSignup" as never)),
    },
  ];

  return (
    <KeyboardDismissWrapper>
      <OtpVerificationComponent
        heading="verify_your_phone_number"
        description={t("enter_otp_sent_to", { contact: formData.phone })}
        showTryAnotherWay={true}
        verificationOptions={verificationOptions}
        defaultSelectedMethod={otpType}
        deferSelectedMethod
        onVerify={(otp) => {
          handleVerifyOtp(otp);
        }}
        onResend={handleResendOtp}
        errorMessage={errorMessage}
        isLoading={verifyOtpMutation.isPending || sendOtpMutation.isPending}
        hasError={hasError}
        setHasError={sethasError}
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

export default EnterPhoneOtpSignup;
