import { createApp } from 'vue'

import App from '@/App.vue'
import { i18n } from '@/i18n'
import vuetify from '@/plugins/vuetify'
import router from '@/router'
import { createPinia } from 'pinia'
import { createMetaManager } from 'vue-meta'
import VueApexCharts from 'vue3-apexcharts'

const app = createApp(App)
app.use(router)
  .use(createPinia())
  .use(i18n)
  .use(vuetify)
  .use(VueApexCharts)
  .use(createMetaManager())

app.directive('focus', (el: HTMLElement) => {
  el.focus()
})

app.mount('#app')
