<template>
  <!-- All the app encapsulated -->
  <v-app>
    <!-- Navbar -->
    <NavbarComponent />

    <!-- Main view with routing -->
    <v-main id="main">
      <v-container id="container" fluid>
        <NotificationProvider />
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer -->
    <FooterComponent />
  </v-app>
</template>

<script lang="ts">
import FooterComponent from '@/components/FooterComponent.vue'
import NavbarComponent from '@/components/NavbarHeader.vue'
import NotificationProvider from './components/NotificationProvider.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  components: { NavbarComponent, NotificationProvider, FooterComponent },
  created() {
    document.documentElement.lang = this.$i18n.locale
  },
  data() {
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
  flex-wrap: wrap;
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
