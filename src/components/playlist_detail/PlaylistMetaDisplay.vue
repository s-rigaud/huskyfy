<template>
  <v-card
    v-if="playlistId"
    id="playlist-card"
  >
    <div id="playlist-meta">
      <div id="playlist-meta-left">
        <div
          id="playlist-image"
          @click.self="openPlaylistOnSpotify"
        >
          <v-img
            :src="playlist.images[0].url"
            lazy-src="@/assets/default_cover.jpg"
            alt="Cover image"
            cover
            rel="preconnect"
            width="90"
          />
        </div>
        <div id="title-container">
          <v-text-field
            v-if="userOwnsPlaylist && !isMyMusicPlaylist"
            id="playlist-name"
            v-model="playlistNameText"
            :label="$t('playlist.name')"
            variant="outlined"
            color="var(--text-color)"
            density="compact"
            :loading="playlist.name !== playlistNameText && !nameUpdatedInAPI"
            :append-inner-icon="nameUpdatedInAPI && playlist.name === playlistNameText ? 'mdi-check-circle-outline' : ''"
          />
          <h4
            v-else
            id="simplified-title"
            class="rainbow-text"
          >
            {{ playlist.name }}
          </h4>
          <div id="visibility-and-meta">
            <p> {{ getTextFromVisibility }} </p>
            <v-tooltip
              :text="$t('playlist.contains-episodes-explanations')"
              class="rainbow-tooltip"
              location="bottom"
            >
              <template #activator="{ props }">
                <v-chip
                  v-if="playlistContainsEpisodes"
                  prepend-icon="mdi-alert"
                  color="#f1c40f"
                  size="small"
                  variant="elevated"
                  v-bind="props"
                  link
                >
                  {{ $t('playlist.contains-episodes') }}
                </v-chip>
              </template>
            </v-tooltip>
            <v-tooltip
              :text="$t('playlist.contains-local-tracks-explanations')"
              class="rainbow-tooltip"
              location="bottom"
            >
              <template #activator="{ props }">
                <v-chip
                  v-if="playlistContainsLocalTracks"
                  prepend-icon="mdi-alert"
                  color="#f1c40f"
                  size="small"
                  variant="elevated"
                  v-bind="props"
                  link
                >
                  {{ $t('playlist.contains-local-tracks') }}
                </v-chip>
              </template>
            </v-tooltip>
            <v-tooltip
              :text="$t('playlist.contains-duplicated-tracks-explanations')"
              class="rainbow-tooltip"
              location="bottom"
            >
              <template #activator="{ props }">
                <v-chip
                  v-if="playlistContainsDuplicatedTracks"
                  prepend-icon="mdi-alert"
                  color="#f1c40f"
                  size="small"
                  variant="elevated"
                  v-bind="props"
                  link
                >
                  {{ $t('playlist.contains-duplicated-tracks') }}
                </v-chip>
              </template>
            </v-tooltip>
          </div>
          <p id="playlist-owner">
            {{ $t("playlist.created-by") }}
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
            <span class="rainbow-text">{{ $t("playlist.indie-score-text") }}</span>
            <!-- Only if all tracks are loaded -->
            <span
              style="margin: 0px 5px;"
              class="black-highlight"
            >
              {{ ` ${indiePercentage}` }} %
            </span>
            <v-tooltip
              :text="$t('playlist.explanation-indie-score')"
              class="rainbow-tooltip"
            >
              <template #activator="{ props }">
                <v-btn
                  id="help-indie-percentage"
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
        :text="$t('playlist.explanation-indie-score')"
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
      <p v-if="formattedDescription">
        {{ formattedDescription }}
      </p>
      <p
        v-else
        class="font-italic"
      >
        {{ $t('playlist.no-description') }}
      </p>
    </v-card-text>

    <v-badge
      id="burger-button-badge"
      color="red"
      dot
    >
      <v-icon
        id="burger-button"
        icon="mdi-menu"
        color="var(--text-color)"
        size="x-large"
        class="highlight-icon"
        @click="() => { drawer = !drawer; displayBurgerMenuBadge = 'none' }"
      />
    </v-badge>

    <v-tooltip
      location="bottom end"
      :text="$t('playlist.open-on-spotify')"
      class="rainbow-tooltip"
    >
      <template #activator="{ props }">
        <v-img
          id="spotify-logo-meta-small"
          src="@/assets/spotify.png"
          alt="Spotify Logo"
          rel="preconnect"
          width="40"
          v-bind="props"
          class="highlight-icon"
          @click="openPlaylistOnSpotify"
        />
      </template>
    </v-tooltip>
  </v-card>

  <ActionDrawer
    :open="drawer"
    :playlist-id="playlistId"
    @on-close="drawer = false"
    @on-sort-end="() => { $emit('playlistUpdated'); drawer = false }"
  />
