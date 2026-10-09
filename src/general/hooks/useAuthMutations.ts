import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { authService } from "../api/authService";
import { authKeys } from "../api/queryKeys";
import type { ApiError } from "../api/apiClient";
import type {
  AppleLoginPayload,
  AppleLoginResponse,
  EmailLoginPayload,
  EmailLoginRespoce,
  GoogleLoginPayload,
  GoogleLoginResponse,
  GoogleAuthenticatedResponse,
  LoginSendOtpPayload,
  LoginSendOtpResponse,
  LoginVerifyOtpPayload,
  LoginVerifyOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponce,
  SendForgotPasswordOtpPayload,
  SendForgotPasswordOtpResponce,
  SignupSendOtpPayload,
  SignupSendOtpResponse,
  SignupVerifyOtpPayload,
  SignupVerifyOtpResponse,
  VerifyForgotPasswordOtpPayload,
  VerifyForgotPasswordOtpResponce,
} from "../api/authTypes";
import { authSession } from "../auth/authSession";
import { redirectToPendingAppIfNeeded } from "../navigation/rootNavigation";
import { clearActiveAppRoute } from "../navigation/pendingAppRedirect";
import { socketClient } from "../services/socket";
import { useAuthStore } from "../stores/useAuthStore";
import { queryClient } from "../providers/QueryProvider";

async function finalizeAuthSession(
  queryClient: ReturnType<typeof useQueryClient>,
  data:
    | SignupVerifyOtpResponse
    | LoginVerifyOtpResponse
    | EmailLoginRespoce
    | GoogleAuthenticatedResponse
    | AppleLoginResponse,
) {
  await authSession.setSession(data);
  queryClient.setQueryData(authKeys.session(), {
    token: data.accessToken,
    user: data.user,
    profiles: data.profiles,
  });
  await queryClient.invalidateQueries({ queryKey: authKeys.session() });
}

export async function clearStoredAuthSession() {
  await socketClient.updateAuthToken(null);
  socketClient.disconnect();
  await authSession.clearSession();
  useAuthStore.getState().resetSignup();
  await clearActiveAppRoute();
}

// Full local sign-out: stored session plus every cached query, so the next
// person to sign in on this device never sees the previous user's orders,
// wallet, cards or addresses while refetches are in flight.
export async function signOutLocally() {
  await clearStoredAuthSession();
  // Queries only: clearing the mutation cache would drop the in-flight logout
  // mutation and skip its callbacks.
  queryClient.getQueryCache().clear();
  queryClient.setQueryData(authKeys.session(), {
    token: null,
    user: null,
    profiles: null,
  });
}

export function useSignupSendOtp(
  options?: UseMutationOptions<
    SignupSendOtpResponse,
    ApiError,
    SignupSendOtpPayload
  >,
) {
  return useMutation<SignupSendOtpResponse, ApiError, SignupSendOtpPayload>({
    mutationFn: authService.sendSignupOtp,
    ...options,
    retry: false,
  });
}

export function useSignupVerifyOtp(
  options?: UseMutationOptions<
    SignupVerifyOtpResponse,
    ApiError,
    SignupVerifyOtpPayload
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<SignupVerifyOtpResponse, ApiError, SignupVerifyOtpPayload>(
    {
      mutationFn: authService.verifySignupOtp,
      ...options,
      retry: false,
      onSuccess: async (data, variables, onMutateResult, context) => {
        useAuthStore.getState().resetSignup();
        await finalizeAuthSession(queryClient, data);
        options?.onSuccess?.(data, variables, onMutateResult, context);
        await redirectToPendingAppIfNeeded();
      },
    },
  );
}

export function useLoginSendOtp(
  options?: UseMutationOptions<
    LoginSendOtpResponse,
    ApiError,
    LoginSendOtpPayload
  >,
) {
  return useMutation<LoginSendOtpResponse, ApiError, LoginSendOtpPayload>({
    mutationFn: authService.sendLoginOtp,
    ...options,
    retry: false,
  });
}

