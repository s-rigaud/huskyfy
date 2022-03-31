<template>
  <div v-if="!this.userStore.connected">
    <button @click="makeOauthRequest">Access OAuth2 portal</button>
    <button @click="makeAccessTokenRequest">
      Request acces token with temp token : {{ this.authStore.temporaryToken }}
    </button>
    <button @click="requestUserData">Get user info</button>
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
      const data = response.data;
      console.log(data);

      this.userStore.$patch({
        id: data.id,
        username: data.display_name,
        profilePicture: data.images[0].url,
        isPremium: data.product == "premium",
        mail: data.email,
        country: data.country,
        connected: true,
      });
    },
  },
};
</script>