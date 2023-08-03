import { createI18n, FallbackLocale, Locale } from 'vue-i18n'

import en from '@/locales/en.json'
import fr from '@/locales/fr.json'

type MessageSchema = typeof en & typeof fr

export const messages = {
  en: { ...en, $vuetify: 'en' },
  fr: { ...fr, $vuetify: 'fr' }
} as const

const currentLocale: Locale = localStorage.getItem('locale') || import.meta.env.VITE_APP_I18N_LOCALE || 'en'
const fallbackLocale: FallbackLocale = import.meta.env.VITE_APP_I18N_FALLBACK_LOCALE || 'en'

export const i18n = createI18n<[MessageSchema], 'fr' | 'en'>({
  locale: currentLocale,
  fallbackLocale,
  messages
})
export const { t, tc, locale } = i18n.global
