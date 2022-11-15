<template>
  <!-- Navbar -->
  <v-app-bar id="app-bar" flat v-if="$router.currentRoute.value.path !== '/login'">
    <!-- Left part -->
    <router-link id="logo-link" to="/explore">
      <v-img id="logo" src="@/assets/Huskyfy.png" alt="Huskyfy logo"></v-img>
    </router-link>
    <v-spacer></v-spacer>

    <!-- Right part -->
    <div id="user-info" @click="openUserSpotifyProfile">
      <h3 id="profile-name" class="rainbow-text"> {{ userStore.username }} </h3>
      <v-avatar id="profile-picture">
        <v-img rel="preconnect" :src="userStore.profilePicture" alt="Profile picture"></v-img>
      </v-avatar>
    </div>
  </v-app-bar>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/user'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NavbarHeader',
  setup () {
    const userStore = useUserStore()
    return { userStore }
  },
  computed: {
    profilePictureOrDefault (): string {
      // eslint-disable-next-line
      const DEFAULT_PICTURE: string = require("@/assets/no-user.png")
      return this.userStore.profilePicture || DEFAULT_PICTURE
    }
  },
  methods: {
    openUserSpotifyProfile () {
      window.location.href = this.userStore.uri
    }
  }
})
</script>
<style>
#app-bar {
  padding: 0 !important;
  height: 64px;

  font-family: 'Righteous', Helvetica, Sans-serif;
  cursor: default;
  color: var(--text-color) !important;
  background-color: var(--primary-color) !important;
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
</style>
