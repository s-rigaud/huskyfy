<template>
  <!-- Description of all the playlist with all the tracks and filters -->
  <div
    v-if="playlist && playlist.total > 0"
    id="playlist-detail"
    v-scroll="onScroll"
  >
    <div id="main-content">
      <PlaylistMetaDisplay
        :indie-percentage="indiePercentage"
        :playlist-id="playlistId"
        @playlist-updated="resetFilters"
      />

      <v-expansion-panels variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title color="var(--text-color)">
            <div class="d-flex justify-start">
              Stats
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text id="stats-panel-content">
            <GenreChart :genres="topGenres" />
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title
            id="filter-panel-title"
            color="var(--link-color)"
          >
            <div class="d-flex justify-start">
              Filters
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text id="filters-panel-content">
            <!-- Filters -->
            <div id="filters">
              <div id="selectors">
                <div id="popularity-select">
                  <v-select
                    v-model="selectedPopularity"
                    :items="getVSelectTranslatedPopularities()"
                    :label="$t('track.filters.popularity')"
                    class="filter-select"
                    density="compact"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                  />
                </div>
                <div id="loved-track-select">
                  <v-select
                    v-model="selectedPreference"
                    :items="getVSelectTranslatedPreferences()"
                    :label="$t('track.filters.preference')"
                    class="filter-select"
                    density="compact"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                  />
                </div>

                <div id="genre-select">
                  <v-select
                    v-model="selectedGenres"
                    :items="playlistsStore.getTopGenres(playlistId)"
                    :label="$t('track.filters.genres')"
                    :menu-props="{ 'maxHeight': '250px' }"
                    class="filter-select"
                    density="compact"
                    item-title="cap_name"
                    item-value="name"
                    multiple
                    variant="outlined"
                  />
                </div>
                <div id="artist-select">
                  <v-select
                    v-model="selectedArtists"
                    :items="getSortedArtists()"
                    :label="$t('track.filters.artists')"
                    :menu-props="{ 'maxHeight': '250px' }"
                    density="compact"
                    item-title="name"
                    multiple
                    return-object
                    variant="outlined"
                  >
                    <template #selection="{ item, index }: SlotProps">
                      <v-chip
                        v-if=" index < 2 "
                        variant="outlined"
                      >
                        <v-avatar>
                          <v-img
                            :src=" item.raw.images[0].url "
                            alt="Spotify artist cover"
                            rel="preconnect"
                            width="20"
                          />
                        </v-avatar>
                        <span>{{ item.raw.name }}</span>
                      </v-chip>
                      <span
                        v-if=" index === 2 "
                        class="text-grey text-caption align-self-center"
                      >
                        (+{{ selectedArtists.length - 2 }} {{ $tc('track.other', selectedArtists.length - 2) }})
                      </span>
                    </template>
                  </v-select>
                </div>
              </div>

              <div id="filters-and-reset">
                <div id="filtering-chips">
                  <div v-if=" selectedPopularity !== NO_POPULARITY ">
                    <v-scale-transition>
                      <v-chip
                        :color=" getColorForPopularity(selectedPopularity) "
                        :text=" getTextForPopularity(selectedPopularity) "
                        closable
                        variant="elevated"
                        @click:close="selectedPopularity = NO_POPULARITY"
                      />
                    </v-scale-transition>
                  </div>

                  <div v-if=" (selectedPreference !== NO_PREFERENCE) ">
                    <v-scale-transition>
                      <v-chip
                        :text=" getTextForPreference(selectedPreference) "
                        closable
                        color="black"
                        variant="elevated"
                        @click:close="(selectedPreference = NO_PREFERENCE)"
                      />
                    </v-scale-transition>
                  </div>

                  <div v-if=" selectedGenres.length > 0 ">
                    <TransitionGroup name="chips">
                      <v-chip
                        v-for=" genre in selectedGenres "
                        :key=" genre "
                        :color=" getColorForGenre(genre) "
                        :text=" genre.toUpperCase() "
                        class="genre-filter-chip"
                        closable
                        variant="elevated"
                        @click:close="selectedGenres = selectedGenres.filter(g => g !== genre)"
                      />
                    </TransitionGroup>
                  </div>

                  <div v-if=" selectedArtists.length > 0 ">
                    <TransitionGroup name="chips">
                      <v-chip
                        v-for=" artist in selectedArtists "
                        :key=" artist.name "
                        class="artist-filter-chip"
                        closable
                        color="yellow"
                        variant="elevated"
                        @click:close="selectedArtists = selectedArtists.filter(a => a.id != artist.id)"
                      >
                        <v-avatar left>
                          <v-img :src=" getArtistImage(artist) " />
                        </v-avatar>
                        {{ artist.name }}
                      </v-chip>
                    </TransitionGroup>
                  </div>
                </div>

                <div>
                  <v-fade-transition>
                    <v-switch
                      v-model=" isFilterExclusive "
                      :disabled=" numberOfActiveFilters <= 1 "
                      :label=" $t(`track.${isFilterExclusive ? 'exclusive' : 'inclusive'}-filter`) "
                      color="var(--text-color)"
                    />
                  </v-fade-transition>

                  <p
                    v-if=" !allTracksLoaded "
                    id="warning-not-fully-loaded"
                  >
                    ⚠️ {{ $t('track.filters.not-fully-loaded') }} ⚠️
                  </p>
                  <v-badge
                    id="create-new-playlist"
                    :content=" $t('track.filters.try-now') "
                    :value=" -1 "
                    color="red"
                  >
                    <v-btn
                      id="create-new-playlist-btn"
                      :disabled=" !isDuplicationAllowed "
                      :loading=" processFilterUpdate "
                      class="rainbow-v-btn"
                      rounded="pill"
                      @click="startDuplication = true"
                    >
                      {{ $t("playlist.duplicate.only-with-filter") }}
                    </v-btn>
                  </v-badge>
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
          <v-divider
            class="mx-4"
            color="white"
            thickness="0.5"
            vertical
          />
          <div id="playlist-track-count-embedded">
            <h4
              v-if=" playlistLoaded "
              id="track-number-title"
            >
              {{ filteredTracks.length }} {{ $tc('track._generic-name', filteredTracks.length) }}
            </h4>
          </div>
        </div>
        <v-divider
          color="white"
          thickness="0.5"
        />

        <div
          v-if=" playlistLoaded "
          id="tracks"
        >
          <v-list
            v-if=" filteredTracks.length >= 1 "
            style="width: 100%;"
          >
            <TrackItem
              v-for="( track, index ) in filteredTracks "
              :id=" track.id "
              :key=" track.id "
              :artists=" track.artists "
              :genres=" track.genres "
              :image=" track.album.images[0]?.url "
              :is-indie=" track.isIndie "
              :name=" track.name "
              :track-index=" index "
              :track-u-r-i=" track.uri "
            />
          </v-list>
          <div
            v-else
            id="no-track-div"
          >
            <p id="no-valid-tracks">
              {{ $t('track.filters.no-valid-tracks') }}
            </p>
          </div>
        </div>

        <!-- Download loader -->
        <div
          v-else
          id="spinner-block"
        >
          <v-progress-circular
            id="waiting-spinner"
            :size=" 70 "
            :width=" 7 "
            color="var(--text-color)"
            indeterminate
          />
        </div>
      </section>

      <v-btn
        id="scroll-top-button"
        :style=" toButtonOpacity "
        class="rainbow-v-btn"
        icon
        @click=" scrollTop "
      >
        <v-icon>mdi-apple-keyboard-control</v-icon>
      </v-btn>
    </div>

    <!-- Load more tracks to lazy-load all of them -->
    <LoadMoreTracksPopup
      v-if=" isHugePlaylist && playlist.tracks.length < playlist.total "
      :playlist=" playlist "
      :track-request-limit=" TRACK_REQUEST_LIMIT "
      @all-tracks-loaded=" () => { resetFilters(); refreshStats() } "
    />
  </div>

  <!-- No tracks in the playlist -->
  <div
    v-else
    id="no-tracks"
  >
    <h1>{{ $t("playlist.no-tracks-title") }}</h1>
    <h2>{{ $t("playlist.no-tracks-subtitle") }}</h2>
    <v-btn
      id="open-spotify"
      rounded="pill"
      size="x-large"
      variant="outlined"
      @click=" openPlaylistOnSpotify "
    >
      {{ $t("playlist.open-on-spotify") }}
      <v-img
        alt="Spotify Logo"
        src="@/assets/spotify.png"
        width="25"
      />
    </v-btn>
  </div>

  <DuplicatorPopup
    v-if=" startDuplication "
    :filter-tag=" filterTag "
    :new-tracks=" filteredTracks "
    :playlist-id=" playlist.id "
    @on-end="startDuplication = false"
  />