</template>

<script lang="ts">
import { debounce, DebouncedFunc } from 'lodash'
import { storeToRefs } from 'pinia'
import { defineComponent, toRef } from 'vue'

import ActionDrawer from '@/components/playlist_detail/ActionDrawer.vue'
import IndieChart, { HIGHEST_VALUE_COLOR, LOWEST_VALUE_COLOR } from '@/components/playlist_detail/IndieChart.vue'
import { MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { getAverageColor } from '@/utils/colors'

export default defineComponent({
  name: 'PlaylistMetaDisplay',
  components: {
    ActionDrawer,
    IndieChart
  },
  props: {
    playlistId: {
      type: String,
      required: true
    },
    indiePercentage: {
      type: Number,
      required: true
    }
  },
  emits: ['playlistUpdated'],
  setup (props) {
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { playlists } = storeToRefs(playlistsStore)
    const playlist = toRef(playlists.value, props.playlistId)

    const currentUserUsername = useUserStore().username

    return {
      playlistsStore,
      playlist,
      currentUserUsername
    }
  },
  data () {
    return {
      drawer: false,
      displayBurgerMenuBadge: 'block',
      playlistNameText: '',

      updatePlaylistNameDebounced: (null as DebouncedFunc<() => Promise<void>> | null),
      nameUpdatedInAPI: false
    }
  },
  computed: {
    getTextFromVisibility (): string {
      let visibility: string
      if (this.playlist.collaborative) visibility = 'collaborative'
      else if (this.playlist.public) visibility = 'public'
      else visibility = 'private'

      return this.$t(`playlist.${visibility}`) + ' ' + this.$t(`_emojis.${visibility}`)
    },
    usernameToDisplay (): string {
      const playlistCreator = this.playlist.owner.display_name
      return this.currentUserUsername === playlistCreator ? this.$t('playlist.you') : playlistCreator
    },
    allTracksLoaded (): boolean {
      return this.playlist.tracks.length === this.playlist.total
    },
    colorForPercentage (): { color: string } {
      const color = getAverageColor(LOWEST_VALUE_COLOR, HIGHEST_VALUE_COLOR, this.indiePercentage)
      return { color }
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
    userOwnsPlaylist (): boolean {
      return this.currentUserUsername === this.playlist.owner.display_name
    },
    isMyMusicPlaylist (): boolean {
      return this.playlist.id === MY_MUSIC_PLAYLIST_ID
    },
    playlistContainsLocalTracks (): boolean {
      return this.playlist.containsLocalTracks
    },
    playlistContainsEpisodes (): boolean {
      return this.playlist.containsEpisodes
    },
    playlistContainsDuplicatedTracks (): boolean {
      return this.playlist.containsDuplicatedTracks
    }
  },
  watch: {
    playlistNameText (newValue: string) {
      if (newValue !== this.playlist.name && newValue) {
        this.nameUpdatedInAPI = false
        // eslint-disable-next-line
        this.updatePlaylistNameDebounced!()
      }
    }
  },
  beforeMount () {
    this.updatePlaylistNameDebounced = debounce(
      async () => {
        await this.playlistsStore.updatePlaylistName(this.playlistId, this.playlistNameText)
        this.nameUpdatedInAPI = true
      },
      2000
    )
    this.playlistNameText = this.playlist.name
  },
  methods: {
    openPlaylistOnSpotify () {
      window.location.href = this.playlist.uri
    },
    openPlaylistOwnerSpotifyProfile () {
      window.location.href = this.playlist.owner.uri
    },
    getPlaylistDuration (): string {
      return this.playlistsStore.getPlaylistFullLength(this.playlistId)
    }
  }
})
</script>
<style>
#playlist-card {
  width: 100%;
  margin: 5px 0px;
  padding-bottom: 5px;

  flex-shrink: 0;
  background: radial-gradient(circle, var(--primary-color) 80%, #F3920099 100%);
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

  background-color: var(--primary-color);
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
  color: var(--text-color);
  opacity: 0.9;
}

#simplified-title {
  position: relative;
  top: -4px;

  font-size: 20px;
}

#playlist-name {
  margin-right: 10px;

  color: var(--text-color);
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

#spotify-logo-meta-small {
  position: absolute;
  top: 70px;
  right: 7px;

  cursor: pointer;
  outline: 1px var(--text-color) solid;
  border-radius: 5px;
  background: var(--primary-color);
}

#spotify-logo-meta-small .v-img__img {
  padding: 5px;
}

.highlight-icon {
  box-shadow: 0 3px 5px -1px var(--text-color), 0 1px 10px 0 var(--text-color) !important;
}

/* Button to display vertical sidebar */
#burger-button {
  padding: 20px;

  border: 1px var(--text-color) solid;
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
