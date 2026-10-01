import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import TextInputField from "../TextInputField";
import PhoneNumberInput from "../PhoneInput";
import Text from '../../Text';
import { useAuthStore } from "../../../stores/useAuthStore";
import { useTheme } from '../../../theme/theme';
import { isValidSignupPassword } from '../../../utils/signupValidation';

export default function FieldsWrapper({ disabled = false }: { disabled?: boolean }) {
  const { formData, setFormData, signupConflictFields, signupCountryCode, setSignupCountryCode, signupPhoneInput, setSignupPhoneInput } = useAuthStore();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const hasPasswordError = formData.password.length > 0 && !isValidSignupPassword(formData.password);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ [field]: value });
  };

  return (
    <View style={styles.container}>
      <TextInputField
        value={formData.name}
        editable={!disabled}
        onChangeText={(value) => updateField("name", value)}
        placeholder="name"
        iconName="user"
        isFocused={focusedField === "name"}
        onFocus={() => setFocusedField("name")}
        onBlur={() => setFocusedField(null)}
      />
      <View style={styles.field}>
        <TextInputField
          value={formData.email}
          editable={!disabled}
          onChangeText={(value) => updateField("email", value)}
          placeholder="email"
          iconName="mail"
          keyboardType="email-address"
          autoCapitalize="none"
          isFocused={focusedField === "email"}
          hasError={signupConflictFields.includes('email')}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
        />
        {signupConflictFields.includes('email') ? <Text variant="caption" color={colors.danger}>
          {t('signup_email_exists')}
        </Text> : null}
      </View>
      <View style={styles.field}>
        <TextInputField
          value={formData.password}
          editable={!disabled}
          onChangeText={(value) => updateField("password", value)}
          placeholder="password"
          iconName="lock"
          isPassword
          autoCapitalize="none"
          isFocused={focusedField === "password"}
          hasError={hasPasswordError}
          onFocus={() => setFocusedField("password")}
          onBlur={() => setFocusedField(null)}
        />
        <Text variant="caption" color={hasPasswordError ? colors.danger : colors.textSubtle}>
          {t('signup_password_requirements')}
        </Text>
      </View>
      <View style={styles.field}>
        <PhoneNumberInput
          value={signupPhoneInput}
          disabled={disabled}
          countryCode={signupCountryCode ?? undefined}
          onChangeText={setSignupPhoneInput}
          onChangeFormattedText={(formattedValue) => updateField("phone", formattedValue)}
          onChangeCountry={(country) => setSignupCountryCode(country.cca2)}
          isActive={focusedField === "phone"}
          hasError={signupConflictFields.includes('phone')}
          onFocus={() => setFocusedField("phone")}
          onBlur={() => setFocusedField(null)}
        />
        {signupConflictFields.includes('phone') ? <Text variant="caption" color={colors.danger}>
          {t('signup_phone_exists')}
        </Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 16,
  },
  field: { gap: 4 },
});
