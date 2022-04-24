<template>
  <v-app-bar
    app
    absolute
    v-if="userStore.connected"
    fade-img-on-scroll
    image="https://psl.eu/sites/default/files/styles/fiche_evenement/public/2021-09/events_papyrus-cdf.png?itok=8KlmBy08"
  >
    <router-link id="explore" to="/explore"
      ><img
        src="http://media.unreel.me/prod/yoola/general//b27c2fe4-d8a8-4adb-9da7-cf2d860bcafa"
        alt=""
        style="min-width: 100px; width: 150px"
    /></router-link>
    <v-spacer></v-spacer>
    <p>{{ userStore.username }}</p>
    <v-avatar style="align-items: initial">
      <v-img
        v-bind:src="this.userStore.profilePicture"
        alt="Profile picture"
      ></v-img>
    </v-avatar>
    <v-btn @click="logout">Logout</v-btn>
  </v-app-bar>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";

export default {
  name: "NavbarComponent",
  setup() {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    return { authStore, userStore };
  },
  methods: {
    logout() {
      this.userStore.$reset();
      this.authStore.$reset();
      this.$router.push({ name: "LoginView" });
    },
  },
};
</script>