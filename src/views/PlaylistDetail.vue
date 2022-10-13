<template>
  <!-- Description of all the playlist with all the tracks and filters -->
  <div id="playlist" v-if="playlists[playlistId] && playlists[playlistId].total > 0">
    <div id="content" style="display: flex">

      <!-- old part-->
      <aside id="left-part">
        <v-tabs v-model="selectedTab" background-color="var(--primary-color)" fixed-tabs end>
          <v-tab :value="0">Genres</v-tab>
          <v-tab :value="1">Artists</v-tab>
        </v-tabs>
        <v-window v-model="selectedTab" v-if="filteredTracks.length > 0" id="charts">
          <v-window-item>
            <GenreChart :genres="getSortedGenres()" />
          </v-window-item>
          <v-window-item>
            <IndieChart :playlistId="playlistId" />
          </v-window-item>
        </v-window>
      </aside>

      <!-- Filters -->
      <div id="filters">
        <h3 class="rainbow-text">{{ $t('track.filters.title') }}</h3>

        <v-select v-model="selectedGenres" :label="$t('track.filters.genres')" :items="getSortedGenres()"
          item-title="cap_name" item-value="name" variant="outlined" density="comfortable" multiple
          style="text-transform: capitalize">
        </v-select>

        <v-select v-model="selectedArtists" :label="$t('track.filters.artists')" :items="getSortedArtists()"
          item-title="name" item-value="name" variant="outlined" density="comfortable" multiple
          style="text-transform: capitalize">
          <template v-slot:selection="{ item, index }: SlotProps">
            <v-chip v-if="index < 2">
              <v-avatar>
                <v-img rel="preconnect" width="20" :src="getArtistCover(item)" alt="Spotify artist cover"></v-img>
              </v-avatar>
              <span>{{ getArtistName(item) }}</span>
            </v-chip>
            <span v-if="index === 2" class="text-grey text-caption align-self-center">
              (+{{ selectedArtists.length - 2 }} others)
            </span>
          </template>
        </v-select>

        <v-switch v-model="isFilterExclusive" :label="$t('track.exclusive-filter')"></v-switch>

        <v-btn @click="resetFilters" v-if="selectedGenres.length !== 0 || selectedPopularity != NO_POPULARITY"
          class="rainbow-v-btn">
          {{ $t("playlist.reset-filters") }}
        </v-btn>
      </div>
      <div id="filter-chips" style="width: 100%">
        <div style="width: 100%">
          <v-chip-group active-class="primary--text" column v-model="selectedPopularityVModel">
            <v-chip :text="getTextForPopularity('Indie')" value="Indie"> </v-chip>
            <v-chip :text="getTextForPopularity('Popular')" value="Popular"> </v-chip>
          </v-chip-group>

          <div v-if="selectedGenres.length > 0">
            <!-- One ship for each genre if exclusive else one ship with 'or' -->
            <v-chip v-if="isFilterExclusive"
              :text="selectedGenres.join(` ${$t('track.filters.keyword.and')} `).toUpperCase()">
            </v-chip>
            <v-chip v-else v-for="genre in selectedGenres" :key="genre" :text="genre.toUpperCase()">
            </v-chip>
          </div>
        </div>

      </div>

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
        <v-progress-circular v-if="filteredTracks.length < 1 && !playlistLoaded" :size="70" :width="7"
          color="var(--text-color)" indeterminate>
        </v-progress-circular>
      </section>
    </div>

    <!-- Load more tracks to lazy-load all of them -->
    <LoadMoreTracksPopup v-if="isHugePlaylist && playlists[playlistId].tracks.length < playlists[playlistId].total"
      :playlist="playlists[playlistId]" :trackRequestLimit="TRACK_REQUEST_LIMIT" @allTracksLoaded="resetFilters" />
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

import { SpotifyArtist, SpotifyTrack } from '@/api/spotify/types/entities'

import { Genre } from '@/model'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { capitalize } from '@/utils/functions'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

