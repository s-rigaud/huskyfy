<template>
  <div v-if="playlists[playlistId]" id="playlist">
    <!-- Basic card info to improve-->
    <v-card flat>
      <v-card-title style="padding: 0">
        {{ playlists[playlistId].name }}
      </v-card-title>
      <v-card-title style="padding: 0">
        {{ playlists[playlistId].description }}
      </v-card-title>
      <v-card-subtitle style="padding: 0">
        <p>Created by {{ playlists[playlistId].owner["display_name"] }}</p>
        <p v-if="playlists[playlistId].public">{{ $t("playlist.public") }}</p>
        <p v-if="playlists[playlistId].collaborative">
          {{ $t("playlist.collaborative") }}
        </p>
      </v-card-subtitle>
      <v-btn @click="unfollowPlaylist" color="error">
        {{ $t("playlist.unfollow") }}
      </v-btn>

      <div
        id="update-playlist-privacy"
        v-if="userOwnsPlaylist && !playlists[playlistId].collaborative"
      >
        <v-btn @click="setPlaylistPrivate" v-if="playlists[playlistId].public">
          {{ $t("playlist.set-private") }}
        </v-btn>
        <v-btn @click="setPlaylistPublic" v-else>
          {{ $t("playlist.set-public") }}
        </v-btn>
      </div>

      <!--Playlist duplication-->
      <v-btn v-if="filteredTracks.length > 1" @click="createNewPlaylist">
        {{ $t("playlist.duplicate") }}
      </v-btn>
    </v-card>

    <div id="content" style="display: flex">
      <div
        id="left-part"
        style="
          display: flex;
          flex-direction: column;
          border-right: 2px solid;
          border-color: gray;
          margin: 0 5px;
        "
      >
        <!-- Charts -->
        <div id="charts" v-if="filteredTracks.length > 0">
          <IndieChart
            :indiePercentage="indiePercentage"
            :image="getImage(indiePercentage)"
          />
          <GenreChart
            :genres="sortedGenres"
            @onGenreSelect="filterTracksByGenre"
          />
        </div>
        <v-btn @click="resetFilters" v-if="selectedGenreName != ''">
          {{ $t("playlist.reset-filters") }}
        </v-btn>
      </div>

      <div id="right-part" style="width: 100%">
        <h2>Placeholder title - {{ filteredTracks.length }}</h2>
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
      </div>
    </div>

    <DuplicatorPopup
      v-if="startDuplication"
      :playlist="playlists[playlistId]"
      :selectedGenreName="selectedGenreName"
      :filteredTracks="filteredTracks"
    />
    <LoadMoreTracksPopup
      v-if="isHugePlaylist"
      :playlist="playlists[playlistId]"
      :trackRequestLimit="trackRequestLimit"
      @allTracksLoaded="resetFilters"
    />
  </div>
</template>

<script>
import DuplicatorPopup from "@/components/DuplicatorPopup.vue";
import GenreChart from "@/components/GenreChart.vue";
import IndieChart from "@/components/IndieChart.vue";
import LoadMoreTracksPopup from "@/components/LoadMoreTracksPopup.vue";
import TrackCard from "@/components/TrackCard.vue";
import { usePlaylistsStore } from "@/stores/playlists";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

export default {
  name: "PlaylistDetail",
  props: {
    playlistId: String,
  },
  components: {
    DuplicatorPopup,
    LoadMoreTracksPopup,
    GenreChart,
    IndieChart,
    TrackCard,
  },
  setup() {
    const userStore = useUserStore();
    const playlistsStore = usePlaylistsStore();

    // Shorthand
    const { playlists } = storeToRefs(playlistsStore);
    const { downloadPlaylistTracks } = playlistsStore;

    const currentUserUsername = userStore.username;

    return {
      playlistsStore,
      playlists,
      downloadPlaylistTracks,
      currentUserUsername,
    };
  },
  async mounted() {
    await this.loadFirstTracks();
  },
  data() {
    return {
      trackRequestLimit: 150,

      selectedGenreName: "",
      filteredTracks: [],

      startDuplication: false,
      isHugePlaylist: false,
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
    async loadFirstTracks() {
      await this.downloadPlaylistTracks(
        this.playlistId,
        this.trackRequestLimit
      );
      this.isHugePlaylist =
        this.playlists[this.playlistId].total > this.trackRequestLimit;
      this.resetFilters();
    },
    async unfollowPlaylist() {
      await this.playlistsStore.unfollowPlaylist(this.playlistId);
      this.filteredTracks = [];
      this.$router.push({ name: "Explore" });
    },
    filterTracksByGenre(selectedGenreName) {
      if (selectedGenreName == "") {
        this.resetFilters();
        return;
      }
      this.selectedGenreName = selectedGenreName;
      this.filteredTracks = this.playlists[this.playlistId].tracks.filter((t) =>
        Array.from(t.genres).includes(selectedGenreName)
      );
    },
    createNewPlaylist() {
      this.startDuplication = true;
    },
    resetFilters() {
      this.selectedGenreName = "";
      this.filteredTracks = this.playlists[this.playlistId].tracks;
    },
    async setPlaylistPublic() {
      await this.playlistsStore.updatePlaylistPrivacy(this.playlistId, true);
    },
    async setPlaylistPrivate() {
      await this.playlistsStore.updatePlaylistPrivacy(this.playlistId, false);
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
      return genreLabels.slice(0, 15);
    },
    // Get the general playlist isIndie % from the mean of all tracks
    indiePercentage() {
      let indieTracks = 0;
      for (const track of this.playlists[this.playlistId].tracks) {
        indieTracks += track.isIndie;
      }
      return parseInt(
        (indieTracks / this.playlists[this.playlistId].tracks.length) * 100
      );
    },
    userOwnsPlaylist() {
      return (
        this.currentUserUsername ==
        this.playlists[this.playlistId].owner["display_name"]
      );
    },
    getImage() {
      return (indiePercentage) => {
        let image = "";
        if (indiePercentage < 25) image = "cold";
        else if (indiePercentage < 50) image = "sunglasses";
        else if (indiePercentage < 75) image = "hot";
        else image = "fire";
        return require(`@/assets/${image}.png`);
      };
    },
  },
};
</script>
<style scoped>
#playlist {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100%;
}
#charts {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
}
#tracks {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: stretch;
  align-content: center;
}
</style>