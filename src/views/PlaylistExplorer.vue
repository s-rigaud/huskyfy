<template>
  <HuskyfyBanner />
  <div id="full-page">
    <div
      id="playlist-search-bar"
      class="ma-5"
    >
      <v-text-field
        v-model="search"
        :label="$t('playlist.filter')"
        bg-color="white"
        class="rounded-search-field"
        clearable
        color="var(--huskyfy-orange)"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-magnify"
        single-line
        type="search"
        @update:model-value="filterPlaylists"
      />
    </div>

    <div id="playlists">
      <PlaylistCard
        v-for="playlist in playlistsToDisplay"
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
        color="var(--huskyfy-orange)"
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
import { computed, onBeforeMount, ref } from 'vue'
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

const playlistsToDisplay = ref<SpotifyPlaylist[]>([])
const playlistTotal = ref(0)
const requestOffset = ref(0)
const firstTracksLoaded = ref(false)
const search = ref<string | null>('')

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
  const { offset, total } = await playlistsStore.getUserPlaylists(requestOffset.value)
  playlistsToDisplay.value = Object.values(playlistsStore.playlists)

  playlistTotal.value = total
  requestOffset.value = offset
}

const filterPlaylists = () => {
  const lowercaseSearch = search.value?.toLowerCase().trim()
  if (lowercaseSearch) {
    playlistsToDisplay.value = Object.values(playlistsStore.playlists).filter(
      p => p.name.toLowerCase().includes(lowercaseSearch)
    )
  } else {
    playlistsToDisplay.value = Object.values(playlistsStore.playlists)
  }
}
</script>

<style>
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
  height: 100%;

  margin-top: 10px;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: stretch;
  justify-content: center;
  align-items: flex-start;
}

#playlist-search-bar .v-field {
  min-width: 400px;

  color: white;
  background-color: black;
  border: 4px var(--huskyfy-orange) solid;
}
</style>
