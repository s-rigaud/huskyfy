<template>
  <!-- Login view with a large background and a simple button -->
  <div id="login">
    <div id="locale-selector">
      <LocaleSelector />
    </div>

    <div id="upper-part">
      <v-img rel="preconnect" width="400" :src="logo" alt="Horus Image"></v-img>
    </div>

    <div id="hero">
      <h1 style="color: white" class="rainbow-text">{{ $t("login.header") }}</h1>
      <ul>
        <li>{{ $t("login.functionality1") }}</li>
        <li>{{ $t("login.functionality2") }}</li>
        <li>{{ $t("login.functionality3") }}</li>
        <li>{{ $t("login.functionality4") }}</li>
      </ul>
    </div>

    <div id="lower-part">
      <v-btn id="connect-button" @click="accessOAuthPage" v-if="!userStore.connected" rounded class="rainbow-v-btn">
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
  computed: {
    logo (): string {
      return require('@/assets/fiverr/basic.svg')
    }
  },
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

  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
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

#locale-selector {
  position: absolute;
  top: 0%;
  right: 0%;
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
  color: black !important;
  position: absolute;
  bottom: 10%;
}

#connect-button:hover {
  outline: var(--primary-color) solid 2px !important;
}

#connect-button:focus {
  outline: var(--primary-color) solid 2px !important;
}

a {
  background: rgba(0, 0, 0, 0.3);
}

.mdi {
  margin-left: 3px;
}

#hero {
  background-color: rgba(0, 0, 0, 0.5);
  width: 80%;
  height: 50%;
  margin-top: 40px;
  border-radius: 15px;
}

@media (max-width: 992px) {
  #locale-selector {
    top: auto;
    bottom: 0;
  }
}
</style>
