<template>
  <PlaylistCard
    v-for="playlist in this.playlists"
    :key="playlist.id"
    :id="playlist.id"
    :name="playlist.name"
  />
  <button
    @click="requestPlaylists"
    v-if="this.playlists.length == this.requestOffset"
  >
    Load more playlists
  </button>
</template>

<script>
import api from "@/api";
import PlaylistCard from "@/components/PlaylistCard.vue";

export default {
  name: "ExploreView",
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
      console.log(response);
      for (let playlistObject of response.data.items) {
        this.playlists.push({
          id: playlistObject.id,
          name: playlistObject.name,
        });
      }
      this.requestOffset += this.requestLimit;
    },
  },
  data() {
    return {
      playlists: [],
      requestLimit: 5,
      requestOffset: 0,
    };
  },
};
</script>