// It is used for typing slot props
interface SlotProps {
  item: SpotifyArtist
  index: number
}

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
  setup () {
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { filteredTracks, selectedGenres, playlists } = storeToRefs(playlistsStore)
    const { downloadPlaylistTracks } = playlistsStore

    const currentUserUsername = useUserStore().username

    return {
      playlistsStore,
      playlists,
      downloadPlaylistTracks,
      currentUserUsername,
      filteredTracks,
      selectedGenres
    }
  },
  async mounted () {
    const playlist = this.playlists[this.playlistId]
    this.TRACK_REQUEST_LIMIT = this.playlistsStore.MAX_TRACKS_LIMIT * 3
    if (playlist.id === 'my-music') {
      await this.playlistsStore.refreshMyMusicTotalTrack()
    }
    await this.loadFirstTracks()
    this.filteredTracks = this.playlists[this.playlistId].tracks
  },
  data () {
    return {
      TRACK_REQUEST_LIMIT: 150,
      NO_POPULARITY: 'No filter',

      isHugePlaylist: false,

      selectedTab: 0,
      // NO_POPULARITY
      selectedPopularity: 'No filter',
      selectedPopularityVModel: undefined,

      selectedArtists: ([] as string[]),

      isFilterExclusive: false,
      playlistLoaded: false
    }
  },
  methods: {
    async loadFirstTracks () {
      // Only asking for the right number of tracks as we already know how many tracks are in the playlist
      const maxLimit = Math.min(
        this.TRACK_REQUEST_LIMIT, this.playlists[this.playlistId].total
      )
      await this.downloadPlaylistTracks(this.playlistId, maxLimit)
      this.isHugePlaylist =
        this.playlists[this.playlistId].total > this.TRACK_REQUEST_LIMIT
      this.playlistLoaded = true
      this.resetFilters()
    },
    applyFilters () {
      const playlistTracks = this.playlists[this.playlistId].tracks
      let filteredTracks = this.playlists[this.playlistId].tracks

      if (
        this.selectedGenres.length === 0 &&
        this.selectedArtists.length === 0 &&
        this.selectedPopularity === this.NO_POPULARITY
      ) {
        return this.resetFilters()
      }

      // Filter over genres
      const genres = this.selectedGenres
      if (genres.length > 0) {
        if (this.isFilterExclusive) {
          filteredTracks = playlistTracks.filter(
            (t) => genres.every((genre) => t.genres.includes(genre))
          )
        } else {
          filteredTracks = playlistTracks.filter(
            (t) => genres.some((genre) => t.genres.includes(genre))
          )
        }
      }

      // Filter over artists
      const artists = this.selectedArtists
      if (artists.length > 0) {
        if (this.isFilterExclusive) {
          filteredTracks = filteredTracks.filter(
            (t) => artists.every((artist) => t.artists.map(a => a.name).includes(artist))
          )
        } else {
          const validArtistTracks = playlistTracks.filter(
            (t) => artists.some((artist) => t.artists.map(a => a.name).includes(artist))
          )
          this.addTracksConserveUnicity(filteredTracks, validArtistTracks)
        }
      }

      // Filter over popularity
      // Always consider that filter is exclusive with popularity (&&)
      const popularity = this.selectedPopularity
      if (popularity !== this.NO_POPULARITY) {
        filteredTracks = filteredTracks.filter(
          (t) => t.isIndie === (popularity === 'Indie'))
      }

      this.filteredTracks = filteredTracks
      this.scrollTop()
    },
    addTracksConserveUnicity (filteredTracks: SpotifyTrack[], validTracks: SpotifyTrack[]) {
      const alreadyKnownTrackIds = filteredTracks.map(t => t.id)
      const tracksToAdd = validTracks.filter(t => !alreadyKnownTrackIds.includes(t.id))
      filteredTracks.push(...tracksToAdd)
    },
    resetFilters () {
      this.selectedGenres = []
      this.selectedArtists = []
      this.selectedPopularity = this.NO_POPULARITY
      this.filteredTracks = this.playlists[this.playlistId].tracks
      this.scrollTop()
    },
    openPlaylistOnSpotify () {
      console.log(this.playlists[this.playlistId].uri)

      window.location.href = this.playlists[this.playlistId].uri
    },
    // Returns only top genres sorted by most to least popular
    getSortedGenres (): Genre[] {
      return this.playlistsStore.getTopGenres(this.playlistId, 25)
    },
    getSortedArtists (): SpotifyArtist[] {
      const allArtists: Set<SpotifyArtist> = new Set()
      for (const track of this.playlists[this.playlistId].tracks) {
        track.artists.map(a => allArtists.add(a))
      }
      return Array.from(allArtists).sort((a1, a2) => a1.name.localeCompare(a2.name))
    },
    scrollTop () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    getTextForPopularity (popularity: string): string {
      const allPopularities: { [popularity: string]: string } = {
        Indie: this.$t('track.filters.indie'),
        Popular: this.$t('track.filters.popular')
      }
      allPopularities[this.NO_POPULARITY] = this.$t('track.filters.no-filter')
      return allPopularities[popularity]
    }
  },
  computed: {
    spotifyLogo (): string {
      return require('@/assets/spotify.png')
    },
    generalTitle (): string {
      const keyword = (this.isFilterExclusive) ? this.$t('track.filters.keyword.and') : this.$t('track.filters.keyword.or')
      const separator = ` ${keyword} `
      const popularityFilter = (this.selectedPopularity !== this.NO_POPULARITY) ? [this.selectedPopularity] : []
      const filters = popularityFilter.concat(this.selectedArtists).concat(this.selectedGenres)
      return filters.map(f => capitalize(f)).join(separator) || this.$t('track.all-tracks')
    },
    getArtistName () {
      return (artist: SpotifyArtist) => {
        return artist.name
      }
    },
    getArtistCover () {
      return (artist: SpotifyArtist) => {
        return artist.images[0].url
      }
    }
  },
  watch: {
    isFilterExclusive () {
      this.applyFilters()
    },
    selectedPopularityVModel () {
      this.selectedPopularity = this.selectedPopularityVModel || this.NO_POPULARITY
      this.applyFilters()
    },
    selectedArtists (newValue: string[], oldValue: string[]) {
      if (oldValue.length !== 0 || newValue.length !== 0) {
        this.applyFilters()
      }
    },
    selectedGenres (newValue: string[], oldValue: string[]) {
      if (oldValue.length !== 0 || newValue.length !== 0) {
        this.applyFilters()
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

#filters {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
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
