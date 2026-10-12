import * as AppleAuthentication from "expo-apple-authentication";
import React, { useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useAppleLogin, useApplePhoneVerify } from "../../hooks/useAuthMutations";
import { showToast } from "../AppToast";
import { useTheme } from "../../theme/theme";
import { getExpoPushTokenForAuth } from "../../services/notifications/expoPushTokenService";
import type { ApiError } from "../../api/apiClient";
import type { AppleLoginPayload } from "../../api/authTypes";
import { authService } from "../../api/authService";
import Button from "./../Button";
import PhoneNumberInput from "./PhoneInput";
import OtpCodeInput from "./OtpInput";
import Text from "./../Text";
import { useTranslation } from "react-i18next";
import { phoneVerificationErrorMessage } from "../../utils/phoneVerificationError";

function formatAppleName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null,
) {
  if (!fullName) {
    return null;
  }

  const parts = [
    fullName.givenName,
    fullName.middleName,
    fullName.familyName,
  ].filter((value): value is string => Boolean(value?.trim()));

  if (parts.length === 0) {
    return null;
  }

  return parts.join(" ");
}

const AppleLogin = () => {
  const { colors } = useTheme();
  const { t } = useTranslation("general");
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [pending, setPending] = useState<AppleLoginPayload | null>(null);
  const [phoneText, setPhoneText] = useState("");
  const [phone, setPhone] = useState("");
  const [sentPhone, setSentPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const attempted = useRef("");
  const verifyPhone = useApplePhoneVerify();

  React.useEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    let isMounted = true;

    const loadAvailability = async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();

        if (isMounted) {
          setIsAvailable(available);
        }
      } catch {
        if (isMounted) {
          setIsAvailable(false);
        }
      }
    };

    void loadAvailability();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolveAppleLoginErrorMessage = (error: ApiError | Error | unknown) => {
    const apiError = error as ApiError | undefined;
    const message =
      typeof apiError?.message === "string" && apiError.message.trim()
        ? apiError.message
        : "Apple sign in failed. Please try again.";

    if (apiError?.status === 400) {
      return message;
    }

    if (apiError?.status === 401 || apiError?.status === 403) {
      return message || "Your account is blocked or inactive.";
    }

    if (apiError?.status === 0) {
      return "Network error. Please check your connection and try again.";
    }

    return message;
  };

  const appleLoginMutation = useAppleLogin();

  const closePhoneFlow = () => {
    if (busy || verifyPhone.isPending) return;
    setPending(null);
    setSentPhone("");
    setPhone("");
    setPhoneText("");
    setCode("");
  };

  const sendCode = async () => {
    if (!pending || !/^\+[1-9]\d{7,14}$/.test(phone) || busy) return;
    setBusy(true);
    try {
      await authService.sendApplePhoneOtp({ ...pending, phone });
      setSentPhone(phone);
      setCode("");
      attempted.current = "";
      setCodeError(false);
    } catch (error) {
      showToast.error(t("google_phone_title"), phoneVerificationErrorMessage(error, t, resolveAppleLoginErrorMessage(error)));
    } finally {
      setBusy(false);
    }
  };

  const confirmCode = async (nextCode: string) => {
    if (!pending || !sentPhone || !/^\d{4}$/.test(nextCode) || verifyPhone.isPending) return;
    try {
      await verifyPhone.mutateAsync({ ...pending, phone: sentPhone, otp: nextCode });
      showToast.success(t("google_phone_title"), t("phone_verified"));
      setPending(null);
    } catch (error) {
      setCodeError(true);
      attempted.current = "";
      if (error instanceof Error && /apple sign-in expired/i.test(error.message)) setPending(null);
      showToast.error(t("google_phone_title"), phoneVerificationErrorMessage(error, t, resolveAppleLoginErrorMessage(error)));
    }
  };

  const handleAppleLogin = async () => {
    if (appleLoginMutation.isPending) {
      return;
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        showToast.error(
          "Error!",
          "Unable to verify your Apple account. Please try again.",
        );
        return;
      }

      const devicePushToken = await getExpoPushTokenForAuth();

      const payload: AppleLoginPayload = {
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode ?? undefined,
        appleUser: credential.user,
        email: credential.email ?? undefined,
        name: formatAppleName(credential.fullName) ?? undefined,
        user_type: "Customer",
        device_push_token: devicePushToken ?? undefined,
      };
      const result = await appleLoginMutation.mutateAsync(payload);
      if ('phoneVerificationRequired' in result) setPending(payload);
      else showToast.success(t("google_phone_title"), t("google_login_success"));
    } catch (error: any) {
      if (error?.code === "ERR_REQUEST_CANCELED") {
        return;
      }

      showToast.error(
        "Error!",
        error?.message || "Apple sign in failed. Please try again.",
      );
    }
  };

  if (Platform.OS !== "ios" || !isAvailable) {
    return null;
  }

  return (
    <><View style={styles.wrapper}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        cornerRadius={10}
        onPress={handleAppleLogin}
        style={styles.button}
      />
      {appleLoginMutation.isPending ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.onPrimary} size="small" />
        </View>
      ) : null}
    </View>
    <Modal visible={Boolean(pending)} animationType="slide" onRequestClose={closePhoneFlow} presentationStyle="pageSheet">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.surface }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24, gap: 18 }}>
          <Text variant="title" weight="bold">{t("google_phone_title")}</Text>
          <Text style={{ color: colors.mutedText }}>{sentPhone ? t("google_phone_code_sent", { phone: sentPhone }) : t("google_phone_description")}</Text>
          {!sentPhone ? <Text style={{ color: colors.mutedText }}>{t("phone_transfer_warning")}</Text> : null}
          {sentPhone ? <>
            <OtpCodeInput onCodeFilled={(value) => { setCode(value); setCodeError(false); if (value.length === 4 && attempted.current !== value) { attempted.current = value; void confirmCode(value); } }} onResend={() => { attempted.current = ""; void sendCode(); }} hasError={codeError} errorMessage={t("google_phone_code_error")} />
            <Button variant="primary" label={t("verify_otp")} onPress={() => void confirmCode(code)} disabled={code.length !== 4 || verifyPhone.isPending} isLoading={verifyPhone.isPending} />
            <Button variant="secondary" label={t("google_phone_change")} onPress={() => { setSentPhone(""); setCode(""); }} disabled={verifyPhone.isPending} />
          </> : <>
            <PhoneNumberInput value={phoneText} onChangeText={setPhoneText} onChangeFormattedText={setPhone} disabled={busy} />
            <Button variant="primary" label={t("google_phone_send")} onPress={() => void sendCode()} disabled={!/^\+[1-9]\d{7,14}$/.test(phone) || busy} isLoading={busy} />
          </>}
          <Button variant="secondary" label={t("photo_cancel")} onPress={closePhoneFlow} disabled={busy || verifyPhone.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal></>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  button: {
    width: "100%",
    height: 48,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
});

export default AppleLogin;
