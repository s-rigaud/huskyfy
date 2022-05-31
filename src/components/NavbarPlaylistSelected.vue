<template>
  <div v-if="playlistsStore.selectedPlaylistId != null" id="header-blocks">
    <div style="display: flex; flex-direction: row">
      <v-img
        v-bind:src="
          playlistsStore.playlists[playlistsStore.selectedPlaylistId].images[0]
            .url
        "
        id="playlist-image"
        lazy-src="https://picsum.photos/id/11/90/90"
        cover
      ></v-img>
      <div>
        <h3>
          {{ playlistsStore.playlists[playlistsStore.selectedPlaylistId].name }}
        </h3>
        <p>
          {{
            playlistsStore.playlists[playlistsStore.selectedPlaylistId]
              .description
          }}
        </p>
        <p>{{ $t("playlist.created-by") }} {{ usernameToDisplay }}</p>
      </div>
    </div>
    <div>
      <p
        v-if="
          playlistsStore.playlists[playlistsStore.selectedPlaylistId].public
        "
      >
        {{ $t("playlist.public") }}
      </p>
      <p
        v-if="
          playlistsStore.playlists[playlistsStore.selectedPlaylistId]
            .collaborative
        "
      >
        {{ $t("playlist.collaborative") }}
      </p>
      <p v-else>{{ $t("playlist.private") }}</p>
    </div>

    <div style="display: flex">
      <div
        id="update-playlist-privacy"
        v-if="
          userOwnsPlaylist &&
          !playlistsStore.playlists[playlistsStore.selectedPlaylistId]
            .collaborative
        "
      >
        <v-btn
          @click="setPlaylistPrivate"
          v-if="
            playlistsStore.playlists[playlistsStore.selectedPlaylistId].public
          "
          variant="outlined"
        >
          {{ $t("playlist.set-private") }}
        </v-btn>
        <v-btn @click="setPlaylistPublic" variant="outlined" v-else>
          {{ $t("playlist.set-public") }}
        </v-btn>
      </div>
      <v-btn @click="openPlaylistOnSpotify" id="open-spotify-playlist-button" variant="outlined">
        {{ $t("playlist.open-on-spotify") }}
        <v-img width="25" :src="spotifyLogo" alt="Spotify Logo" />
      </v-btn>

      <v-btn @click="unfollowPlaylist" color="error" variant="outlined">
        {{ $t("playlist.unfollow") }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import { usePlaylistsStore } from "@/stores/playlists";
import { useUserStore } from "@/stores/user";

export default {
  name: "NavbarPlaylistSelected",
  setup() {
    const userStore = useUserStore();
    const playlistsStore = usePlaylistsStore();

    const currentUserUsername = userStore.username;

    return { currentUserUsername, playlistsStore };
  },
  computed: {
    usernameToDisplay() {
      return this.currentUserUsername ==
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId]
          .owner["display_name"]
        ? this.$t("me")
        : this.currentUserUsername;
    },
    userOwnsPlaylist() {
      return (
        this.currentUserUsername ==
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId]
          .owner["display_name"]
      );
    },
    spotifyLogo() {
      return require("@/assets/spotify.png");
    },
  },
  methods: {
    openPlaylistOnSpotify() {
      window.location.href =
        this.playlistsStore.playlists[
          this.playlistsStore.selectedPlaylistId
        ].uri;
    },
    async unfollowPlaylist() {
      const toDeletePlaylistId = this.playlistsStore.selectedPlaylistId;
      this.playlistsStore.selectedPlaylistId = null;
      await this.playlistsStore.unfollowPlaylist(toDeletePlaylistId);
      this.$router.push({ name: "Explore" });
    },
    async setPlaylistPublic() {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistsStore.selectedPlaylistId,
        true
      );
    },
    async setPlaylistPrivate() {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistsStore.selectedPlaylistId,
        false
      );
    },
  },
};
</script>
<style>
#header-blocks {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 2px #ccc solid;
  margin: 5px;
  width: 100%;
}
#playlist-image {
  width: 70px !important;
  max-width: 70px !important;
  height: 70px !important;
  max-height: 70px !important;
  margin: 1px 10px 1px 1px;
}
#open-spotify-playlist-button .v-btn__content {
  display: flex;
  flex-direction: row;
  align-items: center;
}
#open-spotify-playlist-button .v-btn__content img {
  margin: 0px 3px;
  width: 20px;
}
</style>