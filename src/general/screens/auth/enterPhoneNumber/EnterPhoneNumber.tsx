import React, { useState } from "react";
import { View } from "react-native";
import { useTheme } from "../../../theme/theme";
import ScreenHeader from "../../../components/ScreenHeader";
import { useNavigation } from "@react-navigation/native";
import SvgAndTextWrapper from "../../../components/auth/general/SvgAndTextWrapper";
import useStyles from "./styles";
import Footer from "../../../components/Footer";
import Button from "../../../components/Button";
import { useTranslation } from "react-i18next";
import PhoneNumberInput from "../../../components/auth/PhoneInput";
import KeyboardDismissWrapper from "../../../components/KeyboardDismissWrapper";

const EnterPhoneNumber = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const styles = useStyles(colors);
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalPhoneNumber, setNationalPhoneNumber] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(false);
  const hasPhoneInput = nationalPhoneNumber.length > 0;

  return (
    <KeyboardDismissWrapper style={styles.container}>
      <ScreenHeader onBack={() => navigation.goBack()} />

      {/* Center content container */}
      <View style={styles.centerContent}>
        <SvgAndTextWrapper
          svgName="login"
          heading="enter_your_phone"
          description="login_desc"
        />
        <PhoneNumberInput
          value={nationalPhoneNumber}
          onChangeText={setNationalPhoneNumber}
          onChangeFormattedText={(formatted) => {
            setPhoneNumber(formatted);
            setIsValidPhone(formatted.startsWith('+') && formatted.replace(/\D/g, '').length >= 7);
          }}
          isActive={hasPhoneInput}
        />
      </View>

      <Footer>
        <Button
          variant={isValidPhone ? "primary" : "secondary"}
          label={t("continue")}
          onPress={() =>
            navigation.navigate("enterPhoneOtpLogin", { phone: phoneNumber })
          }
          disabled={!isValidPhone}
        />
      </Footer>
    </KeyboardDismissWrapper>
  );
};

export default EnterPhoneNumber;
