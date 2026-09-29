import apiClient from './apiClient';
import type { SupportedLanguage } from '../localization/supportedLanguages';

export type AvailableLanguage = {
  code: string;
  name: string;
  countryName: string;
  countryCode: string;
  imageUrl: string | null;
  isRtl: boolean;
};

export type CustomerLanguageResponse = {
  message?: string;
  customer_id: string;
  customer_language: string;
  language: AvailableLanguage | null;
};

const LANGUAGES_ENDPOINT = '/api/v1/apps/deliveries/languages';
const CUSTOMER_LANGUAGE_ENDPOINT = '/api/v1/apps/deliveries/profile/language';

export const languageService = {
  getAvailableLanguages: (signal?: AbortSignal) =>
    apiClient.get<AvailableLanguage[]>(LANGUAGES_ENDPOINT, undefined, {
      signal,
      skipAuth: true,
      skipSessionExpiryHandling: true,
    }),

  updateCustomerLanguage: (customerLanguage: SupportedLanguage) =>
    apiClient.patch<CustomerLanguageResponse>(CUSTOMER_LANGUAGE_ENDPOINT, {
      customerLanguage,
    }),
};
