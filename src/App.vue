<template>
  <!-- All the app encapsulated -->
  <v-app>
    <!-- Navbar -->
    <NavbarComponent />

    <!-- Main view with routing -->
    <v-main id="main" v-bind:class="{
      'no-padding': true,
      'small-padding-top': ['Explore', 'About'].includes(
        $router.currentRoute.value.name
      ),
      'huge-padding-top':
        $router.currentRoute.value.name === 'Explore playlist',
    }">
      <v-container id="container" fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer -->
    <FooterComponent />
  </v-app>
</template>

<script>
import FooterComponent from '@/components/FooterComponent.vue'
import NavbarComponent from '@/components/navbar/NavbarHeader.vue'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'App',
  components: { NavbarComponent, FooterComponent }
})
</script>
<style scoped>
@font-face {
  font-family: "Righteous";
  src: local("Righteous"),
    url(./fonts/righteous/Righteous-j7av.ttf) format("truetype");
  font-display: swap;
}

@font-face {
  font-family: "Oswald";
  src: local("Oswald"), url(./fonts/oswald/Oswald-Medium.ttf) format("truetype");
  font-display: swap;
}

#container {
  padding: 12px;
  background-color: var(--secondary-color) !important;
  color: var(--text-color) !important;
  font-family: "Oswald" !important;
  min-height: 100%;

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

.no-padding {
  padding: 0 !important;
}

.small-padding-top {
  padding: 64px 0 0 0 !important;
}

.huge-padding-top {
  padding: 158px 0 0 0 !important;
}
</style>
