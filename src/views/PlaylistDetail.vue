<template>
  <!-- Description of all the playlist with all the tracks and filters -->
  <div id="playlist-detail" v-if="playlist && playlist.total > 0" v-scroll="onScroll">
    <div id="main-content">
      <v-card id="playlist-card" v-if="playlistId">
        <div id="playlist-meta">
          <div id="playlist-meta-left">
            <div id="playlist-image" @click.self="openPlaylistOnSpotify">
              <v-img v-bind:src="playlist.images[0].url" lazy-src='@/assets/default_cover.jpg' alt="Cover image" cover
                rel="preconnect" width="90">
              </v-img>
            </div>
            <div id="title-container">
              <v-tooltip :text="playlist.name" class="rainbow-tooltip" location="center">
                <template v-slot:activator="{ props }">
                  <h3 id="playlist-name" class="text-truncate rainbow-text" v-bind="props"
                    @click.self="openPlaylistOnSpotify">
                    {{ playlist.name }}
                  </h3>
                </template>
              </v-tooltip>
              <p> {{ getTextFromVisibility }} </p>
              <p id="playlist-owner">
                {{ $t("playlist.created-by") }}
                <span id="playlist-owner-name" @click.stop="openPlaylistOwnerSpotifyProfile">
                  {{ usernameToDisplay }}
                </span>
              </p>
              <p v-if="allTracksLoaded" id="percentage-row">
                <span class="rainbow-text">{{ $t("playlist.indie-score-text") }}</span>
                <!-- Only if all tracks are loaded -->
                <span :style="colorForPercentage" style="margin: 0px 5px;" class="black-highlight">
                  {{ ` ${indiePercentage}` }} %
                </span>
                <v-tooltip :text="$t('playlist.explanation-indie-score')" class="rainbow-tooltip">
                  <template v-slot:activator="{ props }">
                    <v-btn id="help-indie-percentage" v-bind="props">
                      <v-icon size="x-small">mdi-help</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </p>
              <v-tooltip location="bottom start" :text="$t('playlist.open-on-spotify')" class="rainbow-tooltip">
                <template v-slot:activator="{ props }">
                  <v-img id="spotify-logo-meta" v-bind="props" @click="openPlaylistOnSpotify"
                    src="@/assets/spotify-long.png" alt="Spotify Logo" rel="preconnect" width="90">
                  </v-img>
                </template>
              </v-tooltip>

            </div>
          </div>
          <v-tooltip :text="$t('playlist.explanation-indie-score')" class="rainbow-tooltip" location="bottom">
            <template v-slot:activator="{ props }">
              <IndieChart v-bind="props" :indie-percentage="indiePercentage" class="playlist-meta-middle" />
            </template>
          </v-tooltip>
          <div id="playlist-meta-right">
            <p v-show="allTracksLoaded">
              <span class="rainbow-text">{{ $t('playlist.duration') }}</span>
              <span class="playlist-metric">
                {{ getPlaylistDuration() }}
              </span>
            </p>
            <p>
              <span class="rainbow-text">{{ $t('playlist.total-track-number') }}</span>
              <span class="playlist-metric">
                {{ playlist.total }}
              </span>
            </p>
          </div>
        </div>
        <v-card-text id="playlist-description">
          <p v-if="formattedDescription"> {{ formattedDescription }} </p>
          <p v-else class="font-italic"> {{ $t('playlist.no-description') }} </p>
        </v-card-text>

        <v-badge id="burger-button-badge" color="red" dot>
          <v-icon id="burger-button" @click="drawer = !drawer" icon="mdi-menu" color="var(--text-color)" size="x-large">
          </v-icon>
        </v-badge>

        <v-img id="spotify-logo-meta-small" @click="openPlaylistOnSpotify" src="@/assets/spotify.png" alt="Spotify Logo"
          rel="preconnect" width="40">
        </v-img>
      </v-card>

      <ActionDrawer :open="drawer" :playlistId="playlistId" @on-close="drawer = false"
        @duplicate-playlist="() => { startDuplication = true; drawer = false }"
        @on-sort-end="() => { resetFilters(); drawer = false }" />

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
                  <v-select v-model="selectedGenres" :label="$t('track.filters.genres')" :items="getTopGenres()"
                    item-title="cap_name" item-value="name" variant="outlined" density="compact" multiple
                    class="filter-select" :menu-props="{ 'max-height': '250px' }">
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
                    <v-fade-transition>
                      <v-chip v-if="selectedPopularity !== NO_POPULARITY"
                        :text="getTextForPopularity(selectedPopularity)" closable
                        @click:close="selectedPopularity = NO_POPULARITY" variant="elevated"
                        :color="getColorForPopularity(selectedPopularity)">
                      </v-chip>
                    </v-fade-transition>
                  </div>

                  <div v-if="selectedGenres.length > 0">
                    <v-chip v-for="genre in selectedGenres" :key="genre" :text="genre.toUpperCase()" closable
                      :color="getColorForGenre(genre)"
                      @click:close="selectedGenres = selectedGenres.filter(g => g !== genre)" variant="outlined"
                      prepend-icon="mdi-chart-bar-stacked">
                    </v-chip>
                  </div>

                  <div v-if="selectedArtists.length > 0">
                    <v-chip v-for="artist in selectedArtists" :key="artist.name" closable color="yellow"
                      @click:close="selectedArtists = selectedArtists.filter(a => a.id != artist.id)"
                      variant="outlined">
                      <v-avatar left>
                        <v-img :src="getArtistImage(artist)"></v-img>
                      </v-avatar>
                      {{ artist.name }}
                    </v-chip>
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
                    id="create-new-playlist-btn" size="small" @click="startDuplication = true" rounded="pill"
                    class="rainbow-v-btn">
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
          <h4> {{ filteredTracks.length }} {{ $t('track.name') }}</h4>
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
    <LoadMoreTracksPopup v-if="isHugePlaylist && playlist.tracks.length < playlist.total && !startDuplication"
      :playlist="playlist" :trackRequestLimit="TRACK_REQUEST_LIMIT"
      @all-tracks-loaded="() => { resetFilters(); refreshStats() }" />
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
import ActionDrawer from '@/components/playlist_detail/ActionDrawer.vue'
import DuplicatorPopup from '@/components/playlist_detail/DuplicatorPopup.vue'
import GenreChart from '@/components/playlist_detail/GenreChart.vue'
import LoadMoreTracksPopup from '@/components/playlist_detail/LoadMoreTracksPopup.vue'
import TrackItem from '@/components/playlist_detail/TrackItem.vue'

