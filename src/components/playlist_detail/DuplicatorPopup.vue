<template>
  <v-snackbar v-model="snackbar" :model-value="true" shaped>
    <div id="loading-create-new-playlist" v-if="loadingPercentage > 0">
      <v-progress-circular
        :model-value="loadingPercentage"
        color="deep-orange lighten-2"
      >
      </v-progress-circular>
      <p>{{ loadingPercentage }}% - {{ loadingText }}</p>
    </div>
    <v-btn
      id="get-to-new-playlist"
      v-if="newPlaylistId != ''"
      @click="displayNewPlaylistDetails"
    >
      {{ $t("playlist.next") }}
    </v-btn>
  </v-snackbar>
</template>

<script>
import { usePlaylistsStore } from '@/stores/playlists'

export default {
  name: 'DuplicatorPopup',
  props: {
    playlist: Object,
    selectedGenreName: String,
    filteredTracks: Array
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
      this.startDuplication = true
      this.loadingText = this.$t('playlist.new.create')
      this.loadingPercentage = 1
      const newPlaylist = this.getPlaylistNewPlaylistAttributes(this.playlist)

      const response = await this.playlistsStore.createPlaylist(
        newPlaylist.name,
        newPlaylist.public,
        newPlaylist.description,
        newPlaylist.collaborative
      )
      const newPlaylistId = response.data.id

      this.loadingText = this.$t('playlist.new.cover')
      this.loadingPercentage = 33
      /* await this.playlistsStore.updatePlaylistCover(
        response.data.id,
        "https://m.media-amazon.com/images/I/61iw4s61r1S._AC_SX425_.jpg"
        //playlist.images[0].url
      ); */

      this.loadingText = this.$t('playlist.new.tracks')
      this.loadingPercentage = 66
      await this.playlistsStore.addTracksToPlaylist(
        newPlaylistId,
        this.filteredTracks.map((t) => t.uri)
      )

      this.loadingText = this.$t('playlist.new.done')
      this.loadingPercentage = 100
      this.newPlaylistId = newPlaylistId
    },
    getPlaylistNewPlaylistAttributes (playlist) {
      let newPlaylistName = playlist.name
      let newPlaylistDescription = ''
      if (this.selectedGenreName !== '') {
        newPlaylistName += ` • ${this.selectedGenreName}`
        newPlaylistDescription += `${playlist.name} • ${this.selectedGenreName}`
      } else {
        newPlaylistDescription += `Copy of ${playlist.name}`
      }
      newPlaylistDescription += ' • created by Horus'

      return {
        name: newPlaylistName,
        description: newPlaylistDescription,
        public: playlist.public && !playlist.collaborative,
        collaborative: playlist.collaborative
      }
    },
    displayNewPlaylistDetails () {
      this.$router.push({
        name: 'Explore playlist',
        params: { playlistId: this.newPlaylistId }
      })
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
}
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
</style>
