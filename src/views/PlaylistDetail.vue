<template>
  <!-- Description of all the playlist with all the tracks and filters -->
  <div id="playlist" v-if="playlists[playlistId] && playlists[playlistId].total > 0" v-scroll="onScroll">
    <div id="content" style="display: flex">
      <v-card v-if="playlistId" style="width: 100%">
        <div id="playlist-title" @click="openPlaylistOnSpotify">
          <v-img id="playlist-image" v-bind:src="playlistsStore.playlists[playlistId].images[0].url"
            :lazy-src="loadingCover" alt="Cover image" cover rel="preconnect" width="60">
          </v-img>
          <div id="dumb-title-container">
            <h3 style="margin-right: 5px" class="text-truncate rainbow-text">
              {{ playlistsStore.playlists[playlistId].name }}
            </h3>
            <p v-bind="visibilityTooltip"> {{ getTextFromVisibility }} </p>
            <p style="opacity: 0.8"> {{ $t("playlist.created-by") }} {{ usernameToDisplay }} </p>
            <p v-if="allTracksLoaded">
              <span class="rainbow-text">{{ $t("playlist.indie-score-text") }} </span>
              <!-- Only if all tracks are loaded -->
              <span :style="colorForPercentage">{{ indiePercentage }} %</span>
            </p>
          </div>
        </div>
        <v-card-text style="padding: 5px 10px 10px 10px">
          <p id="description"> {{ formattedDescription }} </p>
        </v-card-text>

        <v-icon id="burger-button" @click="drawer = !drawer" prepend-icon="mdi-menu">mdi-menu</v-icon>
      </v-card>

      <v-btn @click="scrollTop" id="scroll-top-button" class="rainbow-v-btn" icon :style="toButtonOpacity">
        <v-icon>mdi-apple-keyboard-control</v-icon>
      </v-btn>

      <ActionDrawer :open="drawer" :playlistId="playlistId" @onClose="drawer = false"
        @duplicatePlaylist="() => { startDuplication = true; drawer = false }" />

      <v-expansion-panels variant="accordion">
        <v-expansion-panel bg-color="var(--text-color)">
          <v-expansion-panel-title color="var(--text-color)">
            <div class="d-flex justify-start">
              Stats
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <GenreChart :genres="topGenres" />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title color="var(--link-color)">
            <div class="d-flex justify-start">
              Filters
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>

            <!-- Filters -->
            <div id="filters">
              <v-select v-model="selectedGenres" :label="$t('track.filters.genres')" :items="getTopGenres()"
                item-title="cap_name" item-value="name" variant="outlined" density="comfortable" multiple
                style="text-transform: capitalize">
              </v-select>

              <v-select v-model="selectedArtists" :label="$t('track.filters.artists')" :items="getSortedArtists()"
                item-title="name" variant="outlined" density="comfortable" multiple style="text-transform: capitalize">
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
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Track list -->
      <section style="width: 100%; margin-top: 5px">
        <v-divider></v-divider>
        <div id="list-title" style="display: flex; align-items: center">
          <div style="width: 70%">
            <h2>{{ generalTitle }}</h2>
          </div>
          <v-divider class="mx-4" vertical></v-divider>
          <h4> {{ filteredTracks.length }} {{ $t('track.name') }}</h4>
        </div>

        <v-list id="tracks" v-if="filteredTracks.length >= 1 || playlistLoaded">
          <TrackCard v-for="(track, index) in filteredTracks" :key="track.id" :id="track.id" :name="track.name"
            :image="track.album.images[0].url" :artists="track.artists" :genres="track.genres" :isIndie="track.isIndie"
            :trackURI="track.uri" :trackIndex="index" />
        </v-list>

        <!-- Download loader -->
        <div id="spinner-block" v-else>
          <v-progress-circular id="waiting-spinner" :size="70" :width="7" color="var(--text-color)" indeterminate>
          </v-progress-circular>
        </div>
      </section>
    </div>

    <!-- Load more tracks to lazy-load all of them -->
    <LoadMoreTracksPopup v-if="isHugePlaylist && playlists[playlistId].tracks.length < playlists[playlistId].total"
      :playlist="playlists[playlistId]" :trackRequestLimit="TRACK_REQUEST_LIMIT"
      @allTracksLoaded="() => {resetFilters(); refreshStats()}" />

  </div>
  <!-- No tracks in the playlist -->
  <div id="no-tracks" v-else>
    <h1>{{ $t("playlist.no-tracks") }}</h1>
    <v-btn @click="openPlaylistOnSpotify" id="open-spotify" variant="outlined" rounded="pill" size="x-large">
      {{ $t("playlist.open-on-spotify") }}
      <v-img width="25" :src="spotifyLogo" alt="Spotify Logo" />
    </v-btn>
  </div>

  <DuplicatorPopup v-if="startDuplication" :playlistId="playlistsStore.playlists[playlistId].id"
    :selectedGenres="selectedGenres" />
