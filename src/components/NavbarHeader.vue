<template>
  <!-- Navbar -->
  <v-app-bar
    v-if="$router.currentRoute.value.path !== '/login'"
    id="app-bar"
    flat
  >
    <!-- Left part -->
    <router-link
      id="logo-link"
      to="/explore"
    >
      <v-img
        id="logo"
        src="@/assets/Huskyfy.png"
        alt="Huskyfy logo"
      />
    </router-link>

    <v-spacer />

    <v-menu
      offset="14"
      transition="slide-y-transition"
    >
      <template #activator="{ props }">
        <div
          id="user-info"
          v-bind="props"
        >
          <h3
            id="profile-name"
            class="rainbow-text"
          >
            {{ userStore.username }}
          </h3>
          <v-avatar id="profile-picture">
            <v-img
              rel="preconnect"
              :src="userStore.profilePicture"
              alt="Profile picture"
            />
          </v-avatar>
        </div>
      </template>

      <v-list id="disconnect-container">
        <v-list-item
          id="disconnect"
          link
          prepend-icon="mdi-logout"
          @click="disconnect"
        >
          {{ $t('navbar.change-account') }}
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import router, { ROUTE_NAME_LOGIN } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { useNotificationsStore } from '@/stores/notifications'
import { useSDKStore } from '@/stores/spotifySDK'

export default defineComponent({
  name: 'NavbarHeader',
  setup () {
    const userStore = useUserStore()
    return { userStore }
  },
  computed: {
    profilePictureOrDefault (): string {
      // eslint-disable-next-line
      const DEFAULT_PICTURE = new URL('./../assets/no-user.png', import.meta.url).href
      return this.userStore.profilePicture || DEFAULT_PICTURE
    }
  },
  methods: {
    /**
     * Reset all Pinia stores on disconnection.
     * Redirect to Login page.
     */
    disconnect () {
      useUserStore().reset()
      useAuthStore().reset()
      usePlaylistsStore().reset()
      useNotificationsStore().reset()
      useSDKStore().$reset()

      router.push({ name: ROUTE_NAME_LOGIN })
    }
  }
})
</script>
<style>
#app-bar {
  padding: 0 !important;
  height: 64px;

  /* In front of Vuetify menu default z-index -> 2000 */
  z-index: 2001;
  font-family: 'Righteous', Helvetica, Sans-serif;
  cursor: default;
  color: var(--text-color) !important;
  background-color: var(--primary-color) !important;
  outline: 2px var(--text-color) solid;
}

#app-bar .v-toolbar__content {
  padding: 0 !important;
  height: 100% !important;
}

#logo-link {
  width: 250px;
  margin-left: 10px;
}

#logo {
  width: max(15%, 200px);
}

#user-info {
  margin-right: 15px;

  display: flex;
  align-items: center;

  cursor: pointer;
}

#profile-name {
  margin-right: 10px;
  letter-spacing: 1px !important;
}

#profile-picture {
  align-items: initial;
}

#disconnect-container {
  border-radius: 0px 0px 5px 5px;
}

#disconnect.v-list-item:hover>.v-list-item__overlay {
  opacity: 0.2;
}
</style>
