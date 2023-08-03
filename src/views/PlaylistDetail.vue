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

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { toRef, computed, onBeforeMount, ref, watch, toRefs } from 'vue'
import { useMeta } from 'vue-meta'

import { SpotifyArtist, SpotifyTrack } from '@/api/spotify/types/entities'
import DuplicatorPopup from '@/components/playlist_detail/DuplicatorPopup.vue'
import GenreChart from '@/components/playlist_detail/GenreChart.vue'
import LoadMoreTracksPopup from '@/components/playlist_detail/LoadMoreTracksPopup.vue'
import PlaylistMetaDisplay from '@/components/playlist_detail/PlaylistMetaDisplay.vue'
import TrackItem from '@/components/playlist_detail/TrackItem.vue'
import { Genre } from '@/genre'
import { t } from '@/i18n'
import { API_TRACK_LIMIT, MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'
import { capitalize } from '@/utils/functions'

/** It is used for typing Vuetify select slot props */
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

const props = defineProps({
  playlistId: {
    type: String,
    required: true
  }
})
const playlistsStore = usePlaylistsStore()

// Shorthand
const { playlists } = storeToRefs(playlistsStore)
const { playlistId } = toRefs(props)
const playlist = toRef(playlists.value, playlistId.value)

const { downloadPlaylistTracks } = playlistsStore

useMeta({
  title: playlist.value.name
})

const TRACK_REQUEST_LIMIT = ref(150)

const selectedPopularity = ref(Popularity.NO_POPULARITY)
const selectedPreference = ref(Preference.NO_PREFERENCE)
const selectedArtists = ref<SpotifyArtist[]>([])
const selectedGenres = ref<string[]>([])
const isFilterExclusive = ref(true)

const processFilterUpdate = ref(false)

const isHugePlaylist = ref(false)
const playlistLoaded = ref(false)

// For child components
const topGenres = ref<Genre[]>([])
const indiePercentage = ref(0)

const startDuplication = ref(false)

const displayGoTopButton = ref(false)
const displayDuplicateBadge = ref('none')

const filteredTracks = ref<SpotifyTrack[]>([])

const generalTitle = computed((): string => {
  return filterTag.value || t('track.all-tracks')
})
const toButtonOpacity = computed((): { opacity: number } => {
  return { opacity: (displayGoTopButton.value) ? 100 : 0 }
})
const numberOfActiveFilters = computed((): number => {
  return (
    selectedGenres.value.length +
    selectedArtists.value.length +
    +(selectedPopularity.value !== Popularity.NO_POPULARITY) +
    +(selectedPreference.value !== Preference.NO_PREFERENCE)
  )
})
const filteringKeyword = computed((): string => {
  return isFilterExclusive.value ? t('track.filters.keyword.and') : t('track.filters.keyword.or')
})
const filterTag = computed((): string => {
  return ([] as string[])
    .concat((selectedPopularity.value !== Popularity.NO_POPULARITY) ? [getTextForPopularity(selectedPopularity.value)] : [])
    .concat(selectedPreference.value !== Preference.NO_PREFERENCE ? [getTextForPreference(selectedPreference.value)] : [])
    .concat(selectedArtists.value.map(a => a.name))
    .concat(selectedGenres.value)
    .map(filter => capitalize(filter))
    .join(` ${filteringKeyword.value} `)
})
const allTracksLoaded = computed((): boolean => {
  return playlist.value.tracks.length === playlist.value.total
})
const isDuplicationAllowed = computed((): boolean => {
  return filteredTracks.value.length > 0 && numberOfActiveFilters.value > 0
})

watch(selectedPopularity, async () => {
  await applyFilters()
})
watch(selectedPreference, async () => {
  await applyFilters()
})
watch(selectedArtists, async (currentArtists: SpotifyArtist[], previousArtists: SpotifyArtist[]) => {
  if (previousArtists.length !== 0 || currentArtists.length !== 0) {
    await applyFilters()
  }
})
watch(selectedGenres, async (currentGenres: string[], previousGenres: string[]) => {
  if (previousGenres.length !== 0 || currentGenres.length !== 0) {
    await applyFilters()
  }
})
watch(isFilterExclusive, async () => {
  await applyFilters()
})
watch(isDuplicationAllowed, (isAllowed: boolean) => {
  // Toggle UI badge (no clean way in Vuetify API)
  displayDuplicateBadge.value = isAllowed ? 'block' : 'none'
})

onBeforeMount(async () => {
  TRACK_REQUEST_LIMIT.value = API_TRACK_LIMIT * 3
  if (playlist.value.id === MY_MUSIC_PLAYLIST_ID) {
    // Ensure to retrieve real track count for special endpoint
    await playlistsStore.refreshMyMusicTotalTrack()
  }
  await loadFirstTracks()

  filteredTracks.value = playlist.value.tracks
})

const onScroll = () => {
  displayGoTopButton.value = (window.scrollY > 100)
}
const loadFirstTracks = async () => {
  // Only asking for the right number of tracks as we already know how many tracks are in the playlist
  const maxLimit = Math.min(TRACK_REQUEST_LIMIT.value, playlist.value.total)
  await downloadPlaylistTracks(props.playlistId, maxLimit)

  isHugePlaylist.value = playlist.value.total > TRACK_REQUEST_LIMIT.value
  playlistLoaded.value = true
  topGenres.value = getTopGenres()
  indiePercentage.value = getIndiePercentage()
  resetFilters()
}
const refreshStats = () => {
  topGenres.value = getTopGenres()
  indiePercentage.value = getIndiePercentage()
}
const getIndiePercentage = (): number => {
  return playlistsStore.getIndiePercentage(props.playlistId)
}

/**
 * Filters all the tracks according to the filters chosen by the user
 */
const applyFilters = async () => {
  processFilterUpdate.value = true

  if (numberOfActiveFilters.value === 0) {
    resetFilters()
    processFilterUpdate.value = false
    return
  }

  const playlistTracks = playlist.value.tracks
  let newFilteredTracks = playlist.value.tracks

  // Filter over genres
  const genres = selectedGenres.value
  if (genres.length > 0) {
    if (isFilterExclusive.value) {
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
  const artistIds = selectedArtists.value.map((a) => a.id)
  if (artistIds.length > 0) {
    if (isFilterExclusive.value) {
      newFilteredTracks = newFilteredTracks.filter(
        (t) => artistIds.every((artistId) => t.artists.map(a => a.id).includes(artistId))
      )
    } else {
      const validArtistTracks = playlistTracks.filter(
        (t) => artistIds.some((artistId) => t.artists.map(a => a.id).includes(artistId))
      )
      addTracksConserveUnicity(newFilteredTracks, validArtistTracks)
    }
  }

  // Filter over popularity
  const popularity = selectedPopularity.value
  if (popularity !== Popularity.NO_POPULARITY) {
    const popularityFilter = (t: SpotifyTrack) => t.isIndie === (popularity === Popularity.Indie)

    if (isFilterExclusive.value) {
      newFilteredTracks = newFilteredTracks.filter(popularityFilter)
    } else {
      addTracksConserveUnicity(newFilteredTracks, playlistTracks.filter(popularityFilter))
    }
  }

  // Filter over preference (if track is in MyMusic playlist or not)
  const preference = selectedPreference.value
  if (preference !== Preference.NO_PREFERENCE) {
    const trackPreferences = await playlistsStore.tracksAreLiked(newFilteredTracks)
    const preferenceFilter = (t: SpotifyTrack) => trackPreferences[t.id] === (preference === Preference.ONLY_LIKED)

    if (isFilterExclusive.value) {
      newFilteredTracks = newFilteredTracks.filter(preferenceFilter)
    } else {
      addTracksConserveUnicity(newFilteredTracks, playlistTracks.filter(preferenceFilter))
    }
  }

  filteredTracks.value = newFilteredTracks
  processFilterUpdate.value = false
}

/**
 * Mix two list of Spotify tracks to form a set of all elements
 */
const addTracksConserveUnicity = (filteredTracks: SpotifyTrack[], newFilteredTracks: SpotifyTrack[]) => {
  const alreadyKnownTrackIds = filteredTracks.map(t => t.id)
  const tracksToAdd = newFilteredTracks.filter(t => !alreadyKnownTrackIds.includes(t.id))
  filteredTracks.push(...tracksToAdd)
}

const resetFilters = () => {
  selectedGenres.value = []
  selectedArtists.value = []
  selectedPopularity.value = Popularity.NO_POPULARITY
  selectedPreference.value = Preference.NO_PREFERENCE
  filteredTracks.value = playlist.value.tracks
}

const openPlaylistOnSpotify = () => {
  window.location.href = playlist.value.uri
}

const getSortedArtists = (): SpotifyArtist[] => {
  // Need to have a set of object in JS ...
  const alreadyAddedArtistIds: string[] = []
  const artistsToReturn: SpotifyArtist[] = []

  for (const track of playlist.value.tracks) {
    for (const artist of track.artists) {
      if (!alreadyAddedArtistIds.includes(artist.id)) {
        artistsToReturn.push(artist)
        alreadyAddedArtistIds.push(artist.id)
      }
    }
  }
  return artistsToReturn.sort((a1, a2) => a1.name.localeCompare(a2.name))
}

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getTextForPopularity = (popularity: Popularity): string => {
  const allPopularities: Record<Popularity, string> = {
    Indie: t('track.filters.indie'),
    Popular: t('track.filters.popular'),
    'No filter': t('track.filters.no-filter')
  }
  return allPopularities[popularity]
}

const getVSelectTranslatedPopularities = (): { label: string, value: Popularity }[] => {
  return [
    { label: t('track.filters.no-filter'), value: Popularity.NO_POPULARITY },
    { label: t('track.filters.indie'), value: Popularity.Indie },
    { label: t('track.filters.popular'), value: Popularity.Popular }
  ]
}

const getTextForPreference = (preference: Preference): string => {
  const allPreference: Record<Preference, string> = {
    'All tracks': t('track.filters.no-filter'),
    'Only liked': t('track.filters.only-liked'),
    'Only not liked': t('track.filters.only-not-liked')
  }
  return allPreference[preference]
}

const getVSelectTranslatedPreferences = (): { label: string, value: Preference }[] => {
  return [
    { label: t('track.filters.no-filter'), value: Preference.NO_PREFERENCE },
    { label: t('track.filters.only-liked'), value: Preference.ONLY_LIKED },
    { label: t('track.filters.only-not-liked'), value: Preference.ONLY_NOT_LIKED }
  ]
}

/**
 * Returns only top genres sorted by most to least popular
 */
const getTopGenres = (): Genre[] => {
  const limit = (window.innerWidth > 500) ? 25 : 10
  return playlistsStore.getTopGenres(props.playlistId, limit)
}

const getColorForPopularity = (popularity: Popularity): string => {
  if (popularity === Popularity.Indie) return 'green'
  if (popularity === Popularity.Popular) return 'red'
  return '#ddd'
}

const getColorForGenre = (genre: string): string => {
  return playlistsStore.genreColorMapping[genre]
}

const getArtistImage = (artist: SpotifyArtist): string => {
  return artist.images[0]?.url || new URL('./../assets/no-user.png', import.meta.url).href
}
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
