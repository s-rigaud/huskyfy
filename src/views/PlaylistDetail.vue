<template>
  <div
    v-if="playlist"
    style="display: flex; flex-direction: column; flex-wrap: wrap; width: 100%"
  >
    <!-- Basic card info to improve-->
    <v-card flat>
      <v-card-title style="padding: 0"> {{ playlist.name }} </v-card-title>
      <v-card-title style="padding: 0">
        {{ playlist.description }}
      </v-card-title>
      <v-card-subtitle style="padding: 0">
        <p>Created by {{ playlist.owner["display_name"] }}</p>
        <p v-if="playlist.public">{{ $t("playlist.public") }}</p>
        <p v-if="playlist.collaborative">{{ $t("playlist.collaborative") }}</p>
      </v-card-subtitle>
    </v-card>

    <!-- Charts -->
    <div id="charts" v-if="filteredTracks.length > 0">
      <GenreChart :genres="sortedGenres" @selectedGenre="filterTracksByGenre" />
      <IndieChart :indiePercentage="indiePercentage" />
    </div>
    <v-btn @click="resetFilter" v-if="selectedGenreName != ''">
      {{ $t("playlist.reset-filters") }}
    </v-btn>

    <!--Playlist duplication-->
    <v-btn @click="createNewPlaylist">{{ $t("playlist.duplicate") }}</v-btn>
    <div id="loading-create-new-playlist" v-if="loadingPercentage > 0">
      <p>{{ loadingPercentage }}% - {{ loadingText }}</p>
      <v-progress-circular
        :model-value="loadingPercentage"
        color="deep-orange lighten-2"
      >
      </v-progress-circular>
    </div>

    <v-btn @click="unfollowPlaylist" color="error">
      {{ $t("playlist.unfollow") }}
    </v-btn>

    <div
      id="update-playlist-privacy"
      v-if="userOwnsPlaylist && !playlist.collaborative"
    >
      <v-btn @click="setPlaylistPrivate" v-if="playlist.public">
        {{ $t("playlist.set-private") }}
      </v-btn>
      <v-btn @click="setPlaylistPublic" v-else>
        {{ $t("playlist.set-public") }}
      </v-btn>
    </div>

    <v-btn
      id="get-to-new-playlist"
      v-if="newPlaylistId != ''"
      @click="displayNewPlaylistDetails"
    >
      {{ $t("playlist.next") }}
    </v-btn>

    <v-btn @click="loadTracks" v-if="playlist.tracks.length < playlist.total">
      {{ $t("playlist.load-more-tracks") }}
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
  </div>
</template>

<script>
import GenreChart from "@/components/GenreChart.vue";
import IndieChart from "@/components/IndieChart.vue";
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
  mounted() {
    this.loadTracks();
    this.playlist = this.playlists[this.playlistId];
  },
  data() {
    return {
      playlist: null,

      selectedGenreName: "",
      filteredTracks: [],

      loadingPercentage: 0,
      loadingText: "",

      newPlaylistId: "",
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
      for (const track of this.playlist.tracks) {
        for (const genre of track.genres) {
          genreCounter[genre] += 1;
        }
      }
      return genreCounter;
    },
    async loadTracks() {
      this.filteredTracks = await this.downloadPlaylistTracks(this.playlistId);
    },
    displayNewPlaylistDetails() {
      this.$router.push({
        name: "Explore playlist",
        params: { playlistId: this.newPlaylistId },
      });
    },
    async unfollowPlaylist() {
      await this.playlistsStore.unfollowPlaylist(this.playlistId);
      this.filteredTracks = [];
      this.$router.push({ name: "Explore" });
    },
    filterTracksByGenre(selectedGenreName) {
      this.selectedGenreName = selectedGenreName;
      this.filteredTracks = this.playlist.tracks.filter((t) =>
        Array.from(t.genres).includes(selectedGenreName)
      );
    },
    resetFilter() {
      this.selectedGenreName = "";
      this.filteredTracks = this.playlist.tracks;
    },
    getPlaylistNewPlaylistAttributes(playlist) {
      let newPlaylistName = playlist.name;
      let newPlaylistDescription = "";
      if (this.selectedGenreName !== "") {
        newPlaylistName += ` • ${this.selectedGenreName}`;
        newPlaylistDescription += `${playlist.name} • ${this.selectedGenreName}`;
      } else {
        newPlaylistDescription += `Copy of ${playlist.name}`;
      }
      newPlaylistDescription += ` • created by Horus`;

      return {
        name: newPlaylistName,
        description: newPlaylistDescription,
        public: playlist.public && !playlist.collaborative,
        collaborative: playlist.collaborative,
      };
    },
    async createNewPlaylist() {
      this.loadingText = "Creating new playlist";
      this.loadingPercentage = 1;
      const newPlaylist = this.getPlaylistNewPlaylistAttributes(this.playlist);

      let response = await this.playlistsStore.createPlaylist(
        newPlaylist.name,
        newPlaylist.public,
        newPlaylist.description,
        newPlaylist.collaborative
      );
      const newPlaylistId = response.data.id;

      this.loadingText = "Updating playlist cover";
      this.loadingPercentage = 33;
      /*await this.playlistsStore.updatePlaylistCover(
        response.data.id,
        "https://m.media-amazon.com/images/I/61iw4s61r1S._AC_SX425_.jpg"
        //playlist.images[0].url
      );*/

      this.loadingText = "Adding all selected tracks";
      this.loadingPercentage = 66;
      await this.playlistsStore.addTracksToPlaylist(
        newPlaylistId,
        this.filteredTracks.map((t) => t.uri)
      );

      this.loadingText = "Done";
      this.loadingPercentage = 100;
      this.newPlaylistId = newPlaylistId;
    },
    async setPlaylistPublic() {
      console.log(this.playlist);
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
      for (const track of this.playlist.tracks) {
        indieTracks += track.isIndie;
      }
      return parseInt((indieTracks / this.playlist.tracks.length) * 100);
    },
    userOwnsPlaylist() {
      return this.currentUserUsername == this.playlist.owner["display_name"];
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
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: stretch;
}
#loading-create-new-playlist {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>