<template>
  <!-- Navbar -->
  <v-app-bar fixed flat style="font-family: 'Righteous'" v-if="$router.currentRoute.value.path !== '/login'">
    <!-- Left part -->
    <router-link to="/explore">
      <v-img id="logo" :src="logo" alt="Horus logo"></v-img>
    </router-link>

    <router-link to="/explore" class="navbar-link-text">
      <p class="rainbow-text">%% Explore %%</p>
    </router-link>

    <router-link to="/duplicate-my-music" class="navbar-link-text">
      <p class="rainbow-text">%% DUP %%</p>
    </router-link>

    <v-spacer></v-spacer>

    <!-- Right part -->
    <v-menu open-on-hover transition="fade-transition" v-if="userStore.connected">
      <template v-slot:activator="{ props }">
        <div id="user-info" v-bind="props">
          <h3 id="profile-name" class="rainbow-text"> {{ userStore.username }} </h3>
          <v-avatar style="align-items: initial">
            <v-img rel="preconnect" :src="userStore.profilePicture" alt="Profile picture"></v-img>
          </v-avatar>
        </div>
      </template>

      <div>
        <v-btn id="logout-button" @click="logout" variant="outlined">
          {{ $t("navbar.logout") }}
        </v-btn>
      </div>
    </v-menu>

    <!-- TODO DELETE - Dev button to facilitate -->
    <v-btn @click="clearLocalStorage" variant="outlined" v-if="isDevEnv">
      Clear local storage
    </v-btn>
    <LocaleSelector />

    <!-- Second part which extend on the playlist detail -->
    <template v-slot:extension>
      <NavbarPlaylistSelected />
    </template>
  </v-app-bar>
</template>

<script lang="ts">
import LocaleSelector from '@/components/LocaleSelector.vue'
import NavbarPlaylistSelected from '@/components/navbar/NavbarPlaylistSelected.vue'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavbarHeader',
  components: { LocaleSelector, NavbarPlaylistSelected },
  setup () {
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const playlistsStore = usePlaylistsStore()

    return { authStore, playlistsStore, userStore }
  },
  computed: {
    profilePictureOrDefault (): string {
      // eslint-disable-next-line
      const DEFAULT_PICTURE = require("@/assets/no-user.png");
      return this.userStore.profilePicture !== ''
        ? this.userStore.profilePicture
        : DEFAULT_PICTURE
    },
    logo (): string {
      return require('@/assets/fiverr/basic.svg')
    },
    isDevEnv (): boolean {
      return process.env.NODE_ENV !== 'production'
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
})
</script>
<style>
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
  width: 250px;
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

.navbar-link-text {
  text-decoration: none;
  font-size: larger;
  height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
}

header.v-toolbar__content :nth-child(1) {
  border-left: 4px dotted blue;
}

.navbar-link-text :nth-child(1) {
  border-right: 4px dotted blue;
}

.router-link-active.navbar-link-text {
  box-shadow: 0 -3px 0 0 var(--text-color) inset;
}

.router-link-active.navbar-link-text p {
  /* Rainbow text when selected */
  background: linear-gradient(180deg, var(--text-color) 20%, var(--link-color) 51%, var(--text-color) 86%);
  background-size: 100%;
  background-repeat: repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navbar-link-text p {
  background: linear-gradient(180deg, white 100%, transparent);
  background-size: 100%;
  background-repeat: repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (max-width: 600px) {
  #logo {
    height: 50px;
    width: 100px;
  }

  header {
    padding: 2px !important;
  }
}
</style>
