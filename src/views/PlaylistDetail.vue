<template>
  <div id="charts" v-if="filteredTracks.length > 0">
    <GenreChart :genres="sortedGenres" @selectedGenre="filterTracksByGenre" />
    <IndieChart :indiePercentage="indiePercentage" />
  </div>

  <v-btn @click="createNewPlaylist">Create fake playlist</v-btn>
  <v-btn
    @click="loadTracks"
    v-if="
      playlists[playlistId] && playlists[playlistId].tracks.length < tracksTotal
    "
  >
    Load more Tracks
  </v-btn>
  <div id="tracks" v-if="filteredTracks.length > 0">
    <TrackCard
      v-for="track of filteredTracks"
      :key="track.id"
      :id="track.id"
      :name="track.name"
      :image="track.image"
      :artists="track.artists.map((artist) => artist.name)"
      :genres="track.genres"
      :isIndie="track.isIndie"
    />
  </div>
</template>

<script>
import api from "@/api";
import GenreChart from "@/components/GenreChart.vue";
import IndieChart from "@/components/IndieChart.vue";
import TrackCard from "@/components/TrackCard.vue";
import { usePlaylistsStore } from "@/stores/playlists";
import { storeToRefs } from "pinia";

export default {
  name: "PlaylistDetail",
  props: {
    playlistId: String,
  },
  components: {
    GenreChart,
    IndieChart,
    TrackCard,
  },
  setup() {
    const playlistsStore = usePlaylistsStore();
    const { playlists } = storeToRefs(playlistsStore);
    const { downloadPlaylistTracks } = playlistsStore;

    return { playlists, downloadPlaylistTracks };
  },
  mounted() {
    this.loadTracks();
  },
  data() {
    return {
      filteredTracks: [],
    };
  },
  methods: {
    getGenreCount() {
      // default dict with 0 as default value
      const genreCounter = new Proxy(
        {},
        {
          get: (target, name) => (name in target ? target[name] : 0),
        }
      );
      for (const track of this.playlists[this.playlistId].tracks) {
        for (const genre of track.genres) {
          genreCounter[genre] += 1;
        }
      }
      return genreCounter;
    },
    async loadTracks() {
      this.filteredTracks = await this.downloadPlaylistTracks(this.playlistId);
    },
    filterTracksByGenre(selectedGenreName) {
      this.filteredTracks = this.playlists[this.playlistId].tracks.filter((t) =>
        Array.from(t.genres).includes(selectedGenreName)
      );
    },
    async createNewPlaylist() {
      const playlist = this.playlists[this.playlistId];
      let response = await api.spotify.playlists.createPlaylist(
        playlist.name,
        playlist.public,
        playlist.description,
        playlist.collaborative
      );
      await api.spotify.playlists.updatePlaylistCover(
        response.data.id,
        playlist.images[0].url
      );
    },
  },
  computed: {
    // Returns only top genres sorted by most to least popular
    sortedGenres() {
      const genreCounter = this.getGenreCount();
      let genreLabels = Object.keys(genreCounter).map((label) => [
        label,
        genreCounter[label],
      ]);

      // DESC sort
      genreLabels.sort((a, b) => {
        return b[1] - a[1];
      });

      // Sampling
      const MINIMUM_LIMIT_GENRE = 0;
      return genreLabels.filter((genre) => genre[1] > MINIMUM_LIMIT_GENRE);
    },
    indiePercentage() {
      let indieTracks = 0;
      const playlist = this.playlists[this.playlistId];
      for (const track of playlist.tracks) {
        indieTracks += track.isIndie;
      }
      return parseInt((indieTracks / playlist.tracks.length) * 100);
    },
    tracksTotal() {
      return this.playlists[this.playlistId].tracksTotal;
    },
  },
};
</script>
<style scoped>
#charts {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}
#tracks {
  width: 100%;
}
</style>