<template>
  <!-- Navbar -->
  <v-app-bar v-if="userStore.connected" fixed flat style="font-family: 'Righteous'">
    <!-- Left part -->
    <router-link id="explore" to="/explore">
      <img id="logo" :src="logo" alt="Horus logo" />
    </router-link>

    <v-spacer></v-spacer>

    <!-- Right part -->
    <v-menu open-on-hover transition="fade-transition">
      <template v-slot:activator="{ props }">
        <div id="user-info" v-bind="props">
          <h3 id="profile-name"> {{ userStore.username }} </h3>
          <v-badge content="🎵" color="var(--link-color)">
            <v-avatar style="align-items: initial">
              <v-img rel="preconnect" :src="userStore.profilePicture" alt="Profile picture"></v-img>
            </v-avatar>
          </v-badge>
        </div>
      </template>

      <v-btn id="logout-button" @click="logout" variant="outlined">
        {{ $t("navbar.logout") }}
      </v-btn>
      <v-btn id="change-account-button" @click="logoutAndChangeAccount" variant="outlined">
        {{ $t("navbar.change-account") }}
      </v-btn>
    </v-menu>

    <!-- TODO DELETE - Dev button to facilitate -->
    <v-btn @click="clearLocalStorage" variant="outlined">
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
      return require('@/assets/logo-dark.svg')
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
    },
    logoutAndChangeAccount () {
      this.userStore.wantsToChangeAccount = true
      // wantsToChangeAccount is not reset
      this.userStore.reset()
      this.authStore.reset()
      this.playlistsStore.reset()
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
}

#profile-name {
  margin-right: 10px
}

#logo {
  margin-top: 5px;
  width: 150px;
}

#user-info {
  margin-right: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

#logout-button,
#change-account-button {
  background-color: var(--primary-color);
}

#logout-button {
  position: absolute;
  top: 12px;
  font-family: "Oswald";
}

#change-account-button {
  position: absolute;
  top: 45px;
  font-family: "Oswald";
}

.v-toolbar__extension {
  height: fit-content !important;
}

.v-menu .v-overlay__content {
  width: 500px !important;
}

@media (max-width: 992px) {
  #logo {
    height: 50px;
    width: auto;
  }

  header {
    padding: 2px !important;
  }
}
</style>
