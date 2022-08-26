<template>
  <!-- Display all playlists in the Spotify user library -->
  <div id="full-page">
    <h1><span class="rainbow-text">{{ $t("playlist.header") }}</span>💽</h1>

    <div id="playlists">
      <PlaylistCard v-for="playlist in playlistsStore.playlists" :key="playlist.id" :id="playlist.id"
        :name="formatName(playlist)" :images="playlist.images"
        :owner="usernameToDisplay(playlist.owner['display_name'])" :public="playlist.public"
        :collaborative="playlist.collaborative" />
      <v-progress-circular v-if="playlistTotal < 1" :size="70" :width="7" color="var(--text-color)" indeterminate>
      </v-progress-circular>
    </div>

    <!-- TODO not really tested -->
    <v-btn @click="loadMorePlaylists" v-if="Object.keys(playlistsStore.playlists).length < playlistTotal">
      {{ $t("playlist.load-more-playlists") }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { SpotifyPlaylist } from '@/api/spotify/model'
import PlaylistCard from '@/components/PlaylistCard.vue'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PlaylistExplorer',
  components: { PlaylistCard },
  setup() {
    const userStore = useUserStore()
    const playlistsStore = usePlaylistsStore()
    const currentUserUsername = userStore.username
    return { currentUserUsername, playlistsStore }
  },
  computed: {
    usernameToDisplay() {
      return (ownerUsername: string): string => {
        return this.currentUserUsername === ownerUsername
          ? this.$t('me')
          : ownerUsername
      }
    },
    formatName() {
      return (playlist: SpotifyPlaylist): string => {
        return playlist.id === 'my-music'
          ? this.$t('playlist.your-music.name')
          : playlist.name
      }
    }
  },
  async created() {
    await this.loadMorePlaylists()
  },
  methods: {
    async loadMorePlaylists() {
      const response = await this.playlistsStore.getUserPlaylists(this.offset)
      this.playlistTotal = response.total
      this.offset = response.offset
    }
  },
  data() {
    return {
      playlistTotal: 0,
      offset: 0,
      isTrue: true
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
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: space-evenly;
  align-items: stretch;
}

@media (max-width: 992px) {
  h1 {
    font-size: large;
  }
}
</style>
