<template>
  <div v-if="!userStore.connected">
    <v-btn
      @click="accessOAuthPage"
      v-if="!userStore.connected"
      rounded
      color="primary"
      >Access OAuth2 portal</v-btn
    >
  </div>
  <v-parallax
    src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
  ></v-parallax>
  <div style="height: 1000px"></div>
</template>

<script>
import api from "@/api";
import { useUserStore } from "@/stores/modules/user";

export default {
  name: "HomePage",
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