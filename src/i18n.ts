import { createI18n, FallbackLocale, Locale } from 'vue-i18n'
import en from '@/locales/en.json'
import fr from '@/locales/fr.json'

type MessageSchema = typeof en

const messages = {
  en: { ...en, $vuetify: 'en' },
  fr: { ...fr, $vuetify: 'fr' }
}

const locale: Locale = localStorage.getItem('locale') || process.env.VUE_APP_I18N_LOCALE || 'en'
const fallbackLocale: FallbackLocale = process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en'

export const i18n = createI18n<[MessageSchema], 'fr' | 'en'>({
  locale,
  fallbackLocale,
  messages
})
export const t = i18n.global.t
export const tc = i18n.global.tc
