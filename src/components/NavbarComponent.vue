<template>
  <v-app-bar app absolute v-if="userStore.connected">
    <v-spacer></v-spacer>
    <p>{{ userStore.username }}</p>
    <v-avatar style="align-items: initial">
      <img .src="this.userStore.profilePicture" alt="Profile picture" />
    </v-avatar>
    <v-btn @click="logout">Logout</v-btn>
  </v-app-bar>
</template>

<script>
import { useAuthStore } from "@/stores/modules/auth";
import { useUserStore } from "@/stores/modules/user";

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
