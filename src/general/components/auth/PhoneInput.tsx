import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PhoneInput, { type PhoneInputProps } from "react-native-phone-number-input";
import { useTheme } from "../../theme/theme";
import { normalizeInternationalPhone } from '../../utils/phone';
import { getIpCountryCode } from '../../utils/ipCountry';

type CountryCode = NonNullable<PhoneInputProps['defaultCode']>;
type Country = Parameters<NonNullable<PhoneInputProps['onChangeCountry']>>[0];
const fallbackCountryCode: CountryCode = 'CR';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onChangeFormattedText?: (text: string) => void;
  onChangeCountry?: (country: Country) => void;
  countryCode?: CountryCode;
  resetOnCountryChange?: boolean;
  isActive?: boolean;
  hasError?: boolean;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function PhoneNumberInput({
  value,
  onChangeText,
  onChangeFormattedText,
  onChangeCountry,
  countryCode,
  resetOnCountryChange = false,
  isActive = false,
  hasError = false,
  disabled = false,
  onFocus,
  onBlur,
}: Props) {
  const { colors } = useTheme();
  const phoneInput = useRef<PhoneInput>(null);
  const manuallySelectedCountry = useRef(false);
  const [ipCountryCode, setIpCountryCode] = useState<CountryCode | null>(null);
  const [isCountryLookupComplete, setIsCountryLookupComplete] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (countryCode) return;
    let mounted = true;
    void getIpCountryCode()
      .then((code) => {
        if (mounted && code && !manuallySelectedCountry.current) {
          setIpCountryCode(code);
        }
      })
      .finally(() => {
        if (mounted) setIsCountryLookupComplete(true);
      });
    return () => { mounted = false; };
  }, [countryCode]);

  const selectedCountryCode = countryCode ?? ipCountryCode ?? fallbackCountryCode;

  if (!countryCode && !isCountryLookupComplete) {
    return (
      <View style={[styles.phoneContainer, styles.countryLoading, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PhoneInput
        key={selectedCountryCode}
        ref={phoneInput}
        value={value}
        defaultCode={selectedCountryCode}
        disabled={disabled}
        layout="first"
        onChangeText={onChangeText}
        onChangeFormattedText={onChangeFormattedText
          ? (text) => onChangeFormattedText(normalizeInternationalPhone(text))
          : undefined}
        onChangeCountry={(country) => {
          manuallySelectedCountry.current = true;
          onChangeCountry?.(country);
          if (resetOnCountryChange) {
            onChangeText("");
            onChangeFormattedText?.("");
          }
        }}
        containerStyle={[
          styles.phoneContainer,
          {
            backgroundColor: colors.gray100,
            borderColor: hasError ? colors.danger : isActive ? colors.primary : colors.border,
          },
        ]}
        textContainerStyle={[
          styles.textContainer,
          { backgroundColor: colors.surface },
        ]}
        textInputStyle={[styles.textInput, { color: colors.text }]}
        codeTextStyle={[styles.codeText, { color: colors.text }]}
        flagButtonStyle={styles.flagButton}
        countryPickerButtonStyle={styles.countryPickerButton}
        placeholder="(000) 000-0000"
        textInputProps={{
          value,
          onFocus,
          onBlur,
        }}
        countryPickerProps={{
          renderFlagButton: false,
          withModal: true,
          withFilter: true,
          withAlphaFilter: true,
          modalProps: {
            animationType: "slide",
            statusBarTranslucent: true,
          },
          flatListProps: {
            contentContainerStyle: {
              paddingBottom: insets.bottom,
            },
          },
          closeButtonStyle: {
            marginTop: insets.top,
          },
          filterProps: {
            style: {
              marginTop: insets.top,
            },
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  phoneContainer: {
    width: "100%",
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
  },
  countryLoading: { alignItems: 'center', justifyContent: 'center' },
  textContainer: {
    paddingVertical: 0,
    borderTopEndRadius: 12,
    borderBottomEndRadius: 12,
    backgroundColor: "transparent",
  },
  textInput: {
    fontSize: 16,
    height: 56,
  },
  codeText: {
    fontSize: 16,
  },
  flagButton: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  countryPickerButton: {
    paddingLeft: 12,
    paddingRight: 4,
  },
});
