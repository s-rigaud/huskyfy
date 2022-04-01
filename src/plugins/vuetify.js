// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import VueI18n from './i18n'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify(
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
  {
    lang: {
      t: (key, ...params) => i18n.t(key, params),
    },
  }
)
