<template>
  <!-- Login view with a large background and a simple button -->
  <div id="login">
    <div id="upper-part">
      <h1 style="color: white">{{ $t("login.header") }}</h1>
      <LocaleSelector />
    </div>

    <div id="lower-part">
      <v-btn id="connect-button" @click="accessOAuthPage" v-if="!userStore.connected" rounded>
        {{ $t("login.connect") }}
        <v-icon right light> mdi-account-circle </v-icon>
      </v-btn>
      <router-link to="/about" id="link-about">
        {{ $t("login.about") }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import api from '@/api'
import LocaleSelector from '@/components/LocaleSelector.vue'
import { useUserStore } from '@/stores/user'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginView',
  setup () {
    const userStore = useUserStore()
    return { userStore }
  },
  components: { LocaleSelector },
  methods: {
    async accessOAuthPage () {
      window.location.href = await api.spotify.auth.getOAuthUrl()
    }
  }
})
</script>
<style scoped>
#login {
  text-align: center;
  background: url("../../public/home-background.webp");
  background-size: cover;
  background-position: 50%;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  padding: 12px;
}

#upper-part {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

#lower-part {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#lower-part>a {
  position: absolute;
  bottom: 5%;
  font-size: large;
}

#link-about {
  color: white;
}

#connect-button {
  font-size: larger;
  padding: 20px;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text-color) !important;
  position: absolute;
  bottom: 10%;
}

#connect-button:hover {
  outline: var(--primary-color) solid 2px !important;
}

#connect-button:focus {
  outline: var(--primary-color) solid 2px;
}

a,
h1 {
  background: rgba(0, 0, 0, 0.3);
}

.mdi {
  margin-left: 3px;
}
</style>
