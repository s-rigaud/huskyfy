<template>
  <div id="inside-app">
    <NavbarComponent />
    <div class="container my-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavbarComponent from "@/components/NavbarComponent.vue";
export default {
  name: "App",
  components: { NavbarComponent },
};
</script>