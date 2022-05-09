<template>
  <div id="login">
    <div id="upper-part">
      <h1 style="color: white">{{ $t("login.header") }}</h1>
      <LocaleSelector />
    </div>

    <div id="lower-part">
      <v-btn
        @click="accessOAuthPage"
        v-if="!userStore.connected"
        rounded
        color="primary"
      >
        {{ $t("login.connect") }}
      </v-btn>
      <router-link to="/about" id="link-about">
        {{ $t("login.about") }}
      </router-link>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import LocaleSelector from "@/components/LocaleSelector.vue";
import { useUserStore } from "@/stores/user";

export default {
  name: "LoginView",
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  components: { LocaleSelector },
  methods: {
    accessOAuthPage() {
      window.location.href = api.spotify.auth.getOAuthUrl();
    },
  },
};
</script>
<style scoped>
#login {
  text-align: center;
  background: url("../../public/home-background.jpg");
  background-size: cover;
  background-position: 50%;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
}
#upper-part {
  display: inline-flex;
}
#lower-part {
  position: relative;
  bottom: -70%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#link-about {
  color: white;
}
</style>