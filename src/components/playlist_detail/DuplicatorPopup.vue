<template>
  <!-- Layer on top to follow steps of playlist duplication -->
  <v-snackbar
    id="duplicate-snackbar"
    v-model="snackbarVisible"
    :timeout="timeout"
    color="var(--huskyfy-black)"
    elevation="24"
  >
    <div
      v-if="loadingPercentage > 0"
      id="loading-create-new-playlist"
    >
      <v-progress-circular
        id="duplication-progress"
        :model-value="loadingPercentage"
        color="var(--huskyfy-orange)"
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
      {{ t("playlist.next") }}
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

<script setup lang="ts">
import { PropType, computed, onBeforeMount, ref, watch } from 'vue'

import { SpotifyTrack } from '@/api/spotify/types/entities'
import { locale, t } from '@/i18n'
import { usePlaylistsStore } from '@/stores/playlists'

const props = defineProps({
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
})
const emit = defineEmits(['onEnd'])

const playlistsStore = usePlaylistsStore()

const loadingPercentage = ref(0)
const loadingText = ref('')

const newPlaylistId = ref('')

const snackbarVisible = ref(true)

const timeout = computed((): number => {
  return loadingPercentage.value === 100 ? 10_000 : -1
})

watch(snackbarVisible, (isVisible: boolean) => {
  if (isVisible) return

  loadingPercentage.value = 0
  loadingText.value = ''
  newPlaylistId.value = ''
  emit('onEnd')
})

onBeforeMount(async () => {
  await createNewPlaylist()
})

/**
     * 1. Create a new blank playlist
     * 2. Set cover as the cover of the old base playlists
     * 3. Add tracks to playlist either the filtered tracks or all the tracks of the old base playlist
     */
const createNewPlaylist = async () => {
  loadingText.value = t('playlist.new.create')
  loadingPercentage.value = 1
  const newId = await playlistsStore.createPlaylist(
    props.playlistId,
    getNewPlaylistName(),
    getNewPlaylistDescription(),
    false,
    false
  )

  loadingText.value = t('playlist.new.cover')
  loadingPercentage.value = 33
  const oldPlaylistCover = playlistsStore.playlists[props.playlistId].images![0].url
  await playlistsStore.updatePlaylistCover(newId, oldPlaylistCover)

  // If newTracks is empty that means we have to duplicate all the tracks
  const tracksToAdd = props.newTracks.length ? props.newTracks : playlistsStore.playlists[props.playlistId].tracks

  loadingText.value = t('playlist.new.tracks')
  loadingPercentage.value = 66
  await playlistsStore.addTracksToPlaylist(
    newId,
    tracksToAdd
  )

  loadingText.value = t('playlist.new.done') + ' ✓'
  loadingPercentage.value = 100
  newPlaylistId.value = newId
}

const displayNewPlaylistDetails = () => {
  window.location.href = `/playlist/${newPlaylistId.value}`
}

/**
 * Create a new playlist name according to filters
 */
const getNewPlaylistName = (): string => {
  const { name } = playlistsStore.playlists[props.playlistId]
  let newPlaylistName: string
  if (props.filterTag) {
    newPlaylistName = `${name} [${props.filterTag}]`
  } else {
    newPlaylistName = `${t('playlist.duplicate.copy-of')} ${name}`
  }
  return newPlaylistName
}

/**
 * Create a new playlist description according to filters
 */
const getNewPlaylistDescription = (): string => {
  const { name } = playlistsStore.playlists[props.playlistId]
  const tag = props.filterTag ? `[${props.filterTag}]` : ''

  const now = new Date()
  const day = now.getDate().toString(10).padStart(2, '0')
  const month = (now.getMonth() + 1).toString(10).padStart(2, '0')
  const year = now.getFullYear()
  const formattedDate = (locale === 'en') ? `${month}/${day}/${year}` : `${day}/${month}/${year}`

  return [
    t('playlist.duplicate.copy-of'),
    name, tag,
    '•', formattedDate,
    '•', t('playlist.duplicate.created-by')
  ].join(' ')
}
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
  border: 2px var(--huskyfy-orange) solid;
}

#duplicate-snackbar .v-progress-circular__underlay {
  stroke: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

#get-to-new-playlist {
  width: 100%;
}
</style>
