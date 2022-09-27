// Styles
import '@mdi/font/css/materialdesignicons.css'

// Vuetify
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

// Translations
import VueI18n from '../i18n'

export default createVuetify(
  {
    lang: {
      t: (key: string, ...params: string[]): string => VueI18n.t(key, params)
    },
    theme: {
      defaultTheme: 'dark'
    }
  }
)