</template>

<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent, toRef } from 'vue'
import { useMeta } from 'vue-meta'

import { SpotifyArtist, SpotifyTrack } from '@/api/spotify/types/entities'
import DuplicatorPopup from '@/components/playlist_detail/DuplicatorPopup.vue'
import GenreChart from '@/components/playlist_detail/GenreChart.vue'
import LoadMoreTracksPopup from '@/components/playlist_detail/LoadMoreTracksPopup.vue'
import PlaylistMetaDisplay from '@/components/playlist_detail/PlaylistMetaDisplay.vue'
import TrackItem from '@/components/playlist_detail/TrackItem.vue'
import { Genre } from '@/genre'
import { API_TRACK_LIMIT, MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'
import { capitalize } from '@/utils/functions'

/**
 * It is used for typing Vuetify select slot props
 */

interface SlotProps {
  item: { raw: SpotifyArtist }
  index: number
}

/**
 *  Preference are used for filtering
 *  It refers to the tracks being in the My Music playlist or not
 */
const NO_PREFERENCE = 'All tracks'
const Preference = {
  ONLY_LIKED: 'Only liked',
  ONLY_NOT_LIKED: 'Only not liked',
  NO_PREFERENCE
} as const

type Preference = typeof Preference[keyof typeof Preference]

const NO_POPULARITY = 'No filter'
const Popularity = {
  Indie: 'Indie',
  Popular: 'Popular',
  NO_POPULARITY
} as const

type Popularity = typeof Popularity[keyof typeof Popularity]

export default defineComponent({
  name: 'PlaylistDetail',
  components: {
    DuplicatorPopup,
    GenreChart,
    LoadMoreTracksPopup,
    PlaylistMetaDisplay,
    TrackItem
  },
  props: {
    playlistId: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { playlists } = storeToRefs(playlistsStore)
    const playlist = toRef(playlists.value, props.playlistId)

    const { downloadPlaylistTracks } = playlistsStore

    useMeta({
      title: playlist.value.name
    })

    return {
      playlistsStore,
      playlist,
      downloadPlaylistTracks
    }
  },
  data () {
    return {
      TRACK_REQUEST_LIMIT: 150,

      // Need to use it this way to be able to type hint properly in template tag
      NO_POPULARITY: Popularity.NO_POPULARITY,
      NO_PREFERENCE: Preference.NO_PREFERENCE,

      selectedPopularity: Popularity.NO_POPULARITY as Popularity,
      selectedPreference: Preference.NO_PREFERENCE as Preference,
      selectedArtists: ([] as SpotifyArtist[]),
      selectedGenres: ([] as string[]),
      isFilterExclusive: true,

      processFilterUpdate: false,

      isHugePlaylist: false,
      playlistLoaded: false,

      // For child components
      topGenres: ([] as Genre[]),
      indiePercentage: 0,

      startDuplication: false,

      displayGoTopButton: false,
      displayDuplicateBadge: 'none',

      filteredTracks: ([] as SpotifyTrack[])
    }
  },
  computed: {
    generalTitle (): string {
      return this.filterTag || this.$t('track.all-tracks')
    },
    toButtonOpacity (): { opacity: number } {
      return { opacity: (this.displayGoTopButton) ? 100 : 0 }
    },
    numberOfActiveFilters (): number {
      return (
        this.selectedGenres.length +
        this.selectedArtists.length +
        +(this.selectedPopularity !== Popularity.NO_POPULARITY) +
        +(this.selectedPreference !== Preference.NO_PREFERENCE)
      )
    },
    filteringKeyword (): string {
      return this.isFilterExclusive ? this.$t('track.filters.keyword.and') : this.$t('track.filters.keyword.or')
    },
    filterTag (): string {
      return ([] as string[])
        .concat((this.selectedPopularity !== Popularity.NO_POPULARITY) ? [this.getTextForPopularity(this.selectedPopularity)] : [])
        .concat(this.selectedPreference !== Preference.NO_PREFERENCE ? [this.getTextForPreference(this.selectedPreference)] : [])
        .concat(this.selectedArtists.map(a => a.name))
        .concat(this.selectedGenres)
        .map(filter => capitalize(filter))
        .join(` ${this.filteringKeyword} `)
    },
    allTracksLoaded (): boolean {
      return this.playlist.tracks.length === this.playlist.total
    },
    isDuplicationAllowed (): boolean {
      return this.filteredTracks.length > 0 && this.numberOfActiveFilters > 0
    }
  },
  watch: {
    async selectedPopularity () {
      await this.applyFilters()
    },
    async selectedPreference () {
      await this.applyFilters()
    },
    async selectedArtists (currentArtists: SpotifyArtist[], previousArtists: SpotifyArtist[]) {
      if (previousArtists.length !== 0 || currentArtists.length !== 0) {
        await this.applyFilters()
      }
    },
    async selectedGenres (currentGenres: string[], previousGenres: string[]) {
      if (previousGenres.length !== 0 || currentGenres.length !== 0) {
        await this.applyFilters()
      }
    },
    async isFilterExclusive () {
      await this.applyFilters()
    },
    isDuplicationAllowed (isAllowed: boolean) {
      // Toggle UI badge (no clean way in Vuetify API)
      this.displayDuplicateBadge = isAllowed ? 'block' : 'none'
    }
  },
  async mounted () {
    this.TRACK_REQUEST_LIMIT = API_TRACK_LIMIT * 3
    if (this.playlist.id === MY_MUSIC_PLAYLIST_ID) {
      // Ensure to retrieve real track count for special endpoint
      await this.playlistsStore.refreshMyMusicTotalTrack()
    }
    await this.loadFirstTracks()

    this.filteredTracks = this.playlist.tracks
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
    /**
     * Filters all the tracks according to the filters chosen by the user
     */
    async applyFilters () {
      this.processFilterUpdate = true

      if (this.numberOfActiveFilters === 0) {
        this.resetFilters()
        this.processFilterUpdate = false
        return
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
      if (popularity !== Popularity.NO_POPULARITY) {
        const popularityFilter = (t: SpotifyTrack) => t.isIndie === (popularity === Popularity.Indie)

        if (this.isFilterExclusive) {
          newFilteredTracks = newFilteredTracks.filter(popularityFilter)
        } else {
          this.addTracksConserveUnicity(newFilteredTracks, playlistTracks.filter(popularityFilter))
        }
      }

      // Filter over preference (if track is in MyMusic playlist or not)
      const preference = this.selectedPreference
      if (preference !== Preference.NO_PREFERENCE) {
        const trackPreferences = await this.playlistsStore.tracksAreLiked(newFilteredTracks)
        const preferenceFilter = (t: SpotifyTrack) => trackPreferences[t.id] === (preference === Preference.ONLY_LIKED)

        if (this.isFilterExclusive) {
          newFilteredTracks = newFilteredTracks.filter(preferenceFilter)
        } else {
          this.addTracksConserveUnicity(newFilteredTracks, playlistTracks.filter(preferenceFilter))
        }
      }

      this.filteredTracks = newFilteredTracks
      this.processFilterUpdate = false
    },
    /**
     * Mix two list of Spotify tracks to form a set of all elements
     */
    addTracksConserveUnicity (filteredTracks: SpotifyTrack[], newFilteredTracks: SpotifyTrack[]) {
      const alreadyKnownTrackIds = filteredTracks.map(t => t.id)
      const tracksToAdd = newFilteredTracks.filter(t => !alreadyKnownTrackIds.includes(t.id))
      filteredTracks.push(...tracksToAdd)
    },
    resetFilters () {
      this.selectedGenres = []
      this.selectedArtists = []
      this.selectedPopularity = Popularity.NO_POPULARITY
      this.selectedPreference = Preference.NO_PREFERENCE
      this.filteredTracks = this.playlist.tracks
    },
    openPlaylistOnSpotify () {
      window.location.href = this.playlist.uri
    },
    getSortedArtists (): SpotifyArtist[] {
      // Need to have a set of object in JS ...
      const alreadyAddedArtistIds: string[] = []
      const artistsToReturn: SpotifyArtist[] = []

      for (const track of this.playlist.tracks) {
        for (const artist of track.artists) {
          if (!alreadyAddedArtistIds.includes(artist.id)) {
            artistsToReturn.push(artist)
            alreadyAddedArtistIds.push(artist.id)
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
    getVSelectTranslatedPopularities (): { label: string, value: Popularity }[] {
      return [
        { label: this.$t('track.filters.no-filter'), value: Popularity.NO_POPULARITY },
        { label: this.$t('track.filters.indie'), value: Popularity.Indie },
        { label: this.$t('track.filters.popular'), value: Popularity.Popular }
      ]
    },
    getTextForPreference (preference: Preference): string {
      const allPreference: Record<Preference, string> = {
        'All tracks': this.$t('track.filters.no-filter'),
        'Only liked': this.$t('track.filters.only-liked'),
        'Only not liked': this.$t('track.filters.only-not-liked')
      }
      return allPreference[preference]
    },
    getVSelectTranslatedPreferences (): { label: string, value: Preference }[] {
      return [
        { label: this.$t('track.filters.no-filter'), value: Preference.NO_PREFERENCE },
        { label: this.$t('track.filters.only-liked'), value: Preference.ONLY_LIKED },
        { label: this.$t('track.filters.only-not-liked'), value: Preference.ONLY_NOT_LIKED }
      ]
    },
    /**
     * Returns only top genres sorted by most to least popular
     */
    getTopGenres (): Genre[] {
      const limit = (window.innerWidth > 500) ? 25 : 10
      return this.playlistsStore.getTopGenres(this.playlistId, limit)
    },
    getColorForPopularity (popularity: Popularity): string {
      if (popularity === Popularity.Indie) return 'green'
      if (popularity === Popularity.Popular) return 'red'
      return '#ddd'
    },
    getColorForGenre (genre: string): string {
      return this.playlistsStore.genreColorMapping[genre]
    },
    getArtistImage (artist: SpotifyArtist): string {
      return artist.images[0]?.url || new URL('./../assets/no-user.png', import.meta.url).href
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
#filter-panel-title .v-expansion-panel-title__icon::after {
  /* Fave v-badge created from style only and not from Vuetify */
  content: "";

  width: 13px;
  height: 13px;

  position: absolute;
  right: 17px;
  top: 10px;

  border-radius: 10px;
  background: linear-gradient(180deg, #f3331e 20%, #e74c3c 51%, #f3331e 86%) !important;
}

#filters {
  padding: 5px 15px;

  display: flex;
  flex-direction: column;
}

#selectors {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

#stats-panel-content {
  border: 2px var(--text-color) solid;
}

#filters-panel-content {
  border: 2px var(--link-color) solid;
  border-radius: 0px 0px 5px 5px;
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
  margin: 2px 0px;
}

#filtering-chips>div+div::before {
  /* TODO Fix this */
  /* content: v-bind(filteringKeyword); */
  content: "&";
  margin: 0px 5px;
  padding-top: 3px;
}

#filtering-chips>div>span {
  margin: 1px;
}

#filtering-chips .genre-filter-chip {
  color: black;
}

#filtering-chips .artist-filter-chip {
  opacity: 0.9;
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

#popularity-select,
#loved-track-select {
  width: min(100%, 150px);

  display: inline-block;
}

#genre-select {
  width: min(100%, 400px);
}

#artist-select {
  width: min(100%, 400px);
  margin-bottom: 15px;
}

#artist-select .v-input {
  max-height: 40px;
}

