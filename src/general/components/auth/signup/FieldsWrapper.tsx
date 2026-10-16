import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from 'react-i18next';
import TextInputField from "../TextInputField";
import PhoneNumberInput from "../PhoneInput";
import Text from '../../Text';
import { useAuthStore } from "../../../stores/useAuthStore";
import { useTheme } from '../../../theme/theme';
import { isValidSignupPassword } from '../../../utils/signupValidation';
import { isValidEmail } from '../../../utils/validation';
import { useShallow } from "zustand/react/shallow";

export default function FieldsWrapper({ disabled = false }: { disabled?: boolean }) {
  const { formData, setFormData, signupConflictFields, signupCountryCode, setSignupCountryCode, signupPhoneInput, setSignupPhoneInput } = useAuthStore(useShallow((state) => ({ formData: state.formData, setFormData: state.setFormData, signupConflictFields: state.signupConflictFields, signupCountryCode: state.signupCountryCode, setSignupCountryCode: state.setSignupCountryCode, signupPhoneInput: state.signupPhoneInput, setSignupPhoneInput: state.setSignupPhoneInput })));
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [touched, setTouched] = useState<string[]>([]);
  const touch = (field: string) => {
    setFocusedField(null);
    setTouched((current) => current.includes(field) ? current : [...current, field]);
  };
  const hasPasswordError = formData.password.length > 0 && !isValidSignupPassword(formData.password);
  const emailError = signupConflictFields.includes('email')
    ? t('signup_email_exists')
    : touched.includes('email') && !formData.email.trim()
      ? t('signup_field_required')
      : touched.includes('email') && !isValidEmail(formData.email)
        ? t('signup_invalid_email')
        : null;
  const phoneError = signupConflictFields.includes('phone')
    ? t('signup_phone_exists')
    : touched.includes('phone') && !formData.phone.trim()
      ? t('signup_field_required')
      : touched.includes('phone') && !/^\+[1-9]\d{7,14}$/.test(formData.phone)
        ? t('signup_invalid_phone')
        : null;

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ [field]: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
      <TextInputField
        value={formData.name}
        editable={!disabled}
        onChangeText={(value) => updateField("name", value)}
        placeholder="name"
        iconName="user"
        isFocused={focusedField === "name"}
        onFocus={() => setFocusedField("name")}
        onBlur={() => touch('name')}
      />
      <Text variant="caption" color={colors.danger} style={styles.feedback}>
        {touched.includes('name') && !formData.name.trim() ? t('signup_field_required') : ' '}
      </Text>
      </View>
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
          hasError={Boolean(emailError)}
          onFocus={() => setFocusedField("email")}
          onBlur={() => touch('email')}
        />
        <Text variant="caption" color={colors.danger} style={styles.feedback}>{emailError ?? ' '}</Text>
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
          onBlur={() => touch('password')}
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
          hasError={Boolean(phoneError)}
          onFocus={() => setFocusedField("phone")}
          onBlur={() => touch('phone')}
        />
        <Text variant="caption" color={colors.danger} style={styles.feedback}>{phoneError ?? ' '}</Text>
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
  feedback: { minHeight: 18 },
});
