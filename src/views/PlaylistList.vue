<template>
  <div id="full-page">
    <h1>
      Start browsing you playlist to gather some useful data on them, split them
      by genre
    </h1>
    <div id="playlists">
      <PlaylistCard
        key="liked-song"
        id="liked-song"
        name="Liked song"
        image="https://community.spotify.com/t5/image/serverpage/image-id/104727iC92B541DB372FBC7?v=v2"
      />

      <PlaylistCard
        v-for="playlist in playlists"
        :key="playlist.id"
        :id="playlist.id"
        :name="playlist.name"
        :image="getCoverOrDefaultCover(playlist)"
        :public="playlist.public"
        :description="playlist.description"
      />
      <v-btn @click="requestPlaylists" v-if="playlists.length < playlistTotal">
        Load more playlists
      </v-btn>
    </div>
  </div>
</template>

<script>
import api from "@/api";
import PlaylistCard from "@/components/PlaylistCard.vue";

export default {
  name: "PlaylistList",
  components: { PlaylistCard },
  setup() {},
  mounted() {
    this.requestPlaylists();
  },
  methods: {
    async requestPlaylists() {
      const response = await api.spotify.playlists.getUserPlaylists(
        this.requestLimit,
        this.requestOffset
      );
      this.playlistTotal = response.data.total;
      this.playlists.push(...response.data.items);
      this.requestOffset += this.requestLimit;
    },
    getCoverOrDefaultCover(playlist) {
      return playlist.images.length > 0
        ? playlist.images[0].url
        : "https://yt3.ggpht.com/DTKih1mY7NIIGzKGOAbLIW11t7AevaNgFEZkF-amASGz6KEhAEWECroV-BOaIz9MezmN0145DA=s900-c-k-c0x00ffffff-no-rj";
    },
  },
  data() {
    return {
      playlists: [],
      requestLimit: 50,
      requestOffset: 0,
      playlistTotal: 50,
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