import IndieChart from '@/components/playlist_detail/IndieChart.vue'

import { SpotifyArtist, SpotifyTrack } from '@/api/spotify/types/entities'

import { Genre } from '@/model'
import { usePlaylistsStore, API_TRACK_LIMIT, MY_MUSIC_PLAYLIST_ID } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { capitalize } from '@/utils/functions'
import { storeToRefs } from 'pinia'
import { defineComponent, StyleValue, toRef } from 'vue'

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
    ActionDrawer,
    DuplicatorPopup,
    IndieChart,
    GenreChart,
    LoadMoreTracksPopup,
    TrackItem
  },
  setup (props) {
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { playlists } = storeToRefs(playlistsStore)
    const playlist = toRef(playlists.value, props.playlistId)

    const { downloadPlaylistTracks } = playlistsStore
    const currentUserUsername = useUserStore().username

    return {
      playlistsStore,
      playlist,
      downloadPlaylistTracks,
      currentUserUsername
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

      drawer: false,

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
    openPlaylistOwnerSpotifyProfile () {
      window.location.href = this.playlist.owner.uri
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
    getPlaylistDuration (): string {
      return this.playlistsStore.getPlaylistFullLength(this.playlistId)
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
    allTracksLoaded (): boolean {
      return this.playlist.tracks.length === this.playlist.total
    },
    generalTitle (): string {
      const keyword = (this.isFilterExclusive) ? this.$t('track.filters.keyword.and') : this.$t('track.filters.keyword.or')
      const separator = ` ${keyword} `
      const popularityFilter: string[] = (this.selectedPopularity !== NO_POPULARITY) ? [this.selectedPopularity] : []
      const filters = popularityFilter.concat(this.selectedGenres).concat(this.selectedArtists.map(a => a.name))
      return `${filters.map(f => capitalize(f)).join(separator)}` || this.$t('track.all-tracks')
    },
    colorForPercentage (): StyleValue {
      let color: string
      if (this.indiePercentage < 10) color = '#FF0D0D'
      else if (this.indiePercentage < 25) color = '#FF4E11'
      else if (this.indiePercentage < 50) color = '#FF8E15'
      else if (this.indiePercentage < 65) color = '#FAB733'
      else if (this.indiePercentage < 80) color = '#ACB334'
      else color = '#69B34C'
      return { color }
    },
    usernameToDisplay (): string {
      const playlistCreator = this.playlist.owner.display_name
      return this.currentUserUsername === playlistCreator ? this.$t('playlist.you') : playlistCreator
    },
    getEmojiFromVisibility (): string {
      if (this.playlist.collaborative) return this.$t('_emojis.collaborative')
      if (this.playlist.public) return this.$t('_emojis.public')
      return this.$t('_emojis.private')
    },
    getTextFromVisibility (): string {
      if (this.playlist.collaborative) {
        return this.$t('playlist.collaborative') + ' ' + this.$t('_emojis.collaborative')
      }
      if (this.playlist.public) return this.$t('playlist.public') + ' ' + this.$t('_emojis.public')
      return this.$t('playlist.private') + ' ' + this.$t('_emojis.private')
    },
    formattedDescription (): string {
      return (
        this.playlist.description
          // Remove html markups from content
          .replace(/(<([^>]+)>)/ig, '')
          // Escaped " back to real character
          .replace(/&quot;/ig, '"')
          // Escaped / back to real character
          .replace(/&#x2F;/ig, '/')
      )
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

/* playlist-card */
#playlist-card {
  width: 100%;
  min-height: 150px;

  margin-bottom: 5px;
  border: 2px var(--text-color) solid;
}

#playlist-meta {
  display: flex;
  padding: 10px 10px 0px 10px;
}

#playlist-meta-left {
  display: flex;
  width: 100%;
}

#genre-chart-container {
  display: none !important;
  width: 246px;
}

.playlist-meta-middle {
  cursor: pointer;
}

#playlist-meta-right {
  display: none;

  width: 50%;
  margin-right: 50px;
  padding: 10px;

  background-color: var(--primary-color);
  border: 1px grey solid;
  border-radius: 5px;
}

#playlist-image {
  margin: 5px 5px 5px -5px;
  cursor: pointer;
}

