import { create } from "zustand";
import type { PhoneInputProps } from 'react-native-phone-number-input';
import type { SignupConflictField } from '../utils/signupValidation';

type SignupCountryCode = NonNullable<PhoneInputProps['defaultCode']>;

export type SignupFormData = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type OtpType = "sms" | "email" | "call";

export type FlowType = "signup" | "login";

type SignupState = {
  // Form data
  formData: SignupFormData;
  signupConflictFields: SignupConflictField[];
  signupCountryCode: SignupCountryCode | null;
  signupPhoneInput: string;

  // OTP state
  otpType: OtpType;
  otpSent: boolean;

  // flow state
  flowType: FlowType;

  // Actions
  setFormData: (data: Partial<SignupFormData>) => void;
  setSignupConflictFields: (fields: SignupConflictField[]) => void;
  setSignupCountryCode: (code: SignupCountryCode) => void;
  setSignupPhoneInput: (value: string) => void;
  setOtpType: (type: OtpType) => void;
  setFlowType: (type: FlowType) => void;
  setOtpSent: (sent: boolean) => void;
  resetSignup: () => void;
};

const initialFormData: SignupFormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

export const useAuthStore = create<SignupState>((set) => ({
  formData: initialFormData,
  signupConflictFields: [],
  signupCountryCode: null,
  signupPhoneInput: '',
  otpType: "sms",
  otpSent: false,
  flowType: "login",

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      signupConflictFields: state.signupConflictFields.filter(
        (field) => data[field] === undefined || data[field] === state.formData[field],
      ),
    })),

  setSignupConflictFields: (fields) => set({ signupConflictFields: fields }),
  setSignupCountryCode: (code) => set({ signupCountryCode: code }),
  setSignupPhoneInput: (value) => set({ signupPhoneInput: value }),

  setOtpType: (type) => set({ otpType: type }),

  setFlowType: (type) => set({ flowType: type }),

  setOtpSent: (sent) => set({ otpSent: sent }),

  resetSignup: () =>
    set({
      formData: initialFormData,
      signupConflictFields: [],
      signupCountryCode: null,
      signupPhoneInput: '',
      otpType: "sms",
      otpSent: false,
    }),
}));
