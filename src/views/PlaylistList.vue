<template>
  <div id="full-page">
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
        :image="playlist.image"
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

      for (let playlistObject of response.data.items) {
        this.playlists.push({
          id: playlistObject.id,
          name: playlistObject.name,
          image: playlistObject.images[0].url,
        });
      }
      this.requestOffset += this.requestLimit;
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
#playlists {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: space-evenly;
  align-items: stretch;
}
</style>