#artist-select .v-input__control {
  max-height: 40px;
}

.v-chip .v-avatar {
  position: relative;
  right: 5px;
}

#warning-not-fully-loaded {
  margin-left: 10px;
  margin-bottom: 10px;
}

#create-new-playlist {
  float: right;
}

#create-new-playlist .v-badge__badge {
  display: v-bind(displayDuplicateBadge);

  bottom: calc(100% - 8px) !important;
  left: calc(100% - 60px) !important;
}

#create-new-playlist-btn {
  color: black;
  font-size: 10px;
}

/* Main section and track display */
#main-section {
  width: 100%;
  height: 100%;
  min-height: 250px;
  margin: 5px 0px;

  outline: 1px #F9B621AA solid;
  background-color: var(--primary-color);
  border-radius: 5px;
}

#list-title {
  display: flex;
  align-items: center;

  color: white;
  border-radius: 5px 5px 0px 0px;

  background: linear-gradient(180deg, #F9B621 0%, #F9B621AA 50%, var(--primary-color) 140%);
}

#list-title-embedded {
  width: 100%;
  padding-left: 10px;
}

#playlist-track-count-embedded {
  min-width: 70px;
}

#track-number-title {
  width: max-content;
  margin-right: 40px;
}

#tracks {
  margin: auto;
  height: 100%;
  padding: 0;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: stretch;
  align-content: center;

  background: none;
}

#tracks .v-list {
  padding: 0;
}

#no-track-div {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: center;
}

#no-valid-tracks {
  color: white;
  font-size: 20px;
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

  color: white;
  z-index: 1;

  transition: 0.2s all ease-out;
}

/* Transitions */
.chips-enter-active,
.chips-leave-active {
  transition: all 0.2s ease;
}

.chips-enter-from,
.chips-leave-to {
  opacity: 0;
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
