import React, { useRef, useState } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { KeyboardAvoidingView, Modal, Platform, ScrollView } from "react-native";
import { useGoogleLogin, useGooglePhoneVerify } from "../../hooks/useAuthMutations";
import { authService } from "../../api/authService";
import { showToast } from "../AppToast";
import Button from "../Button";
import Svg from "../Svg";
import { useTheme } from "../../theme/theme";
import { useTranslation } from "react-i18next";
import type { ApiError } from "../../api/apiClient";
import { getExpoPushTokenForAuth } from "../../services/notifications/expoPushTokenService";
import PhoneNumberInput from "./PhoneInput";
import OtpCodeInput from "./OtpInput";
import Text from "../Text";

const iosClientId = process.env.EXPO_PUBLIC_IOS_CLIENT_ID;
const webClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  ?? process.env.EXPO_PUBLIC_ANDROID_OAUTH_CLIENT_ID;

GoogleSignin.configure({
  iosClientId,
  webClientId,
});

const GoogleLogin = () => {
  const { colors } = useTheme();
  const { t } = useTranslation("general");
  const [idToken, setIdToken] = useState("");
  const [devicePushToken, setDevicePushToken] = useState<string | undefined>();
  const [phoneText, setPhoneText] = useState("");
  const [phone, setPhone] = useState("");
  const [sentPhone, setSentPhone] = useState("");
  const [code, setCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [hasCodeError, setHasCodeError] = useState(false);
  const submittedCode = useRef("");
  const verifyPhone = useGooglePhoneVerify();

  const resolveGoogleLoginErrorMessage = (error: ApiError | Error | unknown) => {
    const apiError = error as ApiError | undefined;
    const message =
      typeof apiError?.message === "string" && apiError.message.trim()
        ? apiError.message
        : t("something_went_wrong");

    if (apiError?.status === 400) {
      return message || "Invalid Google token or unsupported user type.";
    }

    if (apiError?.status === 401) {
      return message || "Your account is blocked or inactive.";
    }

    if (apiError?.status === 0) {
      return "Network error. Please check your connection and try again.";
    }

    return message;
  };

  const googleLoginMutation = useGoogleLogin();

  const closePhoneFlow = () => {
    if (isSendingCode || verifyPhone.isPending) return;
    setIdToken("");
    setSentPhone("");
    setPhoneText("");
    setPhone("");
    setCode("");
    submittedCode.current = "";
  };

  const sendCode = async () => {
    if (!idToken || !/^\+[1-9]\d{7,14}$/.test(phone) || isSendingCode) return;
    setIsSendingCode(true);
    setHasCodeError(false);
    try {
      await authService.sendGooglePhoneOtp({ idToken, phone });
      setSentPhone(phone);
      setCode("");
      submittedCode.current = "";
    } catch (error) {
      showToast.error(t("google_phone_title"), resolveGoogleLoginErrorMessage(error));
    } finally {
      setIsSendingCode(false);
    }
  };

  const confirmCode = async (nextCode: string) => {
    if (!idToken || !sentPhone || !/^\d{4}$/.test(nextCode) || verifyPhone.isPending) return;
    setHasCodeError(false);
    try {
      await verifyPhone.mutateAsync({ idToken, phone: sentPhone, otp: nextCode, device_push_token: devicePushToken });
      showToast.success(t("edit_profile_success"), t("google_phone_verified"));
      setIdToken("");
    } catch (error) {
      setHasCodeError(true);
      showToast.error(t("google_phone_title"), resolveGoogleLoginErrorMessage(error));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        showToast.error("Error!", "Unable to fetch Google token. Please try again.");
        return;
      }

      const devicePushToken = await getExpoPushTokenForAuth();

      const result = await googleLoginMutation.mutateAsync({
        idToken,
        user_type: "Customer",
        device_push_token: devicePushToken ?? undefined,
      });
      if ('phoneVerificationRequired' in result) {
        setIdToken(idToken);
        setDevicePushToken(devicePushToken ?? undefined);
      } else {
        showToast.success(t("edit_profile_success"), t("google_login_success"));
      }
    } catch (error: any) {
      if (error?.code === "SIGN_IN_CANCELLED") return;
      if (error?.code === "IN_PROGRESS") return;

      showToast.error(t("google_phone_error_title"), resolveGoogleLoginErrorMessage(error));
    }
  };

  return (
    <>
    <Button
      variant="secondary"
      icon={<Svg name="google" height={20} width={20} />}
      label={t("continue_with_google")}
      style={{ backgroundColor: colors.backgroundTertiary }}
      onPress={handleGoogleLogin}
      isLoading={googleLoginMutation.isPending}
      disabled={googleLoginMutation.isPending}
    />
    <Modal visible={Boolean(idToken)} animationType="slide" onRequestClose={closePhoneFlow} presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.surface }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, gap: 18 }}>
          <Text variant="title" weight="bold">{t("google_phone_title")}</Text>
          <Text style={{ color: colors.mutedText }}>{sentPhone ? t("google_phone_code_sent", { phone: sentPhone }) : t("google_phone_description")}</Text>
          {sentPhone ? <>
            <OtpCodeInput
              onCodeFilled={(value) => {
                setCode(value);
                setHasCodeError(false);
                if (value.length === 4 && submittedCode.current !== value) {
                  submittedCode.current = value;
                  void confirmCode(value);
                }
              }}
              onResend={() => { submittedCode.current = ""; void sendCode(); }}
              hasError={hasCodeError}
              errorMessage={t("google_phone_code_error")}
            />
            <Button variant="primary" label={t("verify_otp")} onPress={() => void confirmCode(code)} disabled={code.length !== 4 || verifyPhone.isPending} isLoading={verifyPhone.isPending} />
            <Button variant="secondary" label={t("google_phone_change")} onPress={() => { setSentPhone(""); setCode(""); }} disabled={verifyPhone.isPending} />
          </> : <>
            <PhoneNumberInput value={phoneText} onChangeText={setPhoneText} onChangeFormattedText={setPhone} disabled={isSendingCode} />
            <Button variant="primary" label={t("google_phone_send")} onPress={() => void sendCode()} disabled={!/^\+[1-9]\d{7,14}$/.test(phone) || isSendingCode} isLoading={isSendingCode} />
          </>}
          <Button variant="secondary" label={t("photo_cancel")} onPress={closePhoneFlow} disabled={isSendingCode || verifyPhone.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
    </>
  );
};

export default GoogleLogin;
