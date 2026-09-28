import generalEn from './general/en';
import generalDe from './general/de';
import generalEs from './general/es';
import generalAr from './general/ar';
import generalFr from './general/fr';
import { APP_I18N_RESOURCES } from '../../apps/registry/generated/appI18nRegistry';

export const translations = {
  en: {
    general: generalEn,
    ...APP_I18N_RESOURCES.en,
  },
  de: {
    general: generalDe,
    ...APP_I18N_RESOURCES.de,
  },
  es: {
    general: generalEs,
    ...APP_I18N_RESOURCES.es,
  },
  ar: {
    general: generalAr,
    ...APP_I18N_RESOURCES.ar,
  },
  fr: {
    general: generalFr,
    ...APP_I18N_RESOURCES.fr,
  },
} as const;

export type Language = keyof typeof translations;
export type Namespace = keyof typeof translations.en;
