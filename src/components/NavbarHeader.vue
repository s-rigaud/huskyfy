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
        alt="Huskyfy logo"
        src="@/assets/Huskyfy.png"
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
              :src="userStore.profilePicture"
              alt="Profile picture"
              rel="preconnect"
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

<script setup lang="ts">
import router, { ROUTE_NAME_LOGIN } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { usePlaylistsStore } from '@/stores/playlists'
import { useSDKStore } from '@/stores/spotifySDK'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

/**
 * Reset all Pinia stores on disconnection.
 * Redirect to Login page.
 */
const disconnect = () => {
  useUserStore().reset()
  useAuthStore().reset()
  usePlaylistsStore().reset()
  useNotificationsStore().reset()
  useSDKStore().$reset()

  router.push({ name: ROUTE_NAME_LOGIN })
}

</script>
<style>
#app-bar {
  padding: 0 !important;
  height: 64px;

  /* In front of Vuetify menu default z-index -> 2000 */
  z-index: 2001;
  font-family: 'Righteous', Helvetica, Sans-serif;
  cursor: default;
  color: var(--huskyfy-orange) !important;
  background-color: var(--huskyfy-black) !important;
  outline: 2px var(--huskyfy-orange) solid;
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
