<template>
  <!-- Ask the user if he really want to load all the tracks for a huge playlist (> 150 tracks) -->
  <!-- This allow to lazy load playlist tracks -->
  <v-snackbar id="load-more-snackbar" v-model="notLoaded" :timeout="-1">
    <div id="loading-create-new-playlist">
      <p>
        {{ $t("playlist.load-more-warning", { limit: trackRequestLimit }) }}
      </p>
    </div>
    <v-btn id="load-more-button" @click="loadAllTracks">
      {{ $t("playlist.load-more-button") }}
    </v-btn>
  </v-snackbar>

  <v-snackbar v-model="isLoaded" color="success" :timeout="3000">
    {{ $t("playlist.fully-loaded") }}
    <v-icon icon="mdi-checkbox-marked-circle"></v-icon>
  </v-snackbar>
</template>

<script>
import { usePlaylistsStore } from '@/stores/playlists'

export default {
  name: 'LoadMoreTracksPopup',
  props: {
    playlist: Object,
    trackRequestLimit: Number
  },
  emits: ['allTracksLoaded'],
  setup () {
    const playlistsStore = usePlaylistsStore()
    const { downloadPlaylistTracks } = playlistsStore

    return { downloadPlaylistTracks, playlistsStore }
  },
  methods: {
    async loadAllTracks () {
      this.notLoaded = false
      await this.downloadPlaylistTracks(this.playlist.id, this.playlist.total)
      this.isLoaded = true
      this.$emit('allTracksLoaded')
    }
  },
  data () {
    return {
      notLoaded: true,
      isLoaded: false
    }
  }
}
</script>
<style>
#load-more-snackbar .v-snackbar__content {
  display: flex;
  flex-direction: column;
}
</style>
