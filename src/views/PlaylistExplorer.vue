<template>
  <HuskyfyBanner />
  <div id="full-page">
    <div id="playlists">
      <PlaylistCard
        v-for="playlist in playlistsStore.playlists"
        :id="playlist.id"
        :key="playlist.id"
        :name="formatName(playlist)"
        :images="playlist.images"
        :track-count="playlist.total"
      />
      <v-progress-circular
        v-if="!firstTracksLoaded"
        :size="70"
        :width="7"
        color="var(--text-color)"
        indeterminate
      />
    </div>

    <v-btn
      v-if="Object.keys(playlistsStore.playlists).length < playlistTotal && firstTracksLoaded"
      class="rainbow-v-btn"
      @click="loadMorePlaylists"
    >
      {{ $t("playlist.load-more-playlists") }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMeta } from 'vue-meta'

import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import HuskyfyBanner from '@/components/HuskyfyBanner.vue'
import PlaylistCard from '@/components/PlaylistCard.vue'
import { t } from '@/i18n'
import { MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'

// Display all playlists in the Spotify user library
export default defineComponent({
  name: 'PlaylistExplorer',
  components: {
    HuskyfyBanner,
    PlaylistCard
  },
  setup () {
    useMeta({
      title: t('page-title.explore'),
      link: [
        { rel: 'canonical', href: `${process.env.VUE_APP_BASE_SERVER_URL}/explore` }
      ]
    })
    const playlistsStore = usePlaylistsStore()
    return { playlistsStore }
  },
  data () {
    return {
      playlistTotal: 0,
      offset: 0,
      firstTracksLoaded: false
    }
  },
  computed: {
    formatName () {
      return (playlist: SpotifyPlaylist): string => {
        return playlist.id === MY_MUSIC_PLAYLIST_ID ? this.$t('playlist.your-music.name') : playlist.name
      }
    }
  },
  async created () {
    await this.loadMorePlaylists()
    this.firstTracksLoaded = true
  },
  methods: {
    async loadMorePlaylists () {
      const { total, offset } = await this.playlistsStore.getUserPlaylists(this.offset)
      this.playlistTotal = total
      this.offset = offset
    }
  }
})
</script>

<style scoped>
#full-page {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
}

#playlists {
  min-width: 100%;
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
