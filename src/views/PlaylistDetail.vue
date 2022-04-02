<template>
  <TrackCard
    v-for="track of tracks"
    :key="track.id"
    :id="track.id"
    :name="track.name"
    :image="track.image"
  />
  <v-btn @click="requestPlaylistTracks" v-if="tracks.length < tracksTotal">
    Load more Tracks
  </v-btn>
</template>

<script>
import api from "@/api";
import TrackCard from "@/components/TrackCard.vue";

export default {
  name: "PlaylistDetail",
  props: {
    playlistId: String,
  },
  components: {
    TrackCard,
  },
  mounted() {
    this.requestPlaylistTracks();
  },
  methods: {
    async requestPlaylistTracks() {
      const response = await api.spotify.playlists.getPlaylistTracks(
        this.playlistId,
        this.requestLimit,
        this.requestOffset
      );
      this.tracksTotal = response.data.total;
      for (let res of response.data.items) {
        this.tracks.push({
          id: res.track.id,
          name: res.track.name,
          image: res.track.album.images[0].url,
        });
      }
      this.requestOffset += this.requestLimit;
    },
  },
  data() {
    return {
      tracks: [],
      requestLimit: 50,
      requestOffset: 0,
      tracksTotal: 5,
    };
  },
};
</script>