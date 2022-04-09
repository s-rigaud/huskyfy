<template>
  <v-app-bar app absolute v-if="userStore.connected">
    <router-link id="explore" to="/explore">🏠 Explore </router-link>
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