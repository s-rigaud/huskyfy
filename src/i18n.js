import { createI18n } from 'vue-i18n';
import en from 'vuetify/lib/locale/en';
import fr from 'vuetify/lib/locale/fr';

const messages = {
    en: {
        ...require('@/locales/en.json'),
        $vuetify: en,
    },
    fr: {
        ...require('@/locales/fr.json'),
        $vuetify: fr,
    }
}


export default new createI18n({
    locale: localStorage.getItem("locale") || process.env.VUE_APP_I18N_LOCALE || 'en',
    fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
    messages,
})
