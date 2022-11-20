<template>
  <!-- Description of all the playlist with all the tracks and filters -->
  <div id="playlist-detail" v-if="playlist && playlist.total > 0" v-scroll="onScroll">
    <div id="main-content">
      <PlaylistMetaDisplay :playlist-id="playlistId" :indie-percentage="indiePercentage"
        @playlist-updated="resetFilters" />

      <v-expansion-panels v-model="openPanels" variant="accordion">
        <v-expansion-panel>
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
              <div id="selectors">
                <div id="popularity-select">
                  <v-select v-model="selectedPopularity" :label="$t('track.filters.popularity')"
                    :items="[NO_POPULARITY, 'Popular', 'Indie']" variant="outlined" density="compact"
                    class="filter-select">
                  </v-select>
                </div>

                <div id="genre-select">
                  <v-select v-model="selectedGenres" :label="$t('track.filters.genres')"
                    :items="playlistsStore.getTopGenres(playlistId)" item-title="cap_name" item-value="name"
                    variant="outlined" density="compact" multiple class="filter-select"
                    :menu-props="{ 'max-height': '250px' }">
                  </v-select>
                </div>

                <div id="artist-filter">
                  <v-select v-model="selectedArtists" :label="$t('track.filters.artists')" :items="getSortedArtists()"
                    item-title="name" variant="outlined" density="compact" multiple return-object
                    :menu-props="{ 'max-height': '250px' }">
                    <template v-slot:selection="{ item, index }: SlotProps">
                      <v-chip v-if="index < 2" variant="outlined">
                        <v-avatar>
                          <v-img rel="preconnect" width="20" :src="item.raw.images[0].url" alt="Spotify artist cover">
                          </v-img>
                        </v-avatar>
                        <span>{{ item.raw.name }}</span>
                      </v-chip>
                      <span v-if="index === 2" class="text-grey text-caption align-self-center">
                        (+{{ selectedArtists.length - 2 }} others)
                      </span>
                    </template>
                  </v-select>
                </div>
              </div>

              <div id="filters-and-reset">
                <div id="filtering-chips">
                  <div>
                    <v-scale-transition>
                      <v-chip v-if="selectedPopularity !== NO_POPULARITY"
                        :text="getTextForPopularity(selectedPopularity)" closable
                        @click:close="selectedPopularity = NO_POPULARITY" variant="elevated"
                        :color="getColorForPopularity(selectedPopularity)">
                      </v-chip>
                    </v-scale-transition>
                  </div>

                  <div v-if="selectedGenres.length > 0">
                    <transition-group name="scale-transition" tag="v-chip">
                      <v-chip v-for="genre in selectedGenres" :key="genre" :text="genre.toUpperCase()" closable
                        :color="getColorForGenre(genre)"
                        @click:close="selectedGenres = selectedGenres.filter(g => g !== genre)" variant="outlined"
                        prepend-icon="mdi-chart-bar-stacked">
                      </v-chip>
                    </transition-group>
                  </div>

                  <div v-if="selectedArtists.length > 0">
                    <transition-group name="scale-transition" tag="v-chip">
                      <v-chip v-for="artist in selectedArtists" :key="artist.name" closable color="yellow"
                        @click:close="selectedArtists = selectedArtists.filter(a => a.id != artist.id)"
                        variant="outlined">
                        <v-avatar left>
                          <v-img :src="getArtistImage(artist)"></v-img>
                        </v-avatar>
                        {{ artist.name }}
                      </v-chip>
                    </transition-group>
                  </div>
                </div>

                <div>
                  <v-fade-transition>
                    <v-switch :disabled="numberOfActiveFilters <= 1" v-model="isFilterExclusive"
                      color="var(--text-color)"
                      :label="$t(`track.${isFilterExclusive ? 'exclusive' : 'inclusive'}-filter`)">
                    </v-switch>
                  </v-fade-transition>

                  <v-btn :disabled="filteredTracks.length === 0 || numberOfActiveFilters === 0"
                    id="create-new-playlist-btn" @click="startDuplication = true" rounded="pill" class="rainbow-v-btn">
                    {{ $t("playlist.duplicate.only-with-filter") }}
                  </v-btn>
                </div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Track list -->
      <section id="main-section">
        <div id="list-title">
          <div id="list-title-embedded">
            <h2>{{ generalTitle }}</h2>
          </div>
          <v-divider class="mx-4" vertical thickness="0.5" color="grey"></v-divider>
          <div>
            <h4 id="track-number-title"> {{ filteredTracks.length }} {{ $t('track.name') }}</h4>
          </div>
        </div>
        <v-divider thickness="0.5" color="grey"></v-divider>

        <v-list id="tracks" v-if="filteredTracks.length >= 1 || playlistLoaded">
          <TrackItem v-for="(track, index) in filteredTracks" :key="track.id" :id="track.id" :name="track.name"
            :image="track.album.images[0]?.url" :artists="track.artists" :genres="track.genres" :isIndie="track.isIndie"
            :trackURI="track.uri" :trackIndex="index" />
        </v-list>

        <!-- Download loader -->
        <div id="spinner-block" v-else>
          <v-progress-circular id="waiting-spinner" :size="70" :width="7" color="var(--text-color)" indeterminate>
          </v-progress-circular>
        </div>
      </section>

      <v-btn @click="scrollTop" id="scroll-top-button" class="rainbow-v-btn" icon :style="toButtonOpacity">
        <v-icon>mdi-apple-keyboard-control</v-icon>
      </v-btn>
    </div>

    <!-- Load more tracks to lazy-load all of them -->
    <LoadMoreTracksPopup v-if="isHugePlaylist && playlist.tracks.length < playlist.total" :playlist="playlist"
      :trackRequestLimit="TRACK_REQUEST_LIMIT" @all-tracks-loaded="() => { resetFilters(); refreshStats() }" />
  </div>

  <!-- No tracks in the playlist -->
  <div id="no-tracks" v-else>
    <h1>{{ $t("playlist.no-tracks-title") }}</h1>
    <h2>{{ $t("playlist.no-tracks-subtitle") }}</h2>
    <v-btn @click="openPlaylistOnSpotify" id="open-spotify" variant="outlined" rounded="pill" size="x-large">
      {{ $t("playlist.open-on-spotify") }}
      <v-img width="25" src='@/assets/spotify.png' alt="Spotify Logo" />
    </v-btn>
  </div>

  <DuplicatorPopup v-if="startDuplication" :playlistId="playlist.id" :new-tracks="filteredTracks"
    :filter-tag="filterTag" @on-end="startDuplication = false" />
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent, StyleValue, toRef } from 'vue'

