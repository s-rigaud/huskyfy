// Styles
import '@mdi/font/css/materialdesignicons.css'
// Vuetify
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
// Translations
import i18n from '../i18n'


export default createVuetify(
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
  {
    lang: {
      t: (key, ...params) => i18n.t(key, params),
    },
  }
)
