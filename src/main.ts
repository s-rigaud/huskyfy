import { createApp } from 'vue'

import App from '@/App.vue'
import { i18n } from '@/i18n'
import vuetify from '@/plugins/vuetify'
import router from '@/router'
import { createPinia } from 'pinia'
import { createMetaManager } from 'vue-meta'
import VueApexCharts from 'vue3-apexcharts'
import { intersect } from './directives/intersect'
import { focus } from './directives/focus'

const app = createApp(App)
app.use(router)
  .use(createPinia())
  .use(i18n)
  .use(vuetify)
  .use(VueApexCharts)
  .use(createMetaManager())
  .directive('focus', focus)
  .directive('my-intersect', intersect)

app.mount('#app')
