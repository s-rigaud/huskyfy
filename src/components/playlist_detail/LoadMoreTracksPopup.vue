<template>
  <!-- Ask the user if he really want to load all the tracks for a huge playlist (> 150 tracks) -->
  <!-- This allow to lazy load playlist tracks -->
  <v-snackbar
    id="load-more-snackbar"
    v-model="isVisible"
    :timeout="timeout"
    :color="color"
  >
    <div
      v-if="!isLoaded"
      id="ask-and-load"
    >
      <div id="loading-create-new-playlist">
        <p class="rainbow-text">
          {{ $t("playlist.load-more-warning", { limit: trackRequestLimit }) }}
        </p>
      </div>
      <v-btn
        id="load-more-button"
        class="rainbow-v-btn"
        :loading="waitingForResponse"
        @click="loadAllTracks"
      >
        {{ $t("playlist.load-more-button") }}
      </v-btn>
    </div>

    <div
      v-else
      id="loaded"
    >
      {{ $t("playlist.fully-loaded") }}
      <v-icon icon="mdi-checkbox-marked-circle" />
    </div>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import { usePlaylistsStore } from '@/stores/playlists'

export default defineComponent({
  name: 'LoadMoreTracksPopup',
  props: {
    playlist: {
      type: Object as PropType<SpotifyPlaylist>,
      required: true
    },
    trackRequestLimit: {
      type: Number,
      required: true
    }
  },
  emits: ['allTracksLoaded'],
  setup () {
    const playlistsStore = usePlaylistsStore()
    const { downloadPlaylistTracks } = playlistsStore

    return { downloadPlaylistTracks, playlistsStore }
  },
  data () {
    return {
      isVisible: true,

      isLoaded: false,
      waitingForResponse: false
    }
  },
  computed: {
    color (): string {
      return this.isLoaded ? 'green' : 'black'
    },
    timeout (): number {
      return this.isLoaded ? 3000 : -1
    }
  },
  methods: {
    /**
     * Download tracks from Spotify API and add them to localStorage.
     * Then, it emits to notify parent component.
     */
    async loadAllTracks () {
      this.waitingForResponse = true
      // Arbitrary
      if (this.playlist.total > 500) {
        this.playlistsStore.softReset(this.playlist.id)
      }
      await this.downloadPlaylistTracks(this.playlist.id, this.playlist.total)
      this.waitingForResponse = false
      this.isLoaded = true
      this.$emit('allTracksLoaded')
    }
  }
})
</script>
<style>
#load-more-button {
  width: 100%;
}

#load-more-snackbar .v-snackbar__content {
  display: flex;
  flex-direction: column;
}
</style>
