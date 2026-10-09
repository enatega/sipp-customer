import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  login: undefined;
  enterPhoneNumber: undefined;
  enterPhoneOtpLogin: { phone: string };
  enterPhoneOtpSignup: undefined;
  enterEmailOtpSignup: undefined;
  signup: undefined;
  enterEmail: { emailId?: string } | undefined;
  enterPassword: {
    emailId?: string;
    prefilledPassword?: string;
    rememberedFromStore?: boolean;
  } | undefined;
  forgetPasswordEnterEmail: { emailId: string };
  forgetPasswordEnterOtp: { emailId: string };
  createNewPassword: { userId: string; emailId: string };
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export type AuthScreenProps<RouteName extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, RouteName>;
