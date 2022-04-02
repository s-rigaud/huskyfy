<template>
  <v-app>
    <NavbarComponent />
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
    <FooterComponent />
  </v-app>
</template>

<script>
import FooterComponent from "@/components/FooterComponent.vue";
import NavbarComponent from "@/components/NavbarComponent.vue";

export default {
  name: "App",
  components: { NavbarComponent, FooterComponent },
};
</script>
