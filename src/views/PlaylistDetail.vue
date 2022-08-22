<template>
  <!-- Description of all the playlist with all the tracks and filters -->
  <div id="playlist" v-if="playlists[playlistId] && playlists[playlistId].total > 0">
    <div id="content" style="display: flex">
      <aside id="left-part">

        <v-tabs v-model="selectedTab" background-color="var(--primary-color)" fixed-tabs end>
          <v-tab :value="0">Artists</v-tab>
          <v-tab :value="1">Genres</v-tab>
        </v-tabs>
        <v-window v-model="selectedTab" v-if="filteredTracks.length > 0" id="charts">
          <v-window-item>
            <IndieChart :playlistId="playlistId" />
          </v-window-item>
          <v-window-item>
            <GenreChart :genres="getSortedGenres()" />
          </v-window-item>
        </v-window>

        <!-- Filters -->
        <div id="filters">
          <h3 class="rainbow-text">{{ $t('track.filters.title') }}</h3>
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
                  <v-img rel="preconnect" width="20" :src="getArtistCover(item)" alt="Spotify artist cover"></v-img>
                </v-avatar>
                <span>{{ getArtistName(item) }}</span>
              </v-chip>
              <span v-if="index >= 2" class="text-grey text-caption align-self-center">
                (+{{ selectedArtists.length - 2 }} others)
              </span>
            </template>
          </v-select>

          <v-switch v-model="isExclusiveGenres" :label="$t('track.exclusive-filter')"></v-switch>

          <v-btn @click="resetFilters" v-if="selectedGenres.length !== 0 || selectedPopularity != 'No filter'"
            class="rainbow-v-btn">
            {{ $t("playlist.reset-filters") }}
          </v-btn>
        </div>
      </aside>

      <!-- Track list -->
      <section id="right-part" style="width: 100%">
        <h2>{{ generalTitle }}</h2>
        <v-card-subtitle>{{ filteredTracks.length }} {{ $t('track.name') }}</v-card-subtitle>
        <div id="tracks">
          <TrackCard v-for="(track, index) in filteredTracks" :key="track.id" :id="track.id" :name="track.name"
            :image="track.album.images[0].url" :artists="track.artists" :genres="track.genres" :isIndie="track.isIndie"
            :trackURI="track.uri" :trackIndex="index" />
        </div>

        <!-- Download loader -->
        <v-progress-circular v-if="filteredTracks.length < 1" :size="70" :width="7" color="var(--text-color)"
          indeterminate>
        </v-progress-circular>
      </section>
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

<script lang="ts">
import GenreChart from '@/components/playlist_detail/GenreChart.vue'
import IndieChart from '@/components/playlist_detail/IndieChart.vue'
import LoadMoreTracksPopup from '@/components/playlist_detail/LoadMoreTracksPopup.vue'
import TrackCard from '@/components/playlist_detail/TrackCard.vue'

import { SpotifyArtist } from '@/api/spotify/model'

import { Genre } from '@/model'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PlaylistDetail',
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
  async mounted() {
    await this.loadFirstTracks()
    this.filteredTracks = this.playlists[this.playlistId].tracks
  },
  data() {
    return {
      trackRequestLimit: 150,

      isHugePlaylist: false,

      selectedTab: 0,

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
      this.scrollTop()
    },
    filterTracksByPopularity(popularity: string) {
      if (popularity === 'No filter') return this.resetFilters()

      const isIndieSelected = popularity === 'Indie'
      this.filteredTracks = this.playlists[this.playlistId].tracks.filter(
        (t) => t.isIndie === isIndieSelected
      )
      this.scrollTop()
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
      this.scrollTop()
    },
    resetFilters() {
      this.selectedGenres = []
      this.selectedPopularity = 'No filter'
      this.filteredTracks = this.playlists[this.playlistId].tracks
      this.scrollTop()
    },
    openPlaylistOnSpotify() {
      window.location.href = this.playlists[this.playlistId].uri
    },
    // Returns only top genres sorted by most to least popular
    getSortedGenres(): Genre[] {
      return this.playlistsStore.getTopGenres(this.playlistId, 15)
    },
    capitalize(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    getSortedArtists(): Array<SpotifyArtist> {
      const allArtists: Set<SpotifyArtist> = new Set()
      for (const track of this.playlists[this.playlistId].tracks) {
        track.artists.map(a => allArtists.add(a))
      }
      return Array.from(allArtists).sort((a1, a2) => a1.name.localeCompare(a2.name))
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  computed: {
    spotifyLogo(): string {
      return require('@/assets/spotify.png')
    },
    generalTitle(): string {
      const separator = (this.isExclusiveGenres) ? ' and ' : ' or '
      return this.selectedGenres.map(g => this.capitalize(g)).join(separator) || this.$t('track.all-tracks')
    },
    getArtistName() {
      return (artist: SpotifyArtist) => {
        return artist.name
      }
    },
    getArtistCover() {
      return (artist: SpotifyArtist) => {
        return artist.name
      }
    }
  },
  watch: {
    isExclusiveGenres() {
      this.filterTracksByGenres()
    },
    selectedPopularity(newSelectedPopularity: string) {
      this.filterTracksByPopularity(newSelectedPopularity)
    },
    selectedArtists(newValue: Array<string>, oldValue: Array<string>) {
      if (oldValue.length !== 0 || newValue.length !== 0) {
        this.filterTracksByArtists()
      }
    },
    selectedGenres(newValue: Array<string>, oldValue: Array<string>) {
      if (oldValue.length !== 0 || newValue.length !== 0) {
        this.filterTracksByGenres()
      }
    }
  }
})
</script>
<style>
#left-part {
  display: flex;
  flex-direction: column;
  border-right: 2px solid;
  border-color: var(--primary-color) !important;
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
  background-color: var(--primary-color) !important;
  color: var(--text-color) !important;
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
