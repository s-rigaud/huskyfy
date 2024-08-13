<template>
  <!-- Ask the user if he really want to load all the tracks for a huge playlist (> 150 tracks) -->
  <!-- This allow to lazy load playlist tracks -->
  <v-snackbar
    id="load-more-snackbar"
    v-model="isVisible"
    :color="color"
    :timeout="timeout"
  >
    <div
      v-if="!isLoaded"
      id="ask-and-load"
    >
      <div id="loading-create-new-playlist">
        <p class="rainbow-text">
          {{ $t("playlist.load-more-warning", { limit: DEFAULT_MAX_TRACKS, total: playlist.total }) }}
        </p>
      </div>
      <v-btn
        id="load-more-button"
        :loading="waitingForResponse"
        class="rainbow-v-btn"
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

<script setup lang="ts">
import { PropType, computed, ref } from 'vue'

import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import { DEFAULT_MAX_TRACKS, usePlaylistsStore } from '@/stores/playlists'

const props = defineProps({
  playlist: {
    type: Object as PropType<SpotifyPlaylist>,
    required: true
  },
  trackRequestLimit: {
    type: Number,
    required: true
  }
})
const emit = defineEmits(['allTracksLoaded'])

const playlistsStore = usePlaylistsStore()
const { downloadPlaylistTracks } = playlistsStore

const isVisible = ref(true)

const isLoaded = ref(false)
const waitingForResponse = ref(false)

const color = computed(() => isLoaded.value ? 'green' : 'black')

const timeout = computed(() => isLoaded.value ? 3000 : -1)

/**
 * Download tracks from Spotify API and add them to localStorage.
 * Then, it emits to notify parent component.
 */
const loadAllTracks = async () => {
  waitingForResponse.value = true
  // Arbitrary
  if (props.playlist.total > 500) {
    playlistsStore.softReset(props.playlist.id)
  }
  await downloadPlaylistTracks(props.playlist.id, props.playlist.total)
  waitingForResponse.value = false
  isLoaded.value = true
  emit('allTracksLoaded')
}
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
