<template>
  <v-card id="playlist-card" v-if="playlistId">
    <div id="playlist-meta">
      <div id="playlist-meta-left">
        <div id="playlist-image" @click.self="openPlaylistOnSpotify">
          <v-img v-bind:src="playlist.images[0].url" lazy-src='@/assets/default_cover.jpg' alt="Cover image" cover
            rel="preconnect" width="90">
          </v-img>
        </div>
        <div id="title-container">
          <v-text-field v-model="playlistNameText" v-if="userOwnsPlaylist && !isMyMusicPlaylist" id="playlist-name"
            :label="$t('playlist.name')" variant="outlined" color="var(--text-color)" density="compact"
            :loading="playlist.name !== playlistNameText && !nameUpdatedInAPI"
            :append-inner-icon="nameUpdatedInAPI && playlist.name === playlistNameText ? 'mdi-check-circle-outline' : ''">
          </v-text-field>
          <h4 v-else id="simplified-title" class="rainbow-text">{{ playlist.name }}</h4>
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
      <v-icon id="burger-button" @click="() => { drawer = !drawer; displayBurgerMenuBadge = 'none' }" icon="mdi-menu"
        color="var(--text-color)" size="x-large" class="highlight-icon">
      </v-icon>
    </v-badge>

    <v-tooltip location="bottom end" :text="$t('playlist.open-on-spotify')" class="rainbow-tooltip">
      <template v-slot:activator="{ props }">
        <v-img id="spotify-logo-meta-small" @click="openPlaylistOnSpotify" src="@/assets/spotify.png" alt="Spotify Logo"
          rel="preconnect" width="40" v-bind="props" class="highlight-icon">
        </v-img>
      </template>
    </v-tooltip>
  </v-card>

  <ActionDrawer :open="drawer" :playlistId="playlistId" @on-close="drawer = false"
    @on-sort-end="() => { $emit('playlistUpdated'); drawer = false }" />
</template>

<script lang="ts">
import _ from 'lodash'
import { storeToRefs } from 'pinia'
import { defineComponent, StyleValue, toRef } from 'vue'

import ActionDrawer from '@/components/playlist_detail/ActionDrawer.vue'
import IndieChart, { HIGHEST_VALUE_COLOR, LOWEST_VALUE_COLOR } from '@/components/playlist_detail/IndieChart.vue'
import { getAverageColor } from '@/services/colors'
import { MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'PlaylistMetaDisplay',
  components: {
    ActionDrawer,
    IndieChart
  },
  emits: ['playlistUpdated'],
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

      debouncedUpdateNameFunction: (null as _.DebouncedFunc<() => Promise<void>> | null),
      nameUpdatedInAPI: false
    }
  },
  beforeMount () {
    this.debouncedUpdateNameFunction = _.debounce(
      async () => {
        await this.playlistsStore.updatePlaylistName(this.playlistId, this.playlistNameText)
        this.nameUpdatedInAPI = true
      },
      2000
    )
    this.playlistNameText = this.playlist.name
  },
  computed: {
    getTextFromVisibility (): string {
      if (this.playlist.collaborative) {
        return this.$t('playlist.collaborative') + ' ' + this.$t('_emojis.collaborative')
      }
      if (this.playlist.public) return this.$t('playlist.public') + ' ' + this.$t('_emojis.public')
      return this.$t('playlist.private') + ' ' + this.$t('_emojis.private')
    },
    usernameToDisplay (): string {
      const playlistCreator = this.playlist.owner.display_name
      return this.currentUserUsername === playlistCreator ? this.$t('playlist.you') : playlistCreator
    },
    allTracksLoaded (): boolean {
      return this.playlist.tracks.length === this.playlist.total
    },
    colorForPercentage (): StyleValue {
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
    }
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
  },
  watch: {
    playlistNameText (newValue: string) {
      if (newValue !== this.playlist.name && newValue) {
        this.nameUpdatedInAPI = false
        // eslint-disable-next-line
        this.debouncedUpdateNameFunction!()
      }
    }
  }
})
</script>
<style>
#playlist-card {
  width: 100%;
  margin: 5px 0px;

  border: 2px var(--text-color) solid;
  flex-shrink: 0
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

  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

/* Title v-select hidden second bar */
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

/* Title is always clearly visible */
#title-container .v-field--disabled {
  opacity: 1;
}

/* Hide input boundaries when input disabled */
#title-container .v-input--disabled .v-field__field {
  position: relative;
  left: -16px;
  top: -8px;
}

/* Hide input boundaries when input disabled */
#title-container .v-input--disabled .v-field__outline {
  display: none;
}

#playlist-name {
  margin-right: 10px;

  color: var(--text-color);
  cursor: pointer;
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
  padding: 5px 10px;
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
}
</style>