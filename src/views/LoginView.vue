<template>
  <!-- Login view with a large background and a simple button -->
  <div id="login">
    <div id="upper-part">
      <v-img id="logo" rel="preconnect" :src="textLogo" alt="Huskyfy"></v-img>
    </div>

    <div id="hero">
      <h1 id="title" class="rainbow-text">{{ $t("login.header") }}</h1>
      <div id="functionalities">
        <div v-for="n of maxNumberOfFunctionalities" :key="n" class="functionality">
          <v-img :src="boneImg" alt="small-bone" width="24" style="max-width: 24px"></v-img>
          <h4>{{ $t(`login.functionality${n}`) }}</h4>
        </div>
      </div>
    </div>

    <div id="lower-part">
      <v-btn id="connect-button" @click="accessOAuthPage" v-if="!userStore.connected" rounded class="rainbow-v-btn"
        size="large">
        {{ $t("login.connect") }}
        <v-icon right light style="padding-top: 5px;"> mdi-account-circle </v-icon>
      </v-btn>

      <router-link to="/about" id="link-about">
        {{ $t("login.about") }}
      </router-link>
    </div>
  </div>

  <div id="locale-selector">
    <LocaleSelector />
  </div>
</template>

<script lang="ts">
import api from '@/api'
import LocaleSelector from '@/components/LocaleSelector.vue'
import { useUserStore } from '@/stores/user'
import { range } from '@/utils/functions'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginView',
  setup () {
    const userStore = useUserStore()
    return { userStore }
  },
  components: { LocaleSelector },
  computed: {
    textLogo (): string {
      return require('@/assets/Huskyfy.png')
    },
    boneImg (): string {
      return require('@/assets/small-bone.png')
    },
    maxNumberOfFunctionalities (): number[] {
      const length = (window.innerHeight > 700) ? 8 : 4
      return range(1, length + 1)
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
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 12px;

  background: url("../../public/home-background.webp");
  background-size: cover;
  background-position: 50%;
  z-index: 1;

  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  text-align: center;
}

#upper-part {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;

  width: min(100%, 400px);
  margin-top: 15px;
}

#upper-part>#logo {
  height: max(15%, 90px);
}

.mdi {
  margin-left: 3px;
}

#hero {
  width: min(95%, 800px);
  min-height: 60%;
  margin-top: 20px;
  padding: 15px;

  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.7);

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

#functionalities {
  width: fit-content;
  margin: auto;

  display: flex;
  flex-direction: column;

  text-align: left;
}

.functionality {
  display: inline-flex;
  align-items: flex-start;

  padding: 10px 0px;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

.functionality>h4 {
  margin-left: 5px;
}

.functionality .v-img {
  max-width: 24px;
}

#title {
  font-size: x-large;
  margin: 0px;
}

#lower-part {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#lower-part>a {
  position: absolute;
  bottom: 3%;
  font-size: large;
}

#locale-selector {
  position: absolute;
  bottom: 0%;
  right: 0%;
  font-size: large;
  z-index: 1;
}

#link-about {
  color: white;
}

#connect-button {
  font-size: larger;
  text-transform: none;
  letter-spacing: 0;
  color: black !important;

  position: absolute;
  bottom: 8%;
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
</style>
