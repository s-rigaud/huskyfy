<template>
  <v-card
    v-if="playlistId"
    id="playlist-card"
  >
    <div id="playlist-meta">
      <div id="playlist-meta-left">
        <div
          id="playlist-image"
          @click="openPlaylistOnSpotify"
        >
          <v-img
            :src="playlistsStore.playlists[playlistId].images[0].url"
            alt="Cover image"
            cover
            lazy-src="@/assets/default_cover.jpg"
            rel="preconnect"
            width="90"
          />
        </div>
        <div id="title-container">
          <v-text-field
            v-if="userOwnsPlaylist && !isMyMusicPlaylist"
            id="playlist-name"
            v-model="playlistNameText"
            :append-inner-icon="nameUpdatedInAPI && playlistsStore.playlists[playlistId].name === playlistNameText ? 'mdi-check-circle-outline' : ''"
            :label="t('playlist.name')"
            :loading="playlistsStore.playlists[playlistId].name !== playlistNameText && !nameUpdatedInAPI"
            color="var(--huskyfy-orange)"
            density="compact"
            variant="outlined"
          />
          <h4
            v-else
            id="simplified-title"
            class="rainbow-text"
          >
            {{ playlistsStore.playlists[playlistId].name }}
          </h4>
          <div id="visibility-and-meta">
            <p> {{ getTextFromVisibility }} </p>
            <v-tooltip
              :text="t('playlist.contains-episodes-explanations')"
              class="rainbow-tooltip"
              location="bottom"
            >
              <template #activator="{ props }">
                <v-chip
                  v-if="playlistContainsEpisodes"
                  color="#f1c40f"
                  v-bind="props"
                  link
                  prepend-icon="mdi-alert"
                  size="small"
                  variant="elevated"
                >
                  {{ t('playlist.contains-episodes') }}
                </v-chip>
              </template>
            </v-tooltip>
            <v-tooltip
              :text="t('playlist.contains-local-tracks-explanations')"
              class="rainbow-tooltip"
              location="bottom"
            >
              <template #activator="{ props }">
                <v-chip
                  v-if="playlistContainsLocalTracks"
                  color="#f1c40f"
                  v-bind="props"
                  link
                  prepend-icon="mdi-alert"
                  size="small"
                  variant="elevated"
                >
                  {{ t('playlist.contains-local-tracks') }}
                </v-chip>
              </template>
            </v-tooltip>
            <v-tooltip
              :text="t('playlist.contains-duplicated-tracks-explanations')"
              class="rainbow-tooltip"
              location="bottom"
            >
              <template #activator="{ props }">
                <v-chip
                  v-if="playlistContainsDuplicatedTracks"
                  color="#f1c40f"
                  v-bind="props"
                  link
                  prepend-icon="mdi-alert"
                  size="small"
                  variant="elevated"
                >
                  {{ t('playlist.contains-duplicated-tracks') }}
                </v-chip>
              </template>
            </v-tooltip>
          </div>
          <p id="playlist-owner">
            {{ t("playlist.created-by") }}
            <span
              id="playlist-owner-name"
              @click.stop="openPlaylistOwnerSpotifyProfile"
            >
              {{ usernameToDisplay }}
            </span>
          </p>
          <p
            v-if="allTracksLoaded"
            id="percentage-row"
            :style="colorForPercentage"
          >
            <span>{{ t("playlist.indie-score-text") }}</span>
            <!-- Only if all tracks are loaded -->
            <span
              class="black-highlight"
              style="margin: 0px 5px;"
            >
              {{ ` ${indiePercentage}` }} %
            </span>
            <v-tooltip
              :text="t('playlist.explanation-indie-score')"
              class="rainbow-tooltip"
            >
              <template #activator="{ props }">
                <v-btn
                  id="help-indie-percentage"
                  :style="colorForPercentage"
                  v-bind="props"
                >
                  <v-icon size="x-small">
                    mdi-help
                  </v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </p>
        </div>
      </div>
      <v-tooltip
        :text="t('playlist.explanation-indie-score')"
        class="rainbow-tooltip"
        location="bottom"
      >
        <template #activator="{ props }">
          <IndieChart
            v-bind="props"
            :indie-percentage="indiePercentage"
            class="playlist-meta-middle"
          />
        </template>
      </v-tooltip>
      <div id="playlist-meta-right">
        <p>
          <span class="rainbow-text">{{ t('playlist.total-track-number') }}</span>
          <span
            ref="playlistTrackCount"
            class="playlist-metric"
          >
            {{ playlistsStore.playlists[playlistId].tracks.length.toFixed(0) }}
          </span>
        </p>
        <p v-show="allTracksLoaded">
          <span class="rainbow-text">{{ t('playlist.duration') }}</span>
          <span class="playlist-metric">
            {{ getPlaylistDuration() }}
          </span>
        </p>
      </div>
    </div>
    <v-card-text id="playlist-description">
      <p v-if="formattedDescription">
        {{ formattedDescription }}
      </p>
      <p
        v-else
        class="font-italic"
      >
        {{ t('playlist.no-description') }}
      </p>
    </v-card-text>

    <v-badge
      id="burger-button-badge"
      color="red"
      dot
    >
      <v-icon
        id="burger-button"
        class="highlight-icon"
        color="var(--huskyfy-orange)"
        icon="mdi-menu"
        size="x-large"
        @click="() => { drawer = !drawer; displayBurgerMenuBadge = 'none' }"
      />
    </v-badge>

    <v-tooltip
      :text="t('playlist.open-on-spotify')"
      class="rainbow-tooltip"
      location="bottom end"
    >
      <template #activator="{ props }">
        <v-img
          id="spotify-logo-meta-small"
          alt="Spotify Logo"
          v-bind="props"
          class="highlight-icon"
          rel="preconnect"
          src="@/assets/spotify.png"
          width="40"
          @click="openPlaylistOnSpotify"
        />
      </template>
    </v-tooltip>
  </v-card>

  <ActionDrawer
    v-model:open="drawer"
    :playlist-id="playlistId"
    @on-sort-end="() => { emit('playlistUpdated'); drawer = false }"
  />
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { debounce, DebouncedFunc } from 'lodash'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'

