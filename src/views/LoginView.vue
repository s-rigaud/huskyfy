<template>
  <div id="login">
    <div id="upper-part">
      <v-img
        id="logo"
        alt="Huskyfy"
        rel="preconnect"
        src="@/assets/Huskyfy.png"
      />
    </div>

    <div id="hero">
      <h1
        id="title"
        class="rainbow-text"
      >
        {{ $t("login.header") }}
      </h1>
      <div id="functionalities">
        <div
          v-for="n in 6"
          :key="n"
          class="functionality"
        >
          <p class="emoji">
            {{ $t(`login.functionality${n}.emoji`) }}
          </p>
          <h4>{{ $t(`login.functionality${n}.text`) }}</h4>
        </div>
      </div>
    </div>

    <div id="lower-part">
      <v-btn
        id="connect-button"
        class="rainbow-v-btn"
        rounded
        size="large"
        @click="accessOAuthPage"
      >
        {{ $t("login.connect") }}
        <v-icon
          light
          right
          style="padding-top: 5px;"
        >
          mdi-account-circle
        </v-icon>
      </v-btn>

      <router-link
        id="link-about"
        to="/about"
      >
        {{ $t("login.about") }}
      </router-link>
    </div>
  </div>

  <div id="locale-selector">
    <LocaleSelector />
  </div>
</template>

<script setup lang="ts">
import { useMeta } from 'vue-meta'

import api from '@/api'
import LocaleSelector from '@/components/LocaleSelector.vue'
import { t } from '@/i18n'

useMeta({
  title: t('page-title.login'),
  link: [
    { rel: 'canonical', href: `${import.meta.env.VITE_APP_BASE_SERVER_URL}/login` }
  ]
})

const accessOAuthPage = async () => {
  window.location.href = await api.spotify.auth.getOAuthUrl()
}
</script>
<style scoped>
#login {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 12px;

  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  text-align: center;

  background: url("../../home-background.webp");
  background-size: cover;
  background-position: 50%;
  z-index: 1;
}

#upper-part {
  width: min(100%, 650px);
  height: max(15%, 90px);
  margin-top: 15px;

  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

#title {
  font-size: 30px;
  margin: 0px;
}

.mdi {
  margin-left: 3px;
}

#hero {
  width: min(95%, 800px);
  min-height: 60%;
  max-height: 65%;
  margin-top: 20px;
  padding: 15px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.8);
}

#functionalities {
  width: fit-content;
  height: 100%;
  margin: 10px auto;

  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  overflow: hidden;

  text-align: left;
  justify-content: space-evenly;
}

.functionality {
  padding: 10px 0px;

  display: flex;
  align-items: center;
  align-content: center;

  font-size: 15px;
  text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000;
}

.functionality>h4 {
  margin-left: 5px;

  font-size: 17px;
  color: #ECECEC;
}

.emoji {
  font-size: 30px;
}

#lower-part {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#lower-part>a {
  width: max-content;
  position: absolute;
  bottom: 3%;

  font-size: large;
}

#locale-selector {
  position: absolute;
  bottom: 0%;
  right: 0%;

  z-index: 1;
}

#link-about {
  color: white;
}

#connect-button {
  position: absolute;
  bottom: 8%;

  font-size: larger;
  text-transform: none;
  letter-spacing: 0;
  color: black !important;
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
