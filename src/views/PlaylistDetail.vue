<template>
  <!-- Description of all the playlist with all the tracks and filters -->
  <div id="playlist" v-if="playlists[playlistId] && playlists[playlistId].total > 0">
    <div id="content" style="display: flex">
      <div id="left-part">

        <!-- Charts -->
        <div id="charts">
          <IndieChart v-if="filteredTracks.length > 0" :playlistId="playlistId" />
          <GenreChart v-if="filteredTracks.length > 0" :genres="getSortedGenres()" />
        </div>

        <!-- Filters -->
        <div id="filters">
          <h3>Filters</h3>
          <v-select v-model="selectedPopularity" :label="$t('track.filters.popularity')" :items="popularities"
            item-title="name" item-value="value" variant="outlined" density="comfortable" hide-selected></v-select>

          <v-select v-model="selectedGenres" :label="$t('track.filters.genres')" :items="getSortedGenres()"
            item-title="cap_name" item-value="name" variant="outlined" density="comfortable" multiple
            style="text-transform: capitalize">
          </v-select>

          <v-select v-model="selectedArtists" :label="$t('track.filters.artists')" :items="getSortedArtists()"
            item-title="name" item-value="name" variant="outlined" density="comfortable" multiple
            style="text-transform: capitalize">
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index < 2">
                <v-avatar>
                  <v-img width="20" :src="item.images[0].url" alt="Spotify artist cover"></v-img>
                </v-avatar>
                <span>{{ item.name }}</span>
              </v-chip>
              <span v-if="index >= 2" class="text-grey text-caption align-self-center">
                (+{{ selectedArtists.length - 2 }} others)
              </span>
            </template>
          </v-select>

          <v-switch v-model="isExclusiveGenres" :label="$t('track.exclusive-filter')"></v-switch>

          <v-btn @click="resetFilters" v-if="selectedGenres.length !== 0 || selectedPopularity != 'No filter'">
            {{ $t("playlist.reset-filters") }}
          </v-btn>
        </div>
      </div>

      <!-- Track list -->
      <div id="right-part" style="width: 100%">
        <h2>{{ generalTitle }}</h2>
        <v-card-subtitle>{{ filteredTracks.length }} {{ $t('track.name') }}</v-card-subtitle>
        <div id="tracks">
          <TrackCard v-for="(track, index) in filteredTracks" :key="track.id" :id="track.id" :name="track.name"
            :image="track.album.images[0].url" :artists="track.artists" :genres="track.genres" :isIndie="track.isIndie"
            :trackURI="track.uri" :trackIndex="index" />
        </div>
        <v-progress-circular v-if="filteredTracks.length < 1" :size="70" :width="7" color="#A33327" indeterminate>
        </v-progress-circular>
      </div>
    </div>

    <!-- Load more tracks to lazy-load all of them -->
    <LoadMoreTracksPopup v-if="isHugePlaylist" :playlist="playlists[playlistId]" :trackRequestLimit="trackRequestLimit"
      @allTracksLoaded="resetFilters" />
  </div>

  <!-- No tracks in the playlist -->
  <div id="no-tracks" v-else>
    <h1>{{ $t("playlist.no-tracks") }}</h1>
    <v-btn @click="openPlaylistOnSpotify" id="open-spotify" variant="outlined" rounded="pill" size="x-large">
      {{ $t("playlist.open-on-spotify") }}
      <v-img width="25" :src="spotifyLogo" alt="Spotify Logo" />
    </v-btn>
  </div>
</template>

<script>
import GenreChart from '@/components/playlist_detail/GenreChart.vue'
import IndieChart from '@/components/playlist_detail/IndieChart.vue'
import LoadMoreTracksPopup from '@/components/playlist_detail/LoadMoreTracksPopup.vue'
import TrackCard from '@/components/playlist_detail/TrackCard.vue'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import TitleMixin from '@/mixins/TitleMixin.js'

