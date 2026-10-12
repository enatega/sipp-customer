import type { ApiError } from '../api/apiClient';

type PhoneErrorKey = 'phone_protected' | 'too_many_attempts_desc' | 'phone_send_error' | 'phone_code_expired' | 'phone_code_invalid';

export function phoneVerificationErrorMessage(error: unknown, translate: (key: PhoneErrorKey) => string, fallback: string) {
  const apiError = error as ApiError | undefined;
  if (apiError?.code === 'PHONE_PROTECTED') return translate('phone_protected');
  if (apiError?.status === 429) return translate('too_many_attempts_desc');
  if (apiError?.status === 503) return translate('phone_send_error');
  const message = error instanceof Error ? error.message : '';
  if (/expired|already been used/i.test(message)) return translate('phone_code_expired');
  if (/invalid verification code/i.test(message)) return translate('phone_code_invalid');
  return message || fallback;
}
