<template>
  <v-btn
    @click="accessOAuthPage"
    v-if="!userStore.connected"
    rounded
    color="primary"
    >Access OAuth2 portal</v-btn
  >
  <v-img src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"></v-img>
</template>

<script>
import api from "@/api";
import { useUserStore } from "@/stores/modules/user";

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