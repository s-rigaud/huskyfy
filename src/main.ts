import vuetify from '@/plugins/vuetify'
import router from '@/router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import App from '@/App.vue'
import { i18n } from '@/i18n'

createApp(App)
  .use(router)
  .use(createPinia())
  .use(vuetify)
  .use(i18n)
  .use(VueApexCharts)
  .mount('#app')