</template>

<script lang="ts">
import ActionDrawer from '@/components/playlist_detail/ActionDrawer.vue'
import DuplicatorPopup from '@/components/playlist_detail/DuplicatorPopup.vue'
import GenreChart from '@/components/playlist_detail/GenreChart.vue'
import LoadMoreTracksPopup from '@/components/playlist_detail/LoadMoreTracksPopup.vue'
import TrackCard from '@/components/playlist_detail/TrackCard.vue'

import { SpotifyArtist, SpotifyTrack } from '@/api/spotify/types/entities'

import { Genre } from '@/model'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { capitalize } from '@/utils/functions'
import { storeToRefs } from 'pinia'
import { defineComponent, StyleValue } from 'vue'

// It is used for typing slot props
interface SlotProps {
  item: { raw: SpotifyArtist }
  index: number
}

export default defineComponent({
  name: 'PlaylistDetail',
  props: {
    playlistId: {
      type: String,
      required: true
    }
  },
  components: {
    LoadMoreTracksPopup,
    GenreChart,
    TrackCard,
    ActionDrawer,
    DuplicatorPopup
  },
  setup() {
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { filteredTracks, playlists } = storeToRefs(playlistsStore)
    const { downloadPlaylistTracks } = playlistsStore

    const currentUserUsername = useUserStore().username

    return {
      playlistsStore,
      playlists,
      downloadPlaylistTracks,
      currentUserUsername,
      filteredTracks
    }
  },
  async mounted() {
    const playlist = this.playlists[this.playlistId]
    this.TRACK_REQUEST_LIMIT = this.playlistsStore.MAX_TRACKS_LIMIT * 3
    if (playlist.id === 'my-music') {
      await this.playlistsStore.refreshMyMusicTotalTrack()
    }
    await this.loadFirstTracks()
    this.filteredTracks = this.playlists[this.playlistId].tracks
  },
  data() {
    return {
      TRACK_REQUEST_LIMIT: 150,
      NO_POPULARITY: 'No filter',

      isHugePlaylist: false,

      // NO_POPULARITY
      selectedPopularity: 'No filter',
      selectedPopularityVModel: undefined,

      selectedArtists: ([] as string[]),
      selectedGenres: ([] as string[]),

      isFilterExclusive: false,
      playlistLoaded: false,

      // For child components
      topGenres: ([] as Genre[]),
      indiePercentage: 0,

      drawer: false,
      visibilityTooltip: null,

      startDuplication: false,
      displayGoTopButton: false
    }
  },
  methods: {
    onScroll() {
      this.displayGoTopButton = (window.scrollY > 100)
    },
    async loadFirstTracks() {
      // Only asking for the right number of tracks as we already know how many tracks are in the playlist
      const maxLimit = Math.min(
        this.TRACK_REQUEST_LIMIT, this.playlists[this.playlistId].total
      )
      await this.downloadPlaylistTracks(this.playlistId, maxLimit)
      this.isHugePlaylist =
        this.playlists[this.playlistId].total > this.TRACK_REQUEST_LIMIT
      this.playlistLoaded = true
      this.topGenres = this.getTopGenres()
      this.indiePercentage = this.getIndiePercentage()
      this.resetFilters()
    },
    refreshStats() {
      this.topGenres = this.getTopGenres()
      this.indiePercentage = this.getIndiePercentage()
    },
    getIndiePercentage(): number {
      return this.playlistsStore.getIndiePercentage(this.playlistId)
    },
    applyFilters() {
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
    },
    addTracksConserveUnicity(filteredTracks: SpotifyTrack[], validTracks: SpotifyTrack[]) {
      const alreadyKnownTrackIds = filteredTracks.map(t => t.id)
      const tracksToAdd = validTracks.filter(t => !alreadyKnownTrackIds.includes(t.id))
      filteredTracks.push(...tracksToAdd)
    },
    resetFilters() {
      this.selectedGenres = []
      this.selectedArtists = []
      this.selectedPopularity = this.NO_POPULARITY
      this.filteredTracks = this.playlists[this.playlistId].tracks
      this.scrollTop()
    },
    openPlaylistOnSpotify() {
      window.location.href = this.playlists[this.playlistId].uri
    },
    getSortedArtists(): SpotifyArtist[] {
      // Need to have a set of object in JS ...
      const alreadyAddedArtistNames: string[] = []
      const artistsToReturn: SpotifyArtist[] = []

      for (const track of this.playlists[this.playlistId].tracks) {
        for (const artist of track.artists) {
          if (!alreadyAddedArtistNames.includes(artist.name)) {
            artistsToReturn.push(artist)
            alreadyAddedArtistNames.push(artist.name)
          }
        }
      }
      return artistsToReturn.sort((a1, a2) => a1.name.localeCompare(a2.name))
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    getTextForPopularity(popularity: string): string {
      const allPopularities: { [popularity: string]: string } = {
        Indie: this.$t('track.filters.indie'),
        Popular: this.$t('track.filters.popular')
      }
      allPopularities[this.NO_POPULARITY] = this.$t('track.filters.no-filter')
      return allPopularities[popularity]
    },
    // Returns only top genres sorted by most to least popular
    getTopGenres(): Genre[] {
      return this.playlistsStore.getTopGenres(this.playlistId, 25)
    }
  },
  computed: {
    allTracksLoaded(): boolean {
      const playlist = this.playlistsStore.playlists[this.playlistId]
      return playlist.tracks.length === playlist.total
    },
    spotifyLogo(): string {
      return require('@/assets/spotify.png')
    },
    generalTitle(): string {
      const keyword = (this.isFilterExclusive) ? this.$t('track.filters.keyword.and') : this.$t('track.filters.keyword.or')
      const separator = ` ${keyword} `
      const popularityFilter = (this.selectedPopularity !== this.NO_POPULARITY) ? [this.selectedPopularity] : []
      const filters = popularityFilter.concat(this.selectedArtists).concat(this.selectedGenres)
      return `${filters.map(f => capitalize(f)).join(separator)}` || this.$t('track.all-tracks')
    },
    getArtistName() {
      return (artist: { raw: SpotifyArtist }): string => {
        return artist.raw.name
      }
    },
    getArtistCover() {
      return (artist: { raw: SpotifyArtist }): string => {
        return artist.raw.images[0].url
      }
    },
    colorForPercentage(): StyleValue {
      let color: string
      if (this.indiePercentage < 10) color = '#FF0D0D'
      else if (this.indiePercentage < 25) color = '#FF4E11'
      else if (this.indiePercentage < 50) color = '#FF8E15'
      else if (this.indiePercentage < 65) color = '#FAB733'
      else if (this.indiePercentage < 80) color = '#ACB334'
      else color = '#69B34C'
      return { color }
    },
    usernameToDisplay(): string {
      const playlistCreator =
        this.playlistsStore.playlists[this.playlistId]
          .owner.display_name

      return this.currentUserUsername === playlistCreator
        ? this.$t('me')
        : playlistCreator
    },
    getEmojiFromVisibility(): string {
      const playlist =
        this.playlistsStore.playlists[this.playlistId]

      if (playlist.collaborative) return this.$t('_emojis.collaborative')
      if (playlist.public) return this.$t('_emojis.public')
      return this.$t('_emojis.private')
    },
    getTextFromVisibility(): string {
      const playlist = this.playlistsStore.playlists[this.playlistId]

      if (playlist.collaborative) return this.$t('playlist.collaborative') + ' ' + this.$t('_emojis.collaborative')
      if (playlist.public) return this.$t('playlist.public') + ' ' + this.$t('_emojis.public')
      return this.$t('playlist.private') + ' ' + this.$t('_emojis.private')
    },
    loadingCover(): string {
      return require('@/assets/default_cover.jpg')
    },
    formattedDescription(): string {
      const playlist = this.playlistsStore.playlists[this.playlistId]
      return playlist.description.replace(/(<([^>]+)>)/ig, '')
    },
    toButtonOpacity(): StyleValue {
      return { opacity: (this.displayGoTopButton) ? 100 : 0 }
    }
  },
  watch: {
    isFilterExclusive() {
      this.applyFilters()
    },
    selectedPopularityVModel() {
      this.selectedPopularity = this.selectedPopularityVModel || this.NO_POPULARITY
      this.applyFilters()
    },
    selectedArtists(newValue: string[], oldValue: string[]) {
      if (oldValue.length !== 0 || newValue.length !== 0) {
        this.applyFilters()
      }
    },
    selectedGenres(newValue: string[], oldValue: string[]) {
      if (oldValue.length !== 0 || newValue.length !== 0) {
        this.applyFilters()
      }
    }
  }
})
</script>
<style>
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
  height: 100%;
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
  padding: 0;
  margin-top: 2px;
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

#playlist-title {
  display: flex;
  padding: 10px 10px 0px 10px;
}

#dumb-title-container {
  padding: 10px;
  width: 70%;
}

#scroll-top-button {
  position: fixed;
  right: 10px;
  bottom: 125px;
  z-index: 1004;
  transition: 0.2s all ease-out;
}

#burger-button {
  position: absolute;
  top: 5px;
  right: 0px;
  border: 1px grey solid;
  border-radius: 5px;
  padding: 15px;
}

#spinner-block {
  height: 50%;
}

#spinner-block #waiting-spinner {
  width: 100% !important;
}
</style>
