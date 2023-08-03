<template>
  <HuskyfyBanner />
  <div id="full-page">
    <div id="playlists">
      <PlaylistCard
        v-for="playlist in playlistsStore.playlists"
        :id="playlist.id"
        :key="playlist.id"
        :images="playlist.images"
        :name="formatName(playlist)"
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

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useMeta } from 'vue-meta'

import { SpotifyPlaylist } from '@/api/spotify/types/entities'
import HuskyfyBanner from '@/components/HuskyfyBanner.vue'
import PlaylistCard from '@/components/PlaylistCard.vue'
import { t } from '@/i18n'
import { MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'

useMeta({
  title: t('page-title.explore'),
  link: [
    { rel: 'canonical', href: `${import.meta.env.VITE_APP_BASE_SERVER_URL}/explore` }
  ]
})

const playlistsStore = usePlaylistsStore()

const playlistTotal = ref(0)
const offset = ref(0)
const firstTracksLoaded = ref(false)

const formatName = computed(() => {
  return (playlist: SpotifyPlaylist): string => {
    return playlist.id === MY_MUSIC_PLAYLIST_ID ? t('playlist.your-music.name') : playlist.name
  }
})

onBeforeMount(async () => {
  await loadMorePlaylists()
  firstTracksLoaded.value = true
})

const loadMorePlaylists = async () => {
  const res = await playlistsStore.getUserPlaylists(offset.value)
  playlistTotal.value = res.total
  offset.value = res.offset
}
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
  justify-content: center;
  align-items: stretch;
}
</style>
