<template>
  <v-app-bar
    v-if="userStore.connected"
    fixed
    color="white"
    style="font-family: 'Righteous'"
  >
    <router-link id="explore" to="/explore" style="height: inherit">
      <img id="logo" src="logo.png" alt="" style="height: 100%" />
    </router-link>

    <v-spacer></v-spacer>

    <div id="user-info" style="display: flex; align-items: center">
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

      <div id="disconnect">
        <v-btn @click="logout" color="error">
          {{ $t("navbar.logout") }}
        </v-btn>
      </div>
    </div>

    <LocaleSelector />

    <template v-slot:extension>
      <div v-if="playlistsStore.selectedPlaylistId != null">
        <p>
          {{ playlistsStore.playlists[playlistsStore.selectedPlaylistId].name }}
        </p>
        <p>
          {{ playlistsStore.playlists[playlistsStore.selectedPlaylistId].description }}
        </p>
        <p>
          Created by
          {{
            playlistsStore.playlists[playlistsStore.selectedPlaylistId].owner["display_name"]
          }}
        </p>
        <p v-if="playlistsStore.playlists[playlistsStore.selectedPlaylistId].public">
          {{ $t("playlist.public") }}
        </p>
        <p v-if="playlistsStore.playlists[playlistsStore.selectedPlaylistId].collaborative">
          {{ $t("playlist.collaborative") }}
        </p>
      </div>
    </template>
  </v-app-bar>
</template>

<script>
import LocaleSelector from "@/components/LocaleSelector.vue";
import { useAuthStore } from "@/stores/auth";
import { usePlaylistsStore } from "@/stores/playlists";
import { useUserStore } from "@/stores/user";

export default {
  name: "NavbarComponent",
  components: { LocaleSelector },
  setup() {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const playlistsStore = usePlaylistsStore();
    return { authStore, userStore, playlistsStore };
  },
  computed: {
    profilePictureOrDefault() {
      const DEFAULT_PICTURE = require("@/assets/no-user.png");
      return this.userStore.profilePicture != ""
        ? this.userStore.profilePicture
        : DEFAULT_PICTURE;
    },
  },
  methods: {
    logout() {
      this.userStore.$reset();
      this.authStore.$reset();
      this.playlistsStore.$reset();
      this.$router.push({ name: "LoginView" });
    },
  },
};
</script>
<style>
#logo {
  min-width: 100px;
  width: 150px;
}

#user-info {
  margin-right: 15px;
}

#user-info > #disconnect {
  display: none;
  position: absolute;
  top: 45px;
}
#user-info:hover > #disconnect {
  display: inherit;
}
.v-toolbar__extension {
  height: fit-content !important;
}
</style>