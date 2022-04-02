<template>
  <v-app-bar
    app
    elevate-on-scroll
    v-if="userStore.connected"
    class="navbar-end"
    absolute
    color="#6A76AB"
    dark
    shrink-on-scroll
    prominent
    src="https://picsum.photos/1920/1080?random"
    fade-img-on-scroll
    scroll-target="#scrolling-techniques-3"
  >
    <template v-slot:img="{ props }">
      <v-img
        v-bind="props"
        gradient="to top right, rgba(100,115,201,.7), rgba(25,32,72,.7)"
      ></v-img>
    </template>
    <v-spacer></v-spacer>
    <p>{{ userStore.username }}</p>
    <v-avatar style="align-items: initial">
      <img .src="this.userStore.profilePicture" alt="Profile picture" />
    </v-avatar>
  </v-app-bar>
</template>

<script>
import { useUserStore } from "@/stores/modules/user";

export default {
  name: "NavbarComponent",
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  data() {
    return {};
  },
};
</script>
