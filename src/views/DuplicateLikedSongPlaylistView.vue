<template>
  <div id="content">
    <h1>%% Generic title about why duplicating is needed (Spotify does not allow to share or make the playlist
      public) %%</h1>

    <v-img id="my-song-img" width="200" :src="myMusicImage" alt="My Music playlist"></v-img>
    <v-btn class="rainbow-v-btn" @click="createNewPlaylist">%% Duplicate now %%</v-btn>

    <!-- Use v-stepper in the future when it will be ready -->
    <div id="fake-v-stepper">
      <div id="steps">
        <h3 class="step rainbow-text">%% Step 1 %%</h3>
        <h3 class="step rainbow-text">%% Step 2 %%</h3>
        <h3 class="step rainbow-text">%% Step 3 %%</h3>
        <h3 class="step rainbow-text">%% Step 4 %%</h3>
      </div>
      <v-progress-linear :buffer-value="loadingPercentage" stream color="orange"></v-progress-linear>
    </div>
    <div v-if="loadingPercentage == 100">
      <v-btn class="rainbow-v-btn" @click="copyLinkToClipBoard">%% Copy new playlist link %%</v-btn>
      <v-btn class="rainbow-v-btn" @click="displayNewPlaylistDetails">%% Jump to new playlist %%</v-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { usePlaylistsStore } from '@/stores/playlists'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DuplicateLikedSongPlaylistView',
  setup () {
    const playlistsStore = usePlaylistsStore()
    return { playlistsStore }
  },
  computed: {
    myMusicImage (): string {
      return require('@/assets/my-music.jpeg')
    },
    playlistLink (): string {
      return `spotify:playlist:${this.newPlaylistId}`
    }
  },
  data () {
    return {
      loadingPercentage: 0,
      newPlaylistId: '',
      playlistId: 'my-music'
    }
  },
  methods: {
    async createNewPlaylist () {
      const myMusicPlaylist = this.playlistsStore.playlists[this.playlistId]
      // 1. Download My Music tracks
      this.loadingPercentage = 5
      await this.playlistsStore.refreshMyMusicTotalTrack()
      await this.playlistsStore.downloadPlaylistTracks(this.playlistId, myMusicPlaylist.total)

      // 2. Create new playlist
      this.loadingPercentage = 25
      const newPlaylistId = await this.playlistsStore.createPlaylist(
        this.playlistId,
        myMusicPlaylist.name,
        myMusicPlaylist.description,
        true,
        false
      )

      // 3. Update playlist cover
      this.loadingPercentage = 50
      await this.playlistsStore.updatePlaylistCover(newPlaylistId, myMusicPlaylist.images[0].url)

      // 4. Add tracks
      this.loadingPercentage = 66
      await this.playlistsStore.addTracksToPlaylist(newPlaylistId, myMusicPlaylist.tracks)

      this.loadingPercentage = 100
      this.newPlaylistId = newPlaylistId
    },
    displayNewPlaylistDetails () {
      window.location.href = `/playlist/${this.newPlaylistId}`
    },
    copyLinkToClipBoard () {
      navigator.clipboard.writeText(`https://open.spotify.com/playlist/${this.newPlaylistId}`)
    }
  }

})
</script>
<style>
/* Generic Vuetify override*/
.v-progress-linear div {
  opacity: 1 !important;
}

/* Real styling */
#content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
}

#fake-v-stepper {
  width: 50%;
  margin: 50px;
}

#steps {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
