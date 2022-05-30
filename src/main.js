import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import router from '@/router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueApexCharts from "vue3-apexcharts"
import App from './App.vue'
import VueI18n from './i18n'
loadFonts()

createApp(App)
  .use(router)
  .use(createPinia())
  .use(vuetify)
  .use(VueI18n)
  .use(VueApexCharts)
  .mount('#app')

// Color palett
// https://flatuicolors.com/palette/au