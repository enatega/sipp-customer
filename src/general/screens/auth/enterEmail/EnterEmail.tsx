import React from "react";
import { useTheme } from "../../../theme/theme";
import { useNavigation } from "@react-navigation/native";
import type { AuthNavigationProp, AuthScreenProps } from "../../../navigation/authTypes";
import useStyles from "./styles";
import EmailInputComponent from "../../../components/auth/EmailInputComponent";
import { rememberedCredentials } from "../../../auth/rememberedCredentials";
import { authService } from "../../../api/authService";
import { useAuthStore } from "../../../stores/useAuthStore";
import { showToast } from "../../../components/AppToast";
import { useTranslation } from "react-i18next";

const EnterEmail = ({ route }: AuthScreenProps<"enterEmail">) => {
  const emailId = route?.params?.emailId ?? "";
  const { colors } = useTheme();
  const navigation = useNavigation<AuthNavigationProp>();
  const styles = useStyles(colors);
  const { t } = useTranslation();
  const setFormData = useAuthStore((state) => state.setFormData);
  return (
    <EmailInputComponent
      heading="enter_your_email"
      description="login_desc"
      emailId={emailId}
      onContinue={async (email) => {
        const normalizedEmail = email.trim().toLowerCase();
        let exists: boolean;
        try {
          const result = await authService.checkEmailExists(normalizedEmail);
          exists = result.exists;
        } catch {
          showToast.error(t('auth_email_lookup_failed'));
          return;
        }

        if (!exists) {
          setFormData({ email: normalizedEmail });
          navigation.navigate('signup' as never);
          return;
        }

        let rememberedPassword: string | null = null;
        try {
          rememberedPassword = await rememberedCredentials.getPassword(normalizedEmail);
        } catch {
          rememberedPassword = null;
        }

        navigation.navigate(
          "enterPassword",
          {
            emailId: normalizedEmail,
            prefilledPassword: rememberedPassword ?? "",
            rememberedFromStore: Boolean(rememberedPassword),
          } as never,
        );
      }}
      styles={styles}
    />
  );
};

export default EnterEmail;
