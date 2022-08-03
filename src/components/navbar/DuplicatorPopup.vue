<template>
  <!-- Layer on top to follow steps of playlist duplication -->
  <v-snackbar v-model="snackbar" :model-value="true" shaped>
    <div id="loading-create-new-playlist" v-if="loadingPercentage > 0">
      <v-progress-circular :model-value="loadingPercentage" color="var(--primary-color)">
      </v-progress-circular>
      <p>{{ loadingPercentage }}% - {{ loadingText }}</p>
    </div>

    <v-btn id="get-to-new-playlist" v-if="newPlaylistId != ''" @click="displayNewPlaylistDetails">
      {{ $t("playlist.next") }}
    </v-btn>

    <template v-slot:actions>
      <v-btn color="blue" variant="text" @click="snackbar = false"> X </v-btn>
    </template>

  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { usePlaylistsStore } from '@/stores/playlists'

export default defineComponent({
  name: 'DuplicatorPopup',
  props: {
    playlistId: String
  },
  setup () {
    const playlistsStore = usePlaylistsStore()
    return { playlistsStore }
  },
  async created () {
    await this.createNewPlaylist()
  },
  methods: {
    async createNewPlaylist () {
      this.loadingText = this.$t('playlist.new.create')
      this.loadingPercentage = 1
      const newPlaylistId = await this.playlistsStore.createPlaylist(
        this.playlistId!,
        this.playlistsStore.selectedGenres
      )

      this.loadingText = this.$t('playlist.new.cover')
      this.loadingPercentage = 33
      await this.playlistsStore.updatePlaylistCover(
        newPlaylistId,
        this.playlistsStore.playlists[this.playlistId!].images[0].url
      )

      this.loadingText = this.$t('playlist.new.tracks')
      this.loadingPercentage = 66
      await this.playlistsStore.addTracksToPlaylist(
        this.playlistId!,
        newPlaylistId,
        this.playlistsStore.filteredTracks.map((t) => t.uri)
      )

      this.loadingText = this.$t('playlist.new.done')
      this.loadingPercentage = 100
      this.newPlaylistId = newPlaylistId
    },
    displayNewPlaylistDetails () {
      window.location.href = `/playlist/${this.newPlaylistId}`
    }
  },
  data () {
    return {
      loadingPercentage: 0,
      loadingText: '',

      newPlaylistId: '',

      snackbar: true
    }
  }
})
</script>
<style scoped>
#loading-create-new-playlist {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.v-snackbar__content {
  display: flex;
  flex-direction: column;
}

.v-progress-circular__underlay {
  stroke: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

#get-to-new-playlist {
  width: 100%;
}
</style>
