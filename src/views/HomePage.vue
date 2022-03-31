<template>
  <div v-if="!this.userStore.connected">
    <button @click="makeOauthRequest">Connect with Spotify</button>
    <button @click="makeAccessTokenRequest">
      {{ this.authStore.temporaryToken }}
    </button>
    <button @click="requestUserData">Make request</button>
  </div>
</template>

<script>
import api from "@/api";
import { useAuthStore } from "@/stores/modules/auth";
import { useUserStore } from "@/stores/modules/user";

export default {
  name: "HomePage",
  setup() {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    return {
      authStore,
      userStore,
    };
  },

  mounted() {
    const code = this.$route.query.code;
    if (code) {
      this.authStore.temporaryToken = code;
    }
  },
  methods: {
    async makeOauthRequest() {
      const response = await api.spotify.auth.makeOAuthRequest();
      console.log(response);
    },
    async makeAccessTokenRequest() {
      const response = await api.spotify.auth.requestFirstAccessToken();
      console.log(response);
    },
    async requestUserData() {
      const response = await api.spotify.users.getUserProfile();

      this.userStore.$patch({
        id: response.data.id,
        username: response.data.display_name,
        profilePicture: response.data.images[0].url,
        isPremium: response.data.product == "premium",
        mail: response.data.email,
        country: response.data.country,
        connected: true,
      });
      console.log(response.data);
    },
  },
};
</script>