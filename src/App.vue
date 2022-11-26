<template>
  <!-- All the app encapsulated -->
  <v-app>
    <metainfo>
      <template v-slot:title="{ content }">
        {{ content ? `${content} - Hylectrif` : `Hylectrif` }}
      </template>
    </metainfo>

    <NavbarComponent />

    <v-main id="main">
      <v-container id="container" fluid>
        <NotificationProvider />
        <router-view />
      </v-container>
    </v-main>

    <FooterComponent />
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMeta } from 'vue-meta'

import FooterComponent from '@/components/FooterComponent.vue'
import NavbarComponent from '@/components/NavbarHeader.vue'
import NotificationProvider from '@/components/NotificationProvider.vue'
import { locale, t } from '@/i18n'

export default defineComponent({
  name: 'App',
  components: { NavbarComponent, NotificationProvider, FooterComponent },
  setup () {
    const DESCRIPTION = t('about.website-description')
    useMeta({
      htmlAttrs: {
        lang: locale
      },
      og: {
        description: DESCRIPTION
      },
      description: DESCRIPTION
    })
  },
  created () {
    document.documentElement.lang = this.$i18n.locale
  },
  data () {
    return {
      snackbar: true
    }
  }
})
</script>
<style scoped>
@font-face {
  font-family: "Righteous";
  src: local("Righteous"), url(../public/Righteous-j7av.ttf) format("truetype");
  font-display: swap;
}

@font-face {
  font-family: "Oswald";
  src: local("Oswald"), url(../public/Oswald-Medium.ttf) format("truetype");
  font-display: swap;
}

#container {
  height: 100%;
  padding: 0px;

  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
  font-family: "Oswald", Helvetica, Sans-serif !important;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  align-content: space-between;
  justify-content: center;
}

#main {
  /* Footer height */
  height: calc(100% - 108px);

  background-color: var(--primary-color) !important;
  color: var(--text-color) !important;
}
</style>