export default {
  name: 'PlaylistDetail',
  mixins: [TitleMixin],
  props: {
    playlistId: {
      type: String,
      default: ''
    }
  },
  components: {
    LoadMoreTracksPopup,
    GenreChart,
    IndieChart,
    TrackCard
  },
  setup() {
    const userStore = useUserStore()
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { filteredTracks, selectedGenres, playlists } = storeToRefs(playlistsStore)
    const { downloadPlaylistTracks } = playlistsStore

    const currentUserUsername = userStore.username

    return {
      playlistsStore,
      playlists,
      downloadPlaylistTracks,
      currentUserUsername,
      filteredTracks,
      selectedGenres
    }
  },
  created() {
    this.title = `Horus | ${this.playlists[this.playlistId].name}`
  },
  async mounted() {
    this.playlistsStore.selectedPlaylistId = this.playlistId
    // this.playlistsStore.$subscribe(this.watchForGenreUpdate)

    await this.loadFirstTracks()
    this.filteredTracks = this.playlists[this.playlistId].tracks
  },
  data() {
    return {
      trackRequestLimit: 150,

      isHugePlaylist: false,

      popularities: [
        { name: this.$t('track.filters.indie'), value: 'Indie' },
        { name: this.$t('track.filters.popular'), value: 'Popular' },
        { name: this.$t('track.filters.no-filter'), value: 'No filter' }
      ],
      selectedPopularity: 'No filter',

      selectedArtists: [],

      isExclusiveGenres: false
    }
  },
  methods: {
    getGenreCount() {
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
    async loadFirstTracks() {
      await this.downloadPlaylistTracks(
        this.playlistId,
        this.trackRequestLimit
      )
      this.isHugePlaylist =
        this.playlists[this.playlistId].total > this.trackRequestLimit
      this.resetFilters()
    },
    filterTracksByGenres() {
      const genres = this.selectedGenres
      if (genres.length === 0) return this.resetFilters()

      const currentPlaylistTracks = this.playlists[this.playlistId].tracks
      if (this.isExclusiveGenres) {
        this.filteredTracks = currentPlaylistTracks.filter(
          (t) => genres.every((genre) => t.genres.includes(genre))
        )
      } else {
        this.filteredTracks = currentPlaylistTracks.filter(
          (t) => genres.some((genre) => t.genres.includes(genre))
        )
      }
    },
    filterTracksByPopularity(popularity) {
      if (popularity === 'No filter') return this.resetFilters()

      const isIndieSelected = popularity === 'Indie'
      this.filteredTracks = this.playlists[this.playlistId].tracks.filter(
        (t) => t.isIndie === isIndieSelected
      )
    },
    filterTracksByArtists() {
      const artists = this.selectedArtists
      if (artists.length === 0) return this.resetFilters()

      const currentPlaylistTracks = this.playlists[this.playlistId].tracks
      if (this.isExclusiveGenres) {
        this.filteredTracks = currentPlaylistTracks.filter(
          (t) => artists.every((artist) => t.artists.map(a => a.name).includes(artist))
        )
      } else {
        this.filteredTracks = currentPlaylistTracks.filter(
          (t) => artists.some((artist) => t.artists.map(a => a.name).includes(artist))
        )
      }
    },
    resetFilters() {
      this.selectedGenres = []
      this.selectedPopularity = 'No filter'
      this.filteredTracks = this.playlists[this.playlistId].tracks
    },
    openPlaylistOnSpotify() {
      window.location.href = this.playlists[this.playlistId].uri
    },
    // Returns only top genres sorted by most to least popular
    getSortedGenres() {
      const genreCounter = this.getGenreCount()
      const genreMapping = Object.keys(genreCounter).map((label) => [
        label,
        genreCounter[label]
      ])

      // DESC sort
      genreMapping.sort((a, b) => {
        return b[1] - a[1]
      })

      // Sampling
      return genreMapping.slice(0, 15).map((genre) => ({
        name: genre[0],
        value: genre[1],
        cap_name: this.capitalize(genre[0])
      }))
    },
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    getSortedArtists() {
      const allArtists = new Set()
      for (const track of this.playlists[this.playlistId].tracks) {
        track.artists.map(a => allArtists.add(a))
      }
      console.log(Array.from(allArtists).sort((a1, a2) => a1.name.localeCompare(a2.name)))
      return Array.from(allArtists).sort((a1, a2) => a1.name.localeCompare(a2.name))
    }
  },
  computed: {
    spotifyLogo() {
      return require('@/assets/spotify.png')
    },
    generalTitle() {
      const separator = (this.isExclusiveGenres) ? ' and ' : ' or '
      return this.selectedGenres.map(g => this.capitalize(g)).join(separator) || this.$t('track.all-tracks')
    }
  },
  watch: {
    isExclusiveGenres() {
      this.filterTracksByGenres()
    },
    selectedPopularity(newSelectedPopularity) {
      this.filterTracksByPopularity(newSelectedPopularity)
    },
    selectedArtists(newValue, oldValue) {
      if (oldValue.length !== 0 || newValue.length !== 0) {
        this.filterTracksByArtists()
      }
    },
    selectedGenres(newValue, oldValue) {
      if (oldValue.length !== 0 || newValue.length !== 0) {
        this.filterTracksByGenres()
      }
    }
  }
}
</script>
<style>
#left-part {
  display: flex;
  flex-direction: column;
  border-right: 2px solid;
  border-color: #A33327 !important;
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
  background-color: #A33327 !important;
  color: #dff9fb !important;
  letter-spacing: 0px;
  padding: 20px !important;
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
