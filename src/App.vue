<template>
  <!-- All the app encapsulated -->
  <v-app>
    <!-- Navbar -->
    <NavbarComponent />

    <!-- Main view with routing -->
    <v-main id="main">
      <v-container id="container" fluid>
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
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  components: { NavbarComponent, FooterComponent },
  created () {
    document.documentElement.lang = this.$i18n.locale
  }
})
</script>
<style scoped>
@font-face {
  font-family: "Righteous", Helvetica, Sans-serif;
  src: local("Righteous"), url(../public/Righteous-j7av.ttf) format("truetype");
  font-display: swap;
}

@font-face {
  font-family: "Oswald", Helvetica, Sans-serif;
  src: local("Oswald"), url(../public/Oswald-Medium.ttf) format("truetype");
  font-display: swap;
}

#container {
  padding: 5px;
  background-color: var(--secondary-color) !important;
  color: var(--text-color) !important;
  font-family: "Oswald", Helvetica, Sans-serif !important;
  height: 100%;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: stretch;
  align-content: space-between;
  justify-content: center;
}

#main {
  background-color: var(--primary-color) !important;
  color: var(--text-color) !important;
}
</style>
