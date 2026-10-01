import type { ApiError } from '../api/apiClient';
import { authService } from '../api/authService';

export type SignupConflictField = 'email' | 'phone';

export const isValidSignupPassword = (password: string): boolean =>
  password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);

export function getSignupConflictFields(error: ApiError): SignupConflictField[] {
  if (error.status !== 409) return [];

  const responseFields = (error.data as { fields?: unknown } | undefined)?.fields;
  if (Array.isArray(responseFields)) {
    const fields: SignupConflictField[] = [];
    if (responseFields.includes('email')) fields.push('email');
    if (responseFields.includes('phone')) fields.push('phone');
    if (fields.length) return fields;
  }

  if (error.code === 'SIGNUP_EMAIL_EXISTS') return ['email'];
  if (error.code === 'SIGNUP_PHONE_EXISTS') return ['phone'];

  const message = error.message.toLowerCase();
  if (message.includes('email') && !message.includes('phone')) return ['email'];
  if (message.includes('phone') && !message.includes('email')) return ['phone'];
  return [];
}

export async function resolveSignupConflictFields(
  error: ApiError,
  email: string,
  phone: string,
): Promise<SignupConflictField[]> {
  const fields = getSignupConflictFields(error);
  if (fields.length || error.status !== 409) return fields;

  const message = error.message.toLowerCase();
  if (!message.includes('email') || !message.includes('phone') || !message.includes('exists')) {
    return [];
  }

  const [emailResult, phoneResult] = await Promise.allSettled([
    email
      ? authService.checkEmailExists(email).then(
          (result) => result.exists,
          (lookupError: ApiError) => {
            if (lookupError.status === 409) return true;
            throw lookupError;
          },
        )
      : Promise.resolve(false),
    phone
      ? authService.checkPhoneExists(phone).then((result) => result.exists)
      : Promise.resolve(false),
  ]);

  if (emailResult.status === 'fulfilled' && emailResult.value) fields.push('email');
  if (phoneResult.status === 'fulfilled' && phoneResult.value) fields.push('phone');
  return fields;
}
