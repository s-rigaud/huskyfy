<template>
  <div v-if="playlistsStore.selectedPlaylistId != null" id="header-blocks">
    <div id="playlist-info">
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
          {{ getEmojiFromVisibility }}
        </h3>
        <p>
          {{
            playlistsStore.playlists[playlistsStore.selectedPlaylistId]
              .description
          }}
        </p>
        <p style="opacity: 0.5">
          {{ $t("playlist.created-by") }} {{ usernameToDisplay }}
        </p>
      </div>
    </div>

    <div
      style="
        position: fixed;
        right: 0;
        bottom: 0;
        margin-top: 5px;
        padding: 3px;
        display: flex;
      "
    >
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
        <v-btn v-else @click="setPlaylistPublic" variant="outlined">
          {{ $t("playlist.set-public") }}
        </v-btn>
      </div>
      <v-btn @click="exportPreview" variant="outlined">
        {{ $t("playlist.export-preview") }}
      </v-btn>
      <v-btn
        @click="openPlaylistOnSpotify"
        id="open-spotify-playlist-button"
        variant="outlined"
      >
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
      const playlistCreator =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId]
          .owner["display_name"];

      return this.currentUserUsername == playlistCreator
        ? this.$t("me")
        : playlistCreator;
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
    getEmojiFromVisibility() {
      const playlist =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId];

      if (playlist.collaborative) return "🤝";
      if (playlist.public) return "📣";
      return "🔒";
    },
  },
  methods: {
    openPlaylistOnSpotify() {
      window.location.href =
        this.playlistsStore.playlists[
          this.playlistsStore.selectedPlaylistId
        ].uri;
    },
    exportPreview() {
      alert("Preview no available right now");
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
#playlist-info {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
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