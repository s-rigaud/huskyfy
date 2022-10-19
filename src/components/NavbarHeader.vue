<template>
  <!-- Navbar -->
  <v-app-bar id="app-bar" flat v-if="$router.currentRoute.value.path !== '/login'">
    <!-- Left part -->
    <router-link id="app-bar-logo" to="/explore">
      <v-img id="logo" :src="logo" alt="Huskyfy logo"></v-img>
    </router-link>
    <v-spacer></v-spacer>

    <!-- Right part -->
    <div id="user-info">
      <h3 id="profile-name" class="rainbow-text"> {{ userStore.username }} </h3>
      <v-avatar id="profile-picture">
        <v-img rel="preconnect" :src="userStore.profilePicture" alt="Profile picture"></v-img>
      </v-avatar>
    </div>

    <!-- TODO DELETE - Dev button to facilitate -->
    <v-btn @click="clearLocalStorage" variant="outlined" v-if="isDevEnv">
      Clear local storage
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { useAuthStore } from '@/stores/auth'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavbarHeader',
  setup() {
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const playlistsStore = usePlaylistsStore()

    return { authStore, playlistsStore, userStore }
  },
  computed: {
    profilePictureOrDefault(): string {
      // eslint-disable-next-line
      const DEFAULT_PICTURE = require("@/assets/no-user.png");
      return this.userStore.profilePicture !== ''
        ? this.userStore.profilePicture
        : DEFAULT_PICTURE
    },
    logo(): string {
      return require('@/assets/Huskyfy.png')
    },
    isDevEnv(): boolean {
      return process.env.NODE_ENV !== 'production'
    }
  },
  methods: {
    clearLocalStorage() {
      localStorage.clear()
      this.logout()
    },
    logout() {
      this.userStore.reset()
      this.authStore.reset()
      this.$router.push({ name: 'LoginView' })
    }
  }
})
</script>
<style>
#app-bar {
  font-family: 'Righteous';
  height: 64px
}

#app-bar-logo {
  width: 100%
}

#profile-picture {
  align-items: initial
}

header {
  background-color: var(--primary-color) !important;
  color: var(--text-color) !important;
  letter-spacing: 1px !important;
  padding: 0 !important;
}

header .v-toolbar__content {
  padding: 0 !important;
  height: 100% !important;
}

#profile-name {
  margin-right: 10px
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

#logout-button {
  background-color: var(--primary-color);
}

#logout-button {
  position: absolute;
  top: 12px;
  font-family: "Oswald";
}

.v-toolbar__extension {
  height: fit-content !important;
}
</style>
