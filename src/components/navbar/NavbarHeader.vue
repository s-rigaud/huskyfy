<template>
  <v-app-bar
    v-if="userStore.connected"
    fixed
    color="white"
    style="font-family: 'Righteous'"
  >
    <router-link id="explore" to="/explore" style="height: inherit">
      <img id="logo" :src="logo" alt="" style="height: 100%" />
    </router-link>

    <v-spacer></v-spacer>

    <v-menu open-on-hover transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <div id="user-info" v-bind="props">
          <h3 style="margin-right: 10px">
            {{ userStore.username }}
          </h3>
          <v-badge content="🎵" color="warning">
            <v-avatar style="align-items: initial">
              <v-img
                v-bind:src="this.userStore.profilePicture"
                alt="Profile picture"
              ></v-img>
            </v-avatar>
          </v-badge>
        </div>
      </template>

      <v-btn
        id="logout-button"
        @click="logout"
        color="error"
        variant="outlined"
      >
        {{ $t("navbar.logout") }}
      </v-btn>
    </v-menu>

    <v-btn @click="clearLocalStorage" variant="outlined">
      Clear local storage
    </v-btn>
    <LocaleSelector />

    <template v-slot:extension>
      <NavbarPlaylistSelected />
    </template>
  </v-app-bar>
</template>

<script>
import LocaleSelector from '@/components/LocaleSelector.vue'
import NavbarPlaylistSelected from '@/components/navbar/NavbarPlaylistSelected.vue'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'

export default {
  name: 'NavbarHeader',
  components: { LocaleSelector, NavbarPlaylistSelected },
  setup () {
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const playlistsStore = usePlaylistsStore()

    return { authStore, playlistsStore, userStore }
  },
  computed: {
    profilePictureOrDefault () {
      // eslint-disable-next-line
      const DEFAULT_PICTURE = require("@/assets/no-user.png");
      return this.userStore.profilePicture !== ''
        ? this.userStore.profilePicture
        : DEFAULT_PICTURE
    },
    logo () {
      return require('@/assets/logo.png')
    }
  },
  methods: {
    clearLocalStorage () {
      localStorage.clear()
      this.logout()
    },
    logout () {
      this.userStore.reset()
      this.authStore.reset()
      this.playlistsStore.selectedPlaylistId = null
      this.$router.push({ name: 'LoginView' })
    }
  }
}
</script>
<style>
#logo {
  min-width: 100px;
  width: 150px;
}

#user-info {
  margin-right: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

#logout-button {
  background-color: white;
  position: absolute;
  top: 12px;
  font-family: "Oswald";
}
.v-toolbar__extension {
  height: fit-content !important;
}
</style>
