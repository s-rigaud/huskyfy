<template>
  <v-app-bar
    app
    absolute
    v-if="userStore.connected"
    fade-img-on-scroll
    color="#f4f4f4"
  >
    <router-link id="explore" to="/explore">
      <img id="logo" src="logo.png" alt="" />
    </router-link>

    <v-spacer></v-spacer>

    <!-- User info part -->
    <h3 style="margin-right: 10px">
      {{ userStore.username }}
    </h3>
    <v-badge content="🎵" color="warning">
      <v-avatar style="align-items: initial">
        <v-img
          v-bind:src="this.userStore.profilePicture"
          alt="Profile picture"
        ></v-img>
      </v-avatar>
    </v-badge>

    <v-btn @click="logout" color="error">
      {{ $t("navbar.logout") }}
    </v-btn>

    <LocaleSelector />
  </v-app-bar>
</template>

<script>
import LocaleSelector from "@/components/LocaleSelector.vue";
import { useAuthStore } from "@/stores/auth";
import { usePlaylistsStore } from "@/stores/playlists";
import { useUserStore } from "@/stores/user";

export default {
  name: "NavbarComponent",
  components: { LocaleSelector },
  setup() {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const playlistsStore = usePlaylistsStore();
    return { authStore, userStore, playlistsStore };
  },
  computed: {
    profilePictureOrDefault() {
      const DEFAULT_PICTURE = require("@/assets/no-user.png");
      return this.userStore.profilePicture != ""
        ? this.userStore.profilePicture
        : DEFAULT_PICTURE;
    },
  },
  methods: {
    logout() {
      this.userStore.$reset();
      this.authStore.$reset();
      this.playlistsStore.$reset();
      this.$router.push({ name: "LoginView" });
    },
  },
};
</script>
<style scoped>
#logo {
  min-width: 100px;
  width: 150px;
}
</style>