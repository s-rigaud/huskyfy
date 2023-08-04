<template>
  <!-- All the app encapsulated -->
  <v-app>
    <metainfo>
      <template #title="{ content }">
        {{ content ? `${content} - Huskyfy` : `Huskyfy` }}
      </template>
    </metainfo>

    <NavbarComponent />

    <v-main id="main">
      <v-container
        id="container"
        fluid
      >
        <NotificationProvider />
        <router-view />
      </v-container>
    </v-main>

    <FooterComponent />
  </v-app>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useMeta } from 'vue-meta'

import { WindowWithSDK } from '@/api/spotify/types/sdk'
import FooterComponent from '@/components/FooterComponent.vue'
import NavbarComponent from '@/components/NavbarHeader.vue'
import NotificationProvider from '@/components/NotificationProvider.vue'
import { locale, t } from '@/i18n'

useMeta({
  htmlAttrs: { lang: locale },
  og: { description: t('about.website-description') },
  description: t('about.website-description')
})

const instantiateSpotifySDK = () => {
  const script = document.createElement('script')
  script.src = 'https://sdk.scdn.co/spotify-player.js'
  script.async = true

  document.body.appendChild(script)

  const w = window as any as WindowWithSDK
  w.onSpotifyWebPlaybackSDKReady = () => {
    /*
    const token = useAuthStore().accessToken
    const sdkStore = useSDKStore()
    const player = new w.Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: (cb: (token: string) => void) => { cb(token) },
      volume: 0.5
    })

    sdkStore.player = player

    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id)
    })
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id)
    })
    player.addListener('player_state_changed', state => {
      if (!state) return

      sdkStore.currentTrack = state.track_window.current_track
      sdkStore.isPaused = state.paused
      player.getCurrentState().then(state => {
        sdkStore.isActive = !!state
      })
    })

    player.connect()
    */
  }
}

onBeforeMount(instantiateSpotifySDK)
</script>

<style scoped>
@font-face {
  font-family: "Righteous";
  src: local("Righteous"), url(/Righteous-j7av.ttf) format("truetype");
  font-display: swap;
}

@font-face {
  font-family: "Oswald";
  src: local("Oswald"), url(/Oswald-Medium.ttf) format("truetype");
  font-display: swap;
}

#container {
  height: 100%;
  padding: 0px;

  color: var(--text-color) !important;
  background-color: var(--secondary-color) !important;
  font-family: "Oswald", Helvetica, Sans-serif !important;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  align-content: space-between;
  justify-content: center;
}

#main {
  /* Footer height */
  height: calc(100% - 108px);

  color: var(--text-color) !important;
  background-color: var(--primary-color) !important;
}
</style>
