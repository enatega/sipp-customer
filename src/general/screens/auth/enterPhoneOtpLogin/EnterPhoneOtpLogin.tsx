import React, { useEffect, useRef, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import OtpVerificationComponent from "../../../components/auth/OtpVerificationComponent";
import {
  useLoginSendOtp,
  useLoginVerifyOtp,
} from "../../../hooks/useAuthMutations";
import { useTooManyRequestsModal } from "../../../hooks/useTooManyRequestsModal";
import AppPopup from "../../../components/AppPopup";
import { showToast } from "../../../components/AppToast";
import { useAuthStore } from "../../../stores/useAuthStore";
import KeyboardDismissWrapper from "../../../components/KeyboardDismissWrapper";
import { getExpoPushTokenForAuth } from "../../../services/notifications/expoPushTokenService";
import { useShallow } from "zustand/react/shallow";

const EnterPhoneOtpLogin = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phone } = route.params as { phone: string };
  const { t } = useTranslation();
  const { otpType, setOtpType } = useAuthStore(useShallow((state) => ({ otpType: state.otpType, setOtpType: state.setOtpType })));
  const rateLimitModal = useTooManyRequestsModal();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasError, sethasError] = useState<boolean>(false);
  const resendAllowedAt = useRef(0);

  const sendOtpMutation = useLoginSendOtp({
    onSuccess: (data) => {
      resendAllowedAt.current = Date.now() + 30_000;
      setErrorMessage('');
      showToast.success("Success!", data?.message);
    },
    onError: (error) => {
      if (error.status === 429) {
        rateLimitModal.show();
      } else {
        showToast.error("Error!", error?.message);
      }
    },
  });

  useEffect(() => {
    sendOtpMutation.mutate({
      phone: phone,
      otp_type: otpType,
    });
  }, []);

  const requestOtp = (method: 'sms' | 'call') => {
    if (sendOtpMutation.isPending) return;
    const remaining = Math.ceil((resendAllowedAt.current - Date.now()) / 1000);
    if (remaining > 0) {
      showToast.error(t('too_many_attempts'), `${t('resend_in')} ${remaining}s`);
      return;
    }
    sendOtpMutation.mutate({ phone, otp_type: method }, {
      onSuccess: () => setOtpType(method),
    });
  };

  const verifyOtpMutation = useLoginVerifyOtp({
    onSuccess: () => {
      showToast.success("Success!", "Login successful.");
      setOtpType("sms");
    },
    onError: (error) => {
      sethasError(true);
      if (error.status === 429) {
        rateLimitModal.show();
      } else {
        setErrorMessage(error?.message);
        showToast.error("Error!", error?.message);
      }
    },
  });

  const handleVerifyOtp = async (otp: string) => {
    const devicePushToken = await getExpoPushTokenForAuth();

    verifyOtpMutation.mutate({
      phone,
      otp,
      device_push_token: devicePushToken ?? undefined,
    });
  };

  const handleResendOtp = () => {
    requestOtp(otpType === 'call' ? 'call' : 'sms');
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
  ];

  return (
    <KeyboardDismissWrapper>
      <OtpVerificationComponent
        heading="verify_your_phone_number"
        description={t("enter_otp_sent_to", { contact: phone })}
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
export default EnterPhoneOtpLogin;
