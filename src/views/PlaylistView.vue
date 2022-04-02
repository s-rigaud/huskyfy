<template>
  <p>{{ id }}</p>
</template>

<script>
import api from "@/api";

export default {
  name: "PlaylistView",
  props: {
    playlistId: String,
  },
  setup() {},

  mounted() {
    this.requestPlaylistTracks();
    console.log("playlist detail");
  },
  methods: {
    async requestPlaylistTracks() {
      const response = await api.spotify.playlists.getPlaylistTracks(
        this.playlistId,
        this.requestLimit,
        this.requestOffset
      );
      console.log(response.data);
    },
  },
  data() {
    return {};
  },
};
</script>