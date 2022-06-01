<template>
  <div id="playlist" v-if="playlists[playlistId].total > 0">
    <!--Playlist duplication-->
    <v-btn v-if="filteredTracks.length > 1" @click="createNewPlaylist">
      {{ $t("playlist.duplicate") }}
    </v-btn>

    <div id="content" style="display: flex">
      <div id="left-part">
        <!-- Charts -->
        <div id="charts">
          <IndieChart
            v-if="filteredTracks.length > 0"
            :indiePercentage="indiePercentage"
            :image="getImage(indiePercentage)"
          />
          <GenreChart
            v-if="filteredTracks.length > 0"
            :genres="sortedGenres"
            @onGenreSelect="filterTracksByGenre"
          />
        </div>

        <v-combobox
          clearable
          filled
          hide-selected
          v-model="selectedPopularity"
          :filter="filterTracksPopularity"
          :items="popularities"
          label="Popularity"
        ></v-combobox>

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
            :artists="track.artists"
            :genres="track.genres"
            :isIndie="track.isIndie"
            :trackURI="track.uri"
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
  <div id="no-tracks" v-else>
    <h1>{{ $t("playlist.no-tracks") }}</h1>
    <v-btn @click="openPlaylistOnSpotify" id="open-spotify" variant="outlined">
      {{ $t("playlist.open-on-spotify") }}
      <v-img width="25" :src="spotifyLogo" alt="Spotify Logo" />
    </v-btn>
  </div>
</template>

<script>
import DuplicatorPopup from '@/components/playlist_detail/DuplicatorPopup.vue'
import GenreChart from '@/components/playlist_detail/GenreChart.vue'
import IndieChart from '@/components/playlist_detail/IndieChart.vue'
import LoadMoreTracksPopup from '@/components/playlist_detail/LoadMoreTracksPopup.vue'
import TrackCard from '@/components/playlist_detail/TrackCard.vue'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

export default {
  name: 'PlaylistDetail',
  props: {
    playlistId: String
  },
  components: {
    DuplicatorPopup,
    LoadMoreTracksPopup,
    GenreChart,
    IndieChart,
    TrackCard
  },
  setup () {
    const userStore = useUserStore()
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { playlists } = storeToRefs(playlistsStore)
    const { downloadPlaylistTracks } = playlistsStore

    const currentUserUsername = userStore.username

    return {
      playlistsStore,
      playlists,
      downloadPlaylistTracks,
      currentUserUsername
    }
  },
  async mounted () {
    this.playlistsStore.selectedPlaylistId = this.playlistId
    console.log(this.playlists[this.playlistId].total)
    await this.loadFirstTracks()
  },
  beforeUnmount () {
    this.playlistsStore.selectedPlaylistId = null
  },
  data () {
    return {
      trackRequestLimit: 150,

      selectedPopularity: '',
      selectedGenreName: '',
      popularities: ['indie', 'popularity'],
      filteredTracks: [],

      startDuplication: false,
      isHugePlaylist: false
    }
  },
  methods: {
    getGenreCount () {
      // default dict with 0 as default value
      const genreCounter = new Proxy(
        {},
        {
          get: (target, name) => (name in target ? target[name] : 0)
        }
      )
      for (const track of this.playlists[this.playlistId].tracks) {
        for (const genre of track.genres) {
          genreCounter[genre] += 1
        }
      }
      return genreCounter
    },
    async loadFirstTracks () {
      await this.downloadPlaylistTracks(
        this.playlistId,
        this.trackRequestLimit
      )
      this.isHugePlaylist =
        this.playlists[this.playlistId].total > this.trackRequestLimit
      this.resetFilters()
    },
    filterTracksByGenre (selectedGenreName) {
      if (selectedGenreName === '') {
        this.resetFilters()
        return
      }
      this.selectedGenreName = selectedGenreName
      this.filteredTracks = this.playlists[this.playlistId].tracks.filter((t) =>
        Array.from(t.genres).includes(selectedGenreName)
      )
    },
    filterTracksPopularity (item, queryText, itemText) {
      console.log(item, queryText, itemText)
    },
    createNewPlaylist () {
      this.startDuplication = true
    },
    resetFilters () {
      this.selectedGenreName = ''
      this.filteredTracks = this.playlists[this.playlistId].tracks
    },
    openPlaylistOnSpotify () {
      window.location.href = this.playlists[this.playlistId].uri
    }
  },
  computed: {
    // Returns only top genres sorted by most to least popular
    sortedGenres () {
      const genreCounter = this.getGenreCount()
      const genreLabels = Object.keys(genreCounter).map((label) => [
        label,
        genreCounter[label]
      ])

      // DESC sort
      genreLabels.sort((a, b) => {
        return b[1] - a[1]
      })

      // Sampling
      return genreLabels.slice(0, 15)
    },
    // Get the general playlist isIndie % from the mean of all tracks
    indiePercentage () {
      let indieTracks = 0
      for (const track of this.playlists[this.playlistId].tracks) {
        indieTracks += track.isIndie
      }
      return parseInt(
        (indieTracks / this.playlists[this.playlistId].tracks.length) * 100
      )
    },
    getImage () {
      return (indiePercentage) => {
        let image = ''
        if (indiePercentage < 25) image = 'cold'
        else if (indiePercentage < 50) image = 'sunglasses'
        else if (indiePercentage < 75) image = 'hot'
        else image = 'fire'
        return require(`@/assets/${image}.png`)
      }
    },
    spotifyLogo () {
      return require('@/assets/spotify.png')
    }
  }
}
</script>
<style>
#left-part {
  display: flex;
  flex-direction: column;
  border-right: 2px solid;
  border-color: gray;
  margin: 0 5px;
  min-width: 380px !important;
}
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
  min-height: 613px;
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
#no-tracks {
  width: 100%;
  text-align: center;
  margin: auto;
}

#open-spotify {
  background-color: white;
}
#open-spotify .v-btn__content {
  display: flex;
  flex-direction: row;
  align-items: center;
}
#open-spotify .v-btn__content img {
  margin: 0px 3px;
  width: 20px;
}
</style>
