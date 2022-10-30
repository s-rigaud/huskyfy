<template>
  <!-- Ask the user if he really want to load all the tracks for a huge playlist (> 150 tracks) -->
  <!-- This allow to lazy load playlist tracks -->
  <v-snackbar id="load-more-snackbar" v-model="ALWAYS_TRUE" :timeout="timeout" :color="color">
    <div id="ask-and-load" v-if="!isLoaded">
      <div id="loading-create-new-playlist">
        <p class="rainbow-text">
          {{ $t("playlist.load-more-warning", { limit: trackRequestLimit }) }}
        </p>
      </div>
      <v-btn id="load-more-button" @click="loadAllTracks" class="rainbow-v-btn" :loading="waitingForResponse">
        {{ $t("playlist.load-more-button") }}
      </v-btn>
    </div>

    <div id="loaded" v-else>
      {{ $t("playlist.fully-loaded") }}
      <v-icon icon="mdi-checkbox-marked-circle"></v-icon>
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
    trackRequestLimit: Number
  },
  emits: ['allTracksLoaded'],
  setup() {
    const playlistsStore = usePlaylistsStore()
    const { downloadPlaylistTracks } = playlistsStore

    return { downloadPlaylistTracks, playlistsStore }
  },
  computed: {
    color(): string {
      return (this.isLoaded) ? 'green' : 'black'
    },
    timeout (): number {
      return (this.isLoaded) ? 3000 : -1
    }
  },
  methods: {
    async loadAllTracks() {
      this.waitingForResponse = true
      await this.downloadPlaylistTracks(this.playlist.id, this.playlist.total)
      this.waitingForResponse = false
      this.isLoaded = true
      this.$emit('allTracksLoaded')
    }
  },
  data() {
    return {
      ALWAYS_TRUE: true,
      isLoaded: false,
      waitingForResponse: false
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
