import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import { i18n } from '@/i18n'
import vuetify from '@/plugins/vuetify'
import VueApexCharts from 'vue3-apexcharts'
import { createMetaManager } from 'vue-meta'

createApp(App)
  .use(router)
  .use(createPinia())
  .use(i18n)
  .use(vuetify)
  .use(VueApexCharts)
  .use(createMetaManager())
  .mount('#app')