import { SpotifyArtist, SpotifyTrack } from '@/api/spotify/types/entities'
import DuplicatorPopup from '@/components/playlist_detail/DuplicatorPopup.vue'
import GenreChart from '@/components/playlist_detail/GenreChart.vue'
import LoadMoreTracksPopup from '@/components/playlist_detail/LoadMoreTracksPopup.vue'
import PlaylistMetaDisplay from '@/components/playlist_detail/PlaylistMetaDisplay.vue'
import TrackItem from '@/components/playlist_detail/TrackItem.vue'
import { Genre } from '@/model'
import { API_TRACK_LIMIT, MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'
import { capitalize } from '@/utils/functions'

// It is used for typing Vuetify select slot props
// eslint-disable-next-line
interface SlotProps {
  item: { raw: SpotifyArtist }
  index: number
}

const NO_POPULARITY = 'No filter'
const Popularity = ({
  Indie: 'Indie',
  Popular: 'Popular',
  NO_POPULARITY
} as const)
// eslint-disable-next-line
type Popularity = typeof Popularity[keyof typeof Popularity]

export default defineComponent({
  name: 'PlaylistDetail',
  props: {
    playlistId: {
      type: String,
      required: true
    }
  },
  components: {
    DuplicatorPopup,
    GenreChart,
    LoadMoreTracksPopup,
    PlaylistMetaDisplay,
    TrackItem
  },
  setup (props) {
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { playlists } = storeToRefs(playlistsStore)
    const playlist = toRef(playlists.value, props.playlistId)

    const { downloadPlaylistTracks } = playlistsStore

    return {
      playlistsStore,
      playlist,
      downloadPlaylistTracks
    }
  },
  async mounted () {
    this.TRACK_REQUEST_LIMIT = API_TRACK_LIMIT * 3
    if (this.playlist.id === MY_MUSIC_PLAYLIST_ID) {
      await this.playlistsStore.refreshMyMusicTotalTrack()
    }
    await this.loadFirstTracks()
    this.filteredTracks = this.playlist.tracks
  },
  data () {
    return {
      TRACK_REQUEST_LIMIT: 150,

      NO_POPULARITY: (NO_POPULARITY as Popularity),
      selectedPopularity: (NO_POPULARITY as Popularity),
      selectedArtists: ([] as SpotifyArtist[]),
      selectedGenres: ([] as string[]),
      isFilterExclusive: true,

      isHugePlaylist: false,
      playlistLoaded: false,

      // For child components
      topGenres: ([] as Genre[]),
      indiePercentage: 0,

      startDuplication: false,

      displayGoTopButton: false,

      openPanels: ([] as number[]),
      filteredTracks: ([] as SpotifyTrack[])
    }
  },
  methods: {
    onScroll () {
      this.displayGoTopButton = (window.scrollY > 100)
    },
    async loadFirstTracks () {
      // Only asking for the right number of tracks as we already know how many tracks are in the playlist
      const maxLimit = Math.min(this.TRACK_REQUEST_LIMIT, this.playlist.total)
      await this.downloadPlaylistTracks(this.playlistId, maxLimit)
      this.isHugePlaylist = this.playlist.total > this.TRACK_REQUEST_LIMIT
      this.playlistLoaded = true
      this.topGenres = this.getTopGenres()
      this.indiePercentage = this.getIndiePercentage()
      this.resetFilters()
    },
    refreshStats () {
      this.topGenres = this.getTopGenres()
      this.indiePercentage = this.getIndiePercentage()
    },
    getIndiePercentage (): number {
      return this.playlistsStore.getIndiePercentage(this.playlistId)
    },
    applyFilters () {
      if (this.numberOfActiveFilters === 0) {
        return this.resetFilters()
      }

      const playlistTracks = this.playlist.tracks
      let newFilteredTracks = this.playlist.tracks

      // Filter over genres
      const genres = this.selectedGenres
      if (genres.length > 0) {
        if (this.isFilterExclusive) {
          newFilteredTracks = playlistTracks.filter(
            (t) => genres.every((genre) => t.genres.includes(genre))
          )
        } else {
          newFilteredTracks = playlistTracks.filter(
            (t) => genres.some((genre) => t.genres.includes(genre))
          )
        }
      }

      // Filter over artists
      const artistIds = this.selectedArtists.map((a) => a.id)
      if (artistIds.length > 0) {
        if (this.isFilterExclusive) {
          newFilteredTracks = newFilteredTracks.filter(
            (t) => artistIds.every((artistId) => t.artists.map(a => a.id).includes(artistId))
          )
        } else {
          const validArtistTracks = playlistTracks.filter(
            (t) => artistIds.some((artistId) => t.artists.map(a => a.id).includes(artistId))
          )
          this.addTracksConserveUnicity(newFilteredTracks, validArtistTracks)
        }
      }

      // Filter over popularity
      const popularity = this.selectedPopularity
      if (popularity !== NO_POPULARITY) {
        if (this.isFilterExclusive) {
          newFilteredTracks = newFilteredTracks.filter(
            (t) => t.isIndie === (popularity === Popularity.Indie)
          )
        } else {
          const validArtistTracks = playlistTracks.filter(
            (t) => t.isIndie === (popularity === Popularity.Indie)
          )
          this.addTracksConserveUnicity(newFilteredTracks, validArtistTracks)
        }
      }

      this.filteredTracks = newFilteredTracks
    },
    addTracksConserveUnicity (filteredTracks: SpotifyTrack[], validTracks: SpotifyTrack[]) {
      const alreadyKnownTrackIds = filteredTracks.map(t => t.id)
      const tracksToAdd = validTracks.filter(t => !alreadyKnownTrackIds.includes(t.id))
      filteredTracks.push(...tracksToAdd)
    },
    resetFilters () {
      this.selectedGenres = []
      this.selectedArtists = []
      this.selectedPopularity = NO_POPULARITY
      this.filteredTracks = this.playlist.tracks
    },
    openPlaylistOnSpotify () {
      window.location.href = this.playlist.uri
    },
    getSortedArtists (): SpotifyArtist[] {
      // Need to have a set of object in JS ...
      const alreadyAddedArtistNames: string[] = []
      const artistsToReturn: SpotifyArtist[] = []

      for (const track of this.playlist.tracks) {
        for (const artist of track.artists) {
          if (!alreadyAddedArtistNames.includes(artist.name)) {
            artistsToReturn.push(artist)
            alreadyAddedArtistNames.push(artist.name)
          }
        }
      }
      return artistsToReturn.sort((a1, a2) => a1.name.localeCompare(a2.name))
    },
    scrollTop () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    getTextForPopularity (popularity: Popularity): string {
      const allPopularities: Record<Popularity, string> = {
        Indie: this.$t('track.filters.indie'),
        Popular: this.$t('track.filters.popular'),
        'No filter': this.$t('track.filters.no-filter')
      }
      return allPopularities[popularity]
    },

    // Returns only top genres sorted by most to least popular
    getTopGenres (): Genre[] {
      const limit = (window.innerWidth > 500) ? 25 : 10
      return this.playlistsStore.getTopGenres(this.playlistId, limit)
    },
    getColorForPopularity (popularity: string): string {
      if (popularity === Popularity.Indie) return 'green'
      if (popularity === Popularity.Popular) return 'red'
      return '#ddd'
    },
    getColorForGenre (genre: string): string {
      return this.playlistsStore.genreColorMapping[genre]
    },
    getArtistImage (artist: SpotifyArtist): string {
      return artist.images[0]?.url || require('@/assets/no-user.png')
    }
  },
  computed: {
    generalTitle (): string {
      const keyword = (this.isFilterExclusive) ? this.$t('track.filters.keyword.and') : this.$t('track.filters.keyword.or')
      const separator = ` ${keyword} `
      const popularityFilter: string[] = (this.selectedPopularity !== NO_POPULARITY) ? [this.selectedPopularity] : []
      const filters = popularityFilter.concat(this.selectedGenres).concat(this.selectedArtists.map(a => a.name))
      return `${filters.map(f => capitalize(f)).join(separator)}` || this.$t('track.all-tracks')
    },
    getEmojiFromVisibility (): string {
      if (this.playlist.collaborative) return this.$t('_emojis.collaborative')
      if (this.playlist.public) return this.$t('_emojis.public')
      return this.$t('_emojis.private')
    },
    toButtonOpacity (): StyleValue {
      return { opacity: (this.displayGoTopButton) ? 100 : 0 }
    },
    numberOfActiveFilters (): number {
      return (
        this.selectedGenres.length +
        this.selectedArtists.length +
        +(this.selectedPopularity !== NO_POPULARITY)
      )
    },
    filterTag (): string {
      const keyword = (this.isFilterExclusive) ? this.$t('track.filters.keyword.and') : this.$t('track.filters.keyword.or')

      return ((this.selectedPopularity !== NO_POPULARITY ? [this.selectedPopularity] : []) as string[])
        .concat(this.selectedArtists.map(a => a.name))
        .concat(this.selectedGenres)
        .join(` ${keyword} `)
    }
  },
  watch: {
    isFilterExclusive () {
      this.applyFilters()
    },
    selectedPopularity () {
      this.applyFilters()
    },
    selectedArtists (newValue: SpotifyArtist[], oldValue: SpotifyArtist[]) {
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
/* Generic containers */
#playlist-detail {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;

  background-image: url("@/assets/stars.jpg");
  background-repeat: repeat;
}

#main-content {
  width: 100%;
  min-height: 100%;
  margin: 0px auto;

  display: flex;
  flex-direction: column;
}

#no-tracks {
  width: 100%;
  text-align: center;
  margin: auto;
}

/* no-tracks part */
#open-spotify {
  color: var(--text-color) !important;
  background-color: var(--primary-color) !important;
  letter-spacing: 0px;
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

/* Filters */
#filters {
  padding: 5px;

  display: flex;
  flex-direction: column;
}

.filter-select {
  text-transform: capitalize;
}

#filter-chips {
  width: 100%
}

#filter-chips-embedded {
  width: 100%
}

#filtering-chips {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

#filtering-chips>div {
  margin: 2px 5px;
}

#filtering-chips>div>span {
  margin: 1px;
}

#filters-and-reset .v-switch {
  width: fit-content;

  margin-left: 10px;
}

#filters-and-reset .v-switch .v-input__details {
  display: none;
}

#filters-and-reset .v-switch .v-switch__thumb {
  color: var(--text-color);
}

#filters-and-reset .v-switch .v-switch__track {
  background-color: var(--text-color);
}

#filters-and-reset .v-switch .v-label {
  /* rainbow-text */
  color: var(--text-color);
  opacity: 0.8;
}

#genre-select {
  width: min(100%, 400px);
}

#popularity-select {
  width: min(100%, 150px);
}

#artist-filter {
  width: min(100%, 400px);
  margin-bottom: 15px;
}

#artist-filter .v-input {
  max-height: 40px;
}

#artist-filter .v-input__control {
  max-height: 40px;
}

.v-chip .v-avatar {
  position: relative;
  right: 5px;
}

#create-new-playlist-btn {
  float: right;

  color: black;
  font-size: 10px;
}

/* Main section and track display */
#main-section {
  width: 100%;
  height: 100%;
  margin: 5px 0px;

  border: 2px var(--link-color) solid;
  border-radius: 5px;
}

#list-title {
  display: flex;
  align-items: center;

  background-color: black;
  border-radius: 5px;
}

#list-title-embedded {
  width: 100%;
  padding-left: 10px;
}

#track-number-title {
  width: max-content;
  margin-right: 40px;
}

#tracks {
  /* width: fit-content; */
  padding: 0;
  margin: auto;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: stretch;
  align-content: center;
}

.v-expansion-panel-text__wrapper {
  padding: 10px 0px;
}

#percentage-row {
  display: flex;
  flex-direction: row;
}

/* Button to scroll top */
#scroll-top-button {
  position: fixed;
  right: 10px;
  bottom: 125px;
  z-index: 3;
  transition: 0.2s all ease-out;
}

/* Main generic spinner while loading*/
#spinner-block {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

#spinner-block #waiting-spinner {
  width: 100% !important;
}

.v-progress-circular>svg {
  width: fit-content !important;
}

@media only screen and (min-width: 768px) {
  #selectors {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  #scroll-top-button {
    width: 60px;
    height: 60px;

    right: 20px;
    bottom: 20px;
  }

  #scroll-top-button .v-btn--size-default {
    font-size: 27px;
  }

  #main-content {
    width: 80%;
  }
}
</style>
