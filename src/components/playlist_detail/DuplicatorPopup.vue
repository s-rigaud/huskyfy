<template>
  <!-- Layer on top to follow steps of playlist duplication -->
  <v-snackbar v-model="snackbarVisible" :timeout="timeout" elevation="24">
    <div id="loading-create-new-playlist" v-if="loadingPercentage > 0">
      <v-progress-circular :model-value="loadingPercentage" color="var(--text-color)">
      </v-progress-circular>
      <p class="rainbow-text">{{ loadingPercentage }}% - {{ loadingText }}</p>
    </div>

    <v-btn id="get-to-new-playlist" class="rainbow-v-btn" :loading="newPlaylistId === ''"
      @click="displayNewPlaylistDetails">
      {{ $t("playlist.next") }}
    </v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { usePlaylistsStore } from '@/stores/playlists'

export default defineComponent({
  name: 'DuplicatorPopup',
  props: {
    playlistId: {
      type: String,
      required: true
    }
  },
  setup() {
    const playlistsStore = usePlaylistsStore()
    return { playlistsStore }
  },
  async created() {
    await this.createNewPlaylist()
  },
  computed: {
    timeout(): number {
      return this.loadingPercentage === 100 ? 10_000 : -1
    }
  },
  methods: {
    async createNewPlaylist() {
      this.loadingText = this.$t('playlist.new.create')
      this.loadingPercentage = 1

      const newPlaylistId = await this.playlistsStore.createPlaylist(
        this.playlistId,
        this.getNewPlaylistName(),
        this.getNewPlaylistDescription(),
        false,
        false
      )

      this.loadingText = this.$t('playlist.new.cover')
      this.loadingPercentage = 33
      await this.playlistsStore.updatePlaylistCover(
        newPlaylistId,
        this.playlistsStore.playlists[this.playlistId].images[0].url
      )

      this.loadingText = this.$t('playlist.new.tracks')
      this.loadingPercentage = 66
      await this.playlistsStore.addTracksToPlaylist(
        newPlaylistId,
        this.playlistsStore.filteredTracks
      )

      this.loadingText = this.$t('playlist.new.done')
      this.loadingPercentage = 100
      this.newPlaylistId = newPlaylistId
    },
    displayNewPlaylistDetails() {
      window.location.href = `/playlist/${this.newPlaylistId}`
    },
    getNewPlaylistName(): string {
      const basePlaylist = this.playlistsStore.playlists[this.playlistId]
      let newPlaylistName = `${this.$t('playlist.duplicate.copy-of')} ${basePlaylist.name}`
      return newPlaylistName
    },
    getNewPlaylistDescription(): string {
      const basePlaylist = this.playlistsStore.playlists[this.playlistId]
      let newPlaylistDescription = `${this.$t('playlist.duplicate.copy-of')} "${basePlaylist.name}" • ${this.$t('playlist.duplicate.created-by')}`
      return newPlaylistDescription
    }
  },
  data() {
    return {
      loadingPercentage: 0,
      loadingText: '',

      newPlaylistId: '',

      snackbarVisible: true
    }
  },
  watch: {
    snackbarVisible(newValue: boolean) {
      if (newValue === false) {
        this.loadingPercentage = 0
        this.loadingText = ''
        this.newPlaylistId = ''
      }
    }
  }
})
</script>
<style>
#loading-create-new-playlist {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.v-snackbar__content {
  display: flex;
  flex-direction: column;
  background-color: var(--primary-color);
}

.v-progress-circular__underlay {
  stroke: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

#get-to-new-playlist {
  width: 100%;
}
</style>
