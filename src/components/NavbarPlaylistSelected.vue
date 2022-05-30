<template>
  <div v-if="playlistsStore.selectedPlaylistId != null" id="header-blocks">
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
      <p>
        {{ playlistsStore.playlists[playlistsStore.selectedPlaylistId].name }}
      </p>
      <p>
        {{
          playlistsStore.playlists[playlistsStore.selectedPlaylistId]
            .description
        }}
      </p>
      <p>
        Created by
        {{
          playlistsStore.playlists[playlistsStore.selectedPlaylistId].owner[
            "display_name"
          ]
        }}
      </p>
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
    </div>

    <div>
      <v-btn @click="unfollowPlaylist" color="error">
        {{ $t("playlist.unfollow") }}
      </v-btn>

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
        >
          {{ $t("playlist.set-private") }}
        </v-btn>
        <v-btn @click="setPlaylistPublic" v-else>
          {{ $t("playlist.set-public") }}
        </v-btn>
      </div>
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
    userOwnsPlaylist() {
      return (
        this.currentUserUsername ==
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId]
          .owner["display_name"]
      );
    },
  },
  methods: {
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
<style scoped>
#header-blocks {
  display: flex;
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
</style>