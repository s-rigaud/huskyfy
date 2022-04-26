<template>
  <v-app-bar
    app
    absolute
    v-if="userStore.connected"
    fade-img-on-scroll
    image="https://psl.eu/sites/default/files/styles/fiche_evenement/public/2021-09/events_papyrus-cdf.png?itok=8KlmBy08"
  >
    <router-link id="explore" to="/explore"
      ><img src="logo.png" alt="" style="min-width: 100px; width: 150px"
    /></router-link>

    <v-spacer></v-spacer>

    <h3 style="margin-right: 10px">{{ userStore.username }}</h3>
    <v-badge content="🎵" color="warning">
      <v-avatar style="align-items: initial">
        <v-img
          v-bind:src="this.userStore.profilePicture"
          alt="Profile picture"
        ></v-img>
      </v-avatar>
    </v-badge>
    <v-btn @click="logout" color="error">Logout</v-btn>
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
  computed: {
    profilePictureOrDefault() {
      const DEFAULT_PICTURE =
        "https://4.bp.blogspot.com/-l60SlLNpKH0/WMmAGuXxX4I/AAAAAAAAB4E/nYzxAq6UOngLjsT277uXW5Am5Mom2oXpQCLcB/s1600/serpent%2Bkaa.jpg";
      return this.userStore.profilePicture != ""
        ? this.userStore.profilePicture
        : DEFAULT_PICTURE;
    },
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