#title-container {
  max-width: calc(100% - 110px);
}

#playlist-name {
  margin-right: 10px;
  cursor: pointer;
}

#playlist-owner {
  opacity: 0.8;
}

#playlist-owner-name:hover {
  cursor: pointer;
  text-decoration: underline;
}

#playlist-description {
  padding: 5px 10px 10px 10px;
}

.playlist-metric {
  margin-left: 5px;
}

#help-indie-percentage {
  min-width: fit-content;
  height: 23px;
  margin-left: 5px;
  padding: 0;

  border: 2px var(--text-color) solid;
  border-radius: 5px;
  background-color: var(--primary-color);
}

#help-indie-percentage:hover {
  background-color: var(--text-color);
  border-color: var(--primary-color);
}

#help-indie-percentage .v-icon {
  padding: 8px 9px;
  color: var(--text-color);
}

#help-indie-percentage:hover .v-icon {
  color: var(--primary-color);
}

#help-indie-percentage .v-btn--size-default {
  min-width: fit-content;
}

.rainbow-tooltip .v-overlay__content {
  background-color: var(--primary-color);
  color: var(--text-color);
  border: var(--text-color) 2px solid;
  outline: var(--primary-color) 0.5px solid;
}

#spotify-logo-meta {
  display: none;
  cursor: pointer;
}

#spotify-logo-meta-small {
  position: absolute;
  bottom: 30px;
  right: 10px;

  cursor: pointer;
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
  height: 10px;

  margin-left: 10px;
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
  width: min(100%, 350px);
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
  transform-origin: center top 0px;
  position: relative;
  left: calc(100% - 329px);
  height: 35px;
  color: black;
}

/* Main section and track display */
#main-section {
  width: 100%;
  height: 100%;
  margin-top: 5px;

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
  width: 70%;
  padding-left: 5px;
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

/* Button to display vertical sidebar */
#burger-button {
  padding: 20px;

  border: 1px var(--text-color) solid;
  border-radius: 5px;
  background-color: black;

  box-shadow: 0 3px 5px -1px var(--text-color),
    0 1px 10px 0 var(--text-color) !important;
}

#burger-button-badge {
  position: absolute;
  top: 10px;
  right: 5px;
}

#burger-button-badge .v-badge__badge {
  height: 13px;
  width: 13px;

  bottom: calc(100% - 10px);
  left: calc(100% - 10px);
  border-radius: 10px;
}

.mdi-menu:hover:before {
  content: "\F006D"
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

  #playlist-meta-left {
    width: 40%;
  }

  #genre-chart-container {
    display: flex !important;
  }

  #playlist-meta-right {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  #percentage-row {
    display: none;
  }

  #spotify-logo-meta {
    display: block;
  }

  #spotify-logo-meta-small {
    display: none;
  }
}
</style>