export function useLoginVerifyOtp(
  options?: UseMutationOptions<
    LoginVerifyOtpResponse,
    ApiError,
    LoginVerifyOtpPayload
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<LoginVerifyOtpResponse, ApiError, LoginVerifyOtpPayload>({
    mutationFn: authService.verifyLoginOtp,
    ...options,
    retry: false,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await finalizeAuthSession(queryClient, data);
      options?.onSuccess?.(data, variables, onMutateResult, context);
      await redirectToPendingAppIfNeeded();
    },
  });
}

export function useGooglePhoneVerify() {
  const queryClient = useQueryClient();
  return useMutation<GoogleAuthenticatedResponse, ApiError, { idToken: string; phone: string; otp: string; device_push_token?: string }>({
    mutationFn: authService.verifyGooglePhoneOtp,
    retry: false,
    onSuccess: async (data) => {
      await finalizeAuthSession(queryClient, data);
      await redirectToPendingAppIfNeeded();
    },
  });
}

export function useLogout(options?: UseMutationOptions<void, ApiError, void>) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, void>({
    mutationFn: signOutLocally,
    ...options,
    onSuccess: async (_data, variables, onMutateResult, context) => {
      queryClient.setQueryData(authKeys.session(), {
        token: null,
        user: null,
        profiles: null,
      });
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      options?.onSuccess?.(_data, variables, onMutateResult, context);
    },
  });
}

export function useEmailLogin(
  options?: UseMutationOptions<EmailLoginRespoce, ApiError, EmailLoginPayload>,
) {
  const queryClient = useQueryClient();

  return useMutation<EmailLoginRespoce, ApiError, EmailLoginPayload>({
    mutationFn: authService.emailLogin,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await finalizeAuthSession(queryClient, data);
      options?.onSuccess?.(data, variables, onMutateResult, context);
      await redirectToPendingAppIfNeeded();
    },
  });
}

export function useGoogleLogin(
  options?: UseMutationOptions<
    GoogleLoginResponse,
    ApiError,
    GoogleLoginPayload
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<GoogleLoginResponse, ApiError, GoogleLoginPayload>({
    mutationFn: authService.googleLogin,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      if ('phoneVerificationRequired' in data) {
        options?.onSuccess?.(data, variables, onMutateResult, context);
        return;
      }
      await finalizeAuthSession(queryClient, data);
      options?.onSuccess?.(data, variables, onMutateResult, context);
      await redirectToPendingAppIfNeeded();
    },
  });
}

export function useAppleLogin(
  options?: UseMutationOptions<
    AppleLoginResponse,
    ApiError,
    AppleLoginPayload
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<AppleLoginResponse, ApiError, AppleLoginPayload>({
    mutationFn: authService.appleLogin,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await finalizeAuthSession(queryClient, data);
      options?.onSuccess?.(data, variables, onMutateResult, context);
      await redirectToPendingAppIfNeeded();
    },
  });
}

export function useForgotPasswordSendOtp(
  options?: UseMutationOptions<
    SendForgotPasswordOtpResponce,
    ApiError,
    SendForgotPasswordOtpPayload
  >,
) {
  return useMutation<
    SendForgotPasswordOtpResponce,
    ApiError,
    SendForgotPasswordOtpPayload
  >({
    mutationFn: authService.sendForgotPasswordOtp,
    ...options,
    retry: false,
  });
}

export function useForgotPasswordVerifyOtp(
  options?: UseMutationOptions<
    VerifyForgotPasswordOtpResponce,
    ApiError,
    VerifyForgotPasswordOtpPayload
  >,
) {
  return useMutation<
    VerifyForgotPasswordOtpResponce,
    ApiError,
    VerifyForgotPasswordOtpPayload
  >({
    mutationFn: authService.verifyForgotPasswordOtp,
    ...options,
    retry: false,
  });
}

export function useResetPassword(
  options?: UseMutationOptions<
    ResetPasswordResponce,
    ApiError,
    ResetPasswordPayload
  >,
) {
  return useMutation<ResetPasswordResponce, ApiError, ResetPasswordPayload>({
    mutationFn: authService.resetPassword,
    ...options,
  });
}
