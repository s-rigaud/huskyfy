<template>
  <v-app>
    <v-main>
      <div id="inside-app">
        <NavbarComponent />
        <div class="container my-container">
          <router-view />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import NavbarComponent from "@/components/NavbarComponent.vue";

export default {
  name: "App",
  components: { NavbarComponent },
  data: () => ({
    //
  }),
};
</script>
