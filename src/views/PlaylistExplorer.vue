<template>
  <div id="full-page">
    <h1>{{ $t("playlist.header") }}</h1>

    <div id="playlists">
      <PlaylistCard
        v-for="playlist in playlistsStore.playlists"
        :key="playlist.id"
        :id="playlist.id"
        :name="formatName(playlist)"
        :image="getCoverOrDefaultCover(playlist)"
        :owner="usernameToDisplay(playlist.owner['display_name'])"
        :public="playlist.public"
        :collaborative="playlist.collaborative"
      />
    </div>

    <v-btn
      @click="requestPlaylists"
      v-if="playlistsStore.playlists.length < playlistTotal"
    >
      {{ $t("playlist.load-more-playlists") }}
    </v-btn>
  </div>
</template>

<script>
import PlaylistCard from "@/components/PlaylistCard.vue";
import { usePlaylistsStore } from "@/stores/playlists";
import { useUserStore } from "@/stores/user";

export default {
  name: "PlaylistExplorer",
  components: { PlaylistCard },
  setup() {
    const userStore = useUserStore();
    const playlistsStore = usePlaylistsStore();
    const currentUserUsername = userStore.username;
    return { currentUserUsername, playlistsStore };
  },
  computed: {
    usernameToDisplay() {
      return (ownerUsername) => {
        const traducedMyself = this.$t("me");
        return this.currentUserUsername == ownerUsername
          ? traducedMyself
          : ownerUsername;
      };
    },
    getCoverOrDefaultCover() {
      return (playlist) => {
        return playlist.images.length > 0
          ? playlist.images[0].url
          : this.DEFAULT_PLAYLIST_COVER;
      };
    },
    formatName() {
      return (playlist) => {
        return playlist.id == "liked-song"
          ? this.$t("playlist.your-music.name")
          : playlist.name;
      };
    },
  },
  async mounted() {
    const response = await this.playlistsStore.getUserPlaylists(
      this.currentUserUsername,
      this.offset
    );
    this.playlistTotal = response.total;
    this.offset = response.offset;
  },
  data() {
    return {
      playlistTotal: 50,
      offset: 0,
      DEFAULT_PLAYLIST_COVER: require("../assets/default_cover.jpg"),
    };
  },
};
</script>

<style scoped>
#full-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#playlists {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: space-evenly;
  align-items: stretch;
}
</style>