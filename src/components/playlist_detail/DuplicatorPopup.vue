<template>
  <!-- Layer on top to follow steps of playlist duplication -->
  <v-snackbar
    id="duplicate-snackbar"
    v-model="snackbarVisible"
    :timeout="timeout"
    color="var(--primary-color)"
    elevation="24"
  >
    <div
      v-if="loadingPercentage > 0"
      id="loading-create-new-playlist"
    >
      <v-progress-circular
        id="duplication-progress"
        :model-value="loadingPercentage"
        color="var(--text-color)"
      />
      <p class="rainbow-text">
        {{ loadingPercentage }}% - {{ loadingText }}
      </p>
    </div>

    <v-btn
      id="get-to-new-playlist"
      :loading="newPlaylistId === ''"
      class="rainbow-v-btn"
      @click="displayNewPlaylistDetails"
    >
      {{ $t("playlist.next") }}
    </v-btn>

    <template #actions>
      <v-btn
        color="red"
        variant="text"
        @click="snackbarVisible = false"
      >
        X
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, PropType, toRef } from 'vue'

import { SpotifyTrack } from '@/api/spotify/types/entities'
import { usePlaylistsStore } from '@/stores/playlists'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'DuplicatorPopup',
  props: {
    playlistId: {
      type: String,
      required: true
    },
    newTracks: {
      type: Array as PropType<SpotifyTrack[]>,
      required: true
    },
    filterTag: {
      type: String,
      required: true
    }
  },
  emits: ['onEnd'],
  setup (props) {
    const playlistsStore = usePlaylistsStore()

    // Shorthand
    const { playlists } = storeToRefs(playlistsStore)
    const playlist = toRef(playlists.value, props.playlistId)

    return { playlistsStore, playlist }
  },
  data () {
    return {
      loadingPercentage: 0,
      loadingText: '',

      newPlaylistId: '',

      snackbarVisible: true
    }
  },
  computed: {
    timeout (): number {
      return this.loadingPercentage === 100 ? 10_000 : -1
    }
  },
  watch: {
    snackbarVisible (isVisible: boolean) {
      if (isVisible) return

      this.loadingPercentage = 0
      this.loadingText = ''
      this.newPlaylistId = ''
      this.$emit('onEnd')
    }
  },
  async created () {
    await this.createNewPlaylist()
  },
  methods: {
    /**
     * 1. Create a new blank playlist
     * 2. Set cover as the cover of the old base playlists
     * 3. Add tracks to playlist either the filtered tracks or all the tracks of the old base playlist
     */
    async createNewPlaylist () {
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
      await this.playlistsStore.updatePlaylistCover(newPlaylistId, this.playlist.images[0].url)

      // If newTracks is empty that means we have to duplicate all the tracks
      const tracksToAdd = this.newTracks.length ? this.newTracks : this.playlist.tracks

      this.loadingText = this.$t('playlist.new.tracks')
      this.loadingPercentage = 66
      await this.playlistsStore.addTracksToPlaylist(
        newPlaylistId,
        tracksToAdd
      )

      this.loadingText = this.$t('playlist.new.done') + ' ✓'
      this.loadingPercentage = 100
      this.newPlaylistId = newPlaylistId
    },
    displayNewPlaylistDetails () {
      window.location.href = `/playlist/${this.newPlaylistId}`
    },
    /**
     * Create a new playlist name according to filters
     */
    getNewPlaylistName (): string {
      const { name } = this.playlist
      let newPlaylistName: string
      if (this.filterTag) {
        newPlaylistName = `${name} [${this.filterTag}]`
      } else {
        newPlaylistName = `${this.$t('playlist.duplicate.copy-of')} ${name}`
      }
      return newPlaylistName
    },
    /**
     * Create a new playlist description according to filters
     */
    getNewPlaylistDescription (): string {
      const { name } = this.playlist
      const tag = this.filterTag ? `[${this.filterTag}]` : ''

      const now = new Date()
      const day = now.getDate().toString(10).padStart(2, '0')
      const month = (now.getMonth() + 1).toString(10).padStart(2, '0')
      const year = now.getFullYear()
      const formattedDate = (this.$i18n.locale === 'en') ? `${month}/${day}/${year}` : `${day}/${month}/${year}`

      return [
        this.$t('playlist.duplicate.copy-of'),
        name, tag,
        '•', formattedDate,
        '•', this.$t('playlist.duplicate.created-by')
      ].join(' ')
    }
  }
})
</script>
<style>
#loading-create-new-playlist {
  margin-bottom: 10px;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

#duplication-progress {
  margin-left: 5px;
}

#duplicate-snackbar .v-snackbar__wrapper {
  border: 2px var(--text-color) solid;
}

#duplicate-snackbar .v-progress-circular__underlay {
  stroke: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

#get-to-new-playlist {
  width: 100%;
}
</style>