import ActionDrawer from '@/components/playlist_detail/ActionDrawer.vue'
import IndieChart from '@/components/playlist_detail/IndieChart.vue'
import { t } from '@/i18n'
import { MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { getAverageColor, HIGHEST_VALUE_COLOR, LOWEST_VALUE_COLOR } from '@/utils/colors'

const props = defineProps({
  playlistId: {
    type: String,
    required: true
  },
  indiePercentage: {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['playlistUpdated'])

const playlistsStore = usePlaylistsStore()
const currentUserUsername = useUserStore().username

const drawer = ref(false)
const displayBurgerMenuBadge = ref('block')
const playlistNameText = ref('')

/** Set to 0 to prepare for increment animation */
const playlistTrackCount = ref<HTMLElement | null>(null)

/**
 * Debounced function being call each time the user update the playlist name in the UI.
 * Once the user stop, an APi call is triggered to sync the playlist name.
 */
const updatePlaylistNameDebounced = ref<DebouncedFunc<() => Promise<void>> | null>(null)
const nameUpdatedInAPI = ref(false)

const getTextFromVisibility = computed((): string => {
  let visibility: string
  if (playlistsStore.playlists[props.playlistId].collaborative) visibility = 'collaborative'
  else if (playlistsStore.playlists[props.playlistId].public) visibility = 'public'
  else visibility = 'private'

  return t(`playlist.${visibility}`) + ' ' + t(`_emojis.${visibility}`)
})
const usernameToDisplay = computed((): string => {
  const playlistCreator = playlistsStore.playlists[props.playlistId].owner.display_name
  return currentUserUsername === playlistCreator ? t('playlist.you') : playlistCreator
})
const allTracksLoaded = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].tracks.length === playlistsStore.playlists[props.playlistId].total
})
const colorForPercentage = computed((): { color: string } => {
  const color = getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, props.indiePercentage)
  return { color }
})
const formattedDescription = computed((): string => {
  return (
    playlistsStore.playlists[props.playlistId].description
      // Remove html markups from content
      .replace(/(<([^>]+)>)/ig, '')
      // Escaped " back to real character
      .replace(/&quot;/ig, '"')
      // Escaped / back to real character
      .replace(/&#x2F;/ig, '/')
  )
})
const userOwnsPlaylist = computed((): boolean => {
  return currentUserUsername === playlistsStore.playlists[props.playlistId].owner.display_name
})
const isMyMusicPlaylist = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].id === MY_MUSIC_PLAYLIST_ID
})
const playlistContainsLocalTracks = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].containsLocalTracks
})
const playlistContainsEpisodes = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].containsEpisodes
})
const playlistContainsDuplicatedTracks = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].containsDuplicatedTracks
})

watch(playlistNameText, (currentText: string) => {
  if (currentText && currentText !== playlistsStore.playlists[props.playlistId].name && updatePlaylistNameDebounced.value) {
    nameUpdatedInAPI.value = false
    updatePlaylistNameDebounced.value()
  }
})

onBeforeMount(() => {
  updatePlaylistNameDebounced.value = debounce(
    async () => {
      await playlistsStore.updatePlaylistName(props.playlistId, playlistNameText.value)
      nameUpdatedInAPI.value = true
    },
    2000
  )
  playlistNameText.value = playlistsStore.playlists[props.playlistId].name
})

onMounted(() => gsap.from(
  playlistTrackCount.value,
  {
    textContent: 0,
    duration: 4,
    snap: { textContent: 1 },
    stagger: 1
  }
))

