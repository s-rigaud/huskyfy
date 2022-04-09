<template>
  <div
    id="login"
    style="
      text-align: center;
      background: url(home-background.jpg);
      background-size: cover;
      background-position: 50%;
      overflow: hidden;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 1;
    "
  >
    <h1 style="color: white">Split your Spotify playlist easily with Horus</h1>
    <v-btn
      @click="accessOAuthPage"
      v-if="!userStore.connected"
      rounded
      color="primary"
      style="position: relative; bottom: -80%"
      >Connect with Spotify</v-btn
    >
  </div>
</template>

<script>
import api from "@/api";
import { useUserStore } from "@/stores/user";

export default {
  name: "LoginView",
  setup() {
    const userStore = useUserStore();
    return {
      userStore,
    };
  },
  methods: {
    async accessOAuthPage() {
      window.location.href = api.spotify.auth.getOAuthUrl();
    },
  },
};
</script>