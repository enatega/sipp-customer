export const SUPPORTED_LANGUAGES = ['en', 'de', 'es', 'ar', 'fr'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'super_app_language';

export const LANGUAGE_LABEL_KEYS: Record<SupportedLanguage, string> = {
  en: 'language_english',
  de: 'language_german',
  es: 'language_spanish',
  ar: 'language_arabic',
  fr: 'language_french',
};

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

export function normalizeSupportedLanguage(value?: string | null): SupportedLanguage {
  const baseLanguage = value?.trim().toLowerCase().split('-')[0] ?? '';
  return isSupportedLanguage(baseLanguage) ? baseLanguage : DEFAULT_LANGUAGE;
}