const openPlaylistOnSpotify = () => {
  window.location.href = playlistsStore.playlists[props.playlistId].uri
}
const openPlaylistOwnerSpotifyProfile = () => {
  window.location.href = playlistsStore.playlists[props.playlistId].owner.uri
}
const getPlaylistDuration = (): string => {
  return playlistsStore.getPlaylistFullLength(props.playlistId)
}
</script>

<style>
#playlist-card {
  width: 100%;
  margin: 5px 0px;
  padding-bottom: 5px;

  flex-shrink: 0;
  background: radial-gradient(circle, var(--huskyfy-black) 80%, #F3920099 100%);
  border: 1px #F3920099 solid;
}

#playlist-meta {
  padding: 10px 10px 0px 10px;

  display: flex;
}

#playlist-meta-left {
  width: 100%;

  display: flex;
}

#genre-chart-container {
  width: 246px;

  display: none !important;
}

.playlist-meta-middle {
  cursor: pointer;
}

#playlist-meta-right {
  display: none;

  width: 50%;
  margin-top: 2px;
  margin-right: 50px;
  padding: 10px;

  background-color: var(--huskyfy-black);
  border: 1px grey solid;
  border-radius: 5px;
}

#playlist-image {
  margin: 5px 5px 5px -5px;

  cursor: pointer;
}

#title-container {
  width: calc(100% - 140px);
  margin-left: 5px;

  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

/* Title v-select hidden second bar */
#title-container input {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

#title-container .v-input {
  flex-grow: 0;
}

/* Title v-select hidden second bar */
#title-container .v-input__details {
  display: none;
}

/* Title select icon color */
#title-container .mdi-check-circle-outline {
  color: var(--huskyfy-orange);
  opacity: 0.9;
}

#simplified-title {
  position: relative;
  top: -4px;

  font-size: 20px;
}

#playlist-name {
  margin-right: 10px;

  color: var(--huskyfy-orange);
  cursor: pointer;
}

#visibility-and-meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

#visibility-and-meta>*+* {
  margin-left: 5px;
}

#playlist-owner {
  opacity: 0.8;

  display: none;
}

#playlist-owner-name:hover {
  cursor: pointer;
  text-decoration: underline;
}

#percentage-row {
  align-items: center;
}

#playlist-description {
  padding: 5px 10px 0px 10px;

  font-size: 14px;
}

.playlist-metric {
  margin-left: 5px;
}

#help-indie-percentage {
  min-width: fit-content;
  height: 23px;
  margin-left: 5px;
  padding: 0;

  position: relative;
  top: 2px;

  border: 2px var(--huskyfy-orange) solid;
  border-radius: 5px;
  background-color: var(--huskyfy-black);
}

#help-indie-percentage:hover {
  background-color: var(--huskyfy-orange);
  border-color: var(--huskyfy-black);
}

#help-indie-percentage .v-icon {
  padding: 8px 9px;

  color: var(--huskyfy-orange);
}

#help-indie-percentage:hover .v-icon {
  color: var(--huskyfy-black);
}

#help-indie-percentage .v-btn--size-default {
  min-width: fit-content;
}

.rainbow-tooltip .v-overlay__content {
  background-color: var(--huskyfy-black) !important;
  color: var(--huskyfy-orange) !important;
  border: var(--huskyfy-orange) 2px solid;
  outline: var(--huskyfy-black) 0.5px solid;
}

#spotify-logo-meta-small {
  position: absolute;
  top: 70px;
  right: 7px;

  cursor: pointer;
  outline: 1px var(--huskyfy-orange) solid;
  border-radius: 5px;
  background: var(--huskyfy-black);
}

#spotify-logo-meta-small .v-img__img {
  padding: 5px;
}

.highlight-icon {
  box-shadow: 0 3px 5px -1px var(--huskyfy-orange), 0 1px 10px 0 var(--huskyfy-orange) !important;
}

/* Button to display vertical sidebar */
#burger-button {
  padding: 20px;

  border: 1px var(--huskyfy-orange) solid;
  border-radius: 5px;
  background-color: black;
}

#burger-button-badge {
  position: absolute;
  top: 12px;
  right: 5px;
}

#burger-button-badge .v-badge__badge {
  height: 13px;
  width: 13px;

  display: v-bind(displayBurgerMenuBadge);
  bottom: calc(100% - 10px) !important;
  left: calc(100% - 10px) !important;

  border-radius: 10px;
  background: linear-gradient(180deg, #c0392b 20%, #e74c3c 51%, #c0392b 86%) !important;
}

.mdi-menu:hover:before {
  content: "\F006D"
}

@media only screen and (min-width: 768px) {
  #playlist-meta-left {
    width: 40%;
    margin-left: 5px;
  }

  #title-container {
    width: 100%;
  }

  #playlist-owner {
    display: block !important;
  }

  #percentage-row {
    display: none !important;
  }

  #genre-chart-container {
    display: flex !important;
  }

  #playlist-meta-right {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  #spotify-logo-meta-small {
    top: 70px;
  }

  #playlist-description {
    font-size: 16px;
  }
}
</style>
