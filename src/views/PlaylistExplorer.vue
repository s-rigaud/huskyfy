<template>
  <!-- Display all playlists in the Spotify user library -->
  <div id="full-page">
    <div id="playlists">
      <PlaylistCard v-for="playlist in playlistsStore.playlists" :key="playlist.id" :id="playlist.id"
        :name="formatName(playlist)" :images="playlist.images" />
      <v-progress-circular v-if="!playlistLoaded" :size="70" :width="7" color="var(--text-color)" indeterminate>
      </v-progress-circular>
    </div>

    <v-btn v-if="Object.keys(playlistsStore.playlists).length < playlistTotal && playlistLoaded" class="rainbow-v-btn"
      @click="loadMorePlaylists">
      {{ $t("playlist.load-more-playlists") }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import PlaylistCard from '@/components/PlaylistCard.vue'
import { usePlaylistsStore } from '@/stores/playlists'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PlaylistExplorer',
  components: { PlaylistCard },
  setup () {
    const playlistsStore = usePlaylistsStore()
    return { playlistsStore }
  },
  computed: {
    formatName () {
      return (playlist: SpotifyPlaylist): string => {
        return playlist.id === 'my-music'
          ? this.$t('playlist.your-music.name')
          : playlist.name
      }
    }
  },
  async created () {
    await this.loadMorePlaylists()
    this.playlistLoaded = true
  },
  methods: {
    async loadMorePlaylists () {
      const response = await this.playlistsStore.getUserPlaylists(this.offset)
      this.playlistTotal = response.total
      this.offset = response.offset
    }
  },
  data () {
    return {
      playlistTotal: 0,
      offset: 0,
      playlistLoaded: false
    }
  }
})
</script>

<style scoped>
#full-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

#playlists {
  max-width: 100%;

  margin-top: 10px;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: space-evenly;
  align-items: stretch;
}
</style>
