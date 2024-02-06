<template>
  <v-navigation-drawer
    id="drawer"
    v-model="isOpen"
    :image="starImage"
    elevation="20"
    location="right"
    temporary
    @update:model-value="emit('update:open', false)"
  >
    <v-list>
      <v-list-subheader v-if="canUpdatePlaylistName">
        {{ $t('drawer.update-playlist') }}
      </v-list-subheader>
      <!-- 1.1 Update playlist privacy -->
      <div
        v-if="(userOwnsPlaylist || spotifyOwnsPlaylist) && !playlistsStore.playlists[playlistId].collaborative && isNotMyMusicPlaylist"
      >
        <v-list-item
          v-if="playlistsStore.playlists[playlistId].public"
          @click="() => updatePlaylistPrivacy(false)"
        >
          <v-list-item-title>{{ $t("playlist.set-private") }} {{ $t("_emojis.private") }}</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-else
          @click="() => updatePlaylistPrivacy(true)"
        >
          <v-list-item-title>{{ $t("playlist.set-public") }} {{ $t("_emojis.public") }}</v-list-item-title>
        </v-list-item>
      </div>

      <!-- 1.2 Duplicate playlist -->
      <v-list-item
        v-if="allTracksLoaded"
        @click="startDuplicationProcess"
      >
        <v-list-item-title>{{ $t("playlist.duplicate.button") }} 🔀</v-list-item-title>
      </v-list-item>

      <!-- 1.3 Playlist deletion -->
      <v-dialog
        v-if="isNotMyMusicPlaylist"
        v-model="isDeleteModalOpen"
        style="z-index:5555;"
      >
        <template #activator="{ props }">
          <v-list-item v-bind="props">
            <v-list-item-title>{{ $t("playlist.unfollow") }}</v-list-item-title>
          </v-list-item>
        </template>
        <v-card id="deletion-dialog">
          <v-card-title class="text-h5 rainbow-text font-weight-bold">
            {{ $t('playlist.delete.delete') }}
            <span class="font-italic white-text"> {{ playlistsStore.playlists[playlistId].name }} </span>
          </v-card-title>
          <v-card-text class="rainbow-text">
            {{ $t('playlist.delete.confirm-message') }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              class="deletion-action-button"
              color="var(--huskyfy-orange)"
              @click="isDeleteModalOpen = false"
            >
              {{ $t('playlist.delete.disagree') }}
            </v-btn>
            <v-btn
              id="validate-deletion-button"
              :loading="waitingForDeletion"
              v-focus
              class="deletion-action-button rainbow-v-btn font-weight-bold"
              @click="unfollowPlaylist"
            >
              {{ $t('playlist.delete.agree') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider color="grey" />

      <div v-if="userOwnsPlaylist && allTracksLoaded">
        <v-list-subheader> {{ $t('drawer.reorder-playlist') }}</v-list-subheader>
        <!-- 2.1 Sort by genres -->
        <v-list-item @click="sortPlaylistTracksByGenres">
          <v-list-item-title>{{ $t('drawer.reorder-by-genre') }}</v-list-item-title>
        </v-list-item>
        <!-- 2.2 Sort tracks from the ones with the artist with the most tracks to the least  -->
        <v-list-item @click="sortPlaylistTracksByArtistTrackInPlaylist">
          <v-list-item-title>{{ $t('drawer.reorder-by-artist-pop') }}</v-list-item-title>
        </v-list-item>
        <!-- 2.1 Sort by artist name -->
        <v-list-item @click="sortPlaylistTracksByArtistName">
          <v-list-item-title>{{ $t('drawer.reorder-by-artist-name') }}</v-list-item-title>
        </v-list-item>
      </div>

      <v-divider color="grey" />

      <!-- (At least 4 tracks to download image) -->
      <div
        v-if="playlistsStore.playlists[playlistId].tracks.length >= 4 && playlistsStore.getTopGenres(playlistId).length >= 4"
      >
        <!-- 3. Export Image -->
        <v-badge
          id="export-image-badge"
          color="red"
          dot
        >
          <v-list-subheader> {{ $t('drawer.export-image') }}</v-list-subheader>
        </v-badge>
        <v-img
          id="live-image-preview"
          :src="imagePreview"
          lazy-src="@/assets/loading-image-preview.jpg"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular
                color="var(--huskyfy-orange)"
                indeterminate
              />
            </div>
          </template>
        </v-img>
        <v-slider
          v-if="maxTick > 0"
          id="generate-image-size-slider"
          v-model="generateImageSize"
          :max="maxTick"
          :ticks="ticks"
          color="var(--huskyfy-orange)"
          prepend-icon="mdi-arrange-send-to-back"
          show-ticks="always"
          step="1"
          tick-size="4"
          @touchstart.stop
        />
        <div
          id="sliders"
          class="ma-2"
        >
          <v-switch
            v-model="generateImageDisplayTitle"
            class="generate-image-switch"
            color="var(--huskyfy-orange)"
          >
            <template #label>
              <p
                :style="generateImageDisplayStats ? { color: 'orange' } : {}"
                class="black-highlight"
              >
                {{ $t('drawer.image-display-title') }}
              </p>
            </template>
          </v-switch>
          <v-switch
            v-model="generateImageDisplayStats"
            class="generate-image-switch"
            color="var(--huskyfy-orange)"
          >
            <template #label>
              <p
                :style="generateImageDisplayStats ? { color: 'orange' } : {}"
                class="black-highlight"
              >
                {{ $t('drawer.image-display-stats') }}
              </p>
            </template>
          </v-switch>
        </div>
        <div
          id="generate-image-button"
          class="ma-4"
        >
          <v-btn
            class="rainbow-v-btn"
            @click="exportArtistPreview"
          >
            {{ $t("playlist.export-preview") }}
          </v-btn>
        </div>
      </div>
      <div v-else>
        <v-list-subheader style="text-align: center; margin-top: 20px;">
          {{ $t('drawer.not-enough-data') }}
        </v-list-subheader>
      </div>
    </v-list>
  </v-navigation-drawer>

  <DuplicatorPopup
    v-if="startDuplication"
    :filter-tag="''"
    :new-tracks="[]"
    :playlist-id="playlistsStore.playlists[playlistId].id"
    @on-end="startDuplication = false"
  />
</template>
<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import DuplicatorPopup from '@/components/playlist_detail/DuplicatorPopup.vue'
import { downloadImage, GridSize, makeImage } from '@/services/playlistImageMaker'
import { MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'

const router = useRouter()

const props = defineProps({
  open: {
    type: Boolean,
    required: true
  },
  playlistId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:open', 'onSortEnd'])

const playlistsStore = usePlaylistsStore()
const currentUserUsername = useUserStore().username

const isOpen = ref(false)
const isDeleteModalOpen = ref(false)
const waitingForDeletion = ref(false)

const generateImageDisplayTitle = ref(true)
const generateImageDisplayStats = ref(true)

const imagePreview = ref('')

const startDuplication = ref(false)

const starImage = computed((): string => {
  return new URL('../../assets/stars.jpg', import.meta.url).href
})

const isNotMyMusicPlaylist = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].id !== MY_MUSIC_PLAYLIST_ID
})
const userOwnsPlaylist = computed((): boolean => {
  return currentUserUsername === playlistsStore.playlists[props.playlistId].owner.display_name
})
const spotifyOwnsPlaylist = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].owner.id === 'spotify'
})

const ticks = computed((): Record<number, string> => {
  const trackNumber = playlistsStore.getTopArtists(props.playlistId).length
  const ticks: Record<number, string> = {}
  if (trackNumber >= 4) ticks[0] = '2x2'
  if (trackNumber >= 9) ticks[1] = '3x3'
  if (trackNumber >= 16) ticks[2] = '4x4'
  return ticks
})
const maxTick = computed(() => Object.keys(ticks.value).length - 1)
const generateImageSize = ref(maxTick.value)

const allTracksLoaded = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].tracks.length === playlistsStore.playlists[props.playlistId].total
})
const canCreateExportImage = computed((): boolean => {
  return playlistsStore.playlists[props.playlistId].tracks.length >= 4 && playlistsStore.getTopGenres(props.playlistId).length >= 4
})
const canUpdatePlaylistName = computed((): boolean => {
  return ((userOwnsPlaylist.value || spotifyOwnsPlaylist.value) && !playlistsStore.playlists[props.playlistId].collaborative && isNotMyMusicPlaylist.value) ||
    allTracksLoaded.value ||
    isNotMyMusicPlaylist.value
})

onBeforeMount(() => { isOpen.value = props.open })

// Have to use this to synchronise props as I can't use props as VModel
watch(() => props.open, (isNowOpen: boolean) => {
  isOpen.value = isNowOpen
  isNowOpen && updateImagePreview()
})
watch(generateImageSize, () => { updateImagePreview() })
watch(generateImageDisplayTitle, () => { updateImagePreview() })
watch(generateImageDisplayStats, () => { updateImagePreview() })

const startDuplicationProcess = () => {
  isOpen.value = false
  startDuplication.value = true
}
const updateImagePreview = () => {
  if (!canCreateExportImage.value) return

  makeImage(
    props.playlistId,
    ([2, 3, 4] as GridSize[])[generateImageSize.value],
    generateImageDisplayTitle.value,
    generateImageDisplayStats.value,
    (rawImageData: string) => { imagePreview.value = rawImageData }
  )
}
const updatePlaylistPrivacy = async (isPublic: boolean) => {
  await playlistsStore.updatePlaylistPrivacy(props.playlistId, isPublic)
  isOpen.value = false
}
const sortPlaylistTracksByGenres = async () => {
  await playlistsStore.sortPlaylistTracksByGenres(props.playlistId)
  emit('onSortEnd')
}
const sortPlaylistTracksByArtistTrackInPlaylist = async () => {
  await playlistsStore.sortPlaylistTracksByArtistTrackInPlaylist(
    props.playlistId
  )
  emit('onSortEnd')
}
const sortPlaylistTracksByArtistName = async () => {
  await playlistsStore.sortPlaylistTracksByArtistName(
    props.playlistId
  )
  emit('onSortEnd')
}

const exportArtistPreview = () => {
  makeImage(
    props.playlistId,
    ([2, 3, 4] as GridSize[])[generateImageSize.value],
    generateImageDisplayTitle.value,
    generateImageDisplayStats.value,
    (rawImageData: string) => { downloadImage(rawImageData, playlistsStore.playlists[props.playlistId].name) }
  )
}
/**
 * Delete playlist from Spotify account, delete it from localStorage and redirect to main page
 */
const unfollowPlaylist = async () => {
  isDeleteModalOpen.value = false
  waitingForDeletion.value = true
  const toDeletePlaylistId = props.playlistId
  await playlistsStore.unfollowPlaylist(toDeletePlaylistId)
  waitingForDeletion.value = false
  router.push({ name: 'Explore' })
}
</script>

<style>
#drawer {
  /* More than Vuetify default z-index for snackbar (2000) */
  z-index: 3000 !important;
  min-width: max(25%, 300px);
}

#main-content .v-navigation-drawer__scrim {
  opacity: 0.5;
}

#sliders {
  display: flex;
  flex-direction: row;
}

/* Image styling part */
#drawer .v-slider__container {
  width: 90%;
}

#drawer .generate-image-switch {
  width: 150px;
  height: 50px;

  margin-left: 10px;
}

#drawer .generate-image-switch .v-switch {
  height: 30px;
}

#drawer .generate-image-switch .v-selection-control {
  height: 30px !important;
}

#generate-image-button {
  display: flex;
  align-items: center;
  flex-direction: column;
}

#export-image-badge .v-badge__badge {
  bottom: calc(100% - 16px) !important;
  left: calc(100% - 15px) !important;
}

#live-image-preview {
  margin: 0px 5px;
}

/* Generic styling */
#drawer .v-list-subheader {
  font-size: large;
  color: var(--huskyfy-orange);
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

#drawer .v-list-subheader__text {
  white-space: break-spaces;
}

#drawer .v-list-item {
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

#drawer .v-navigation-drawer__img {
  opacity: 0.7;
}

#drawer .v-label--clickable {
  opacity: 1 !important;
}

#deletion-dialog {
  max-width: 100%;
  margin: auto;
}

/* Update default opacity for Vuetify hover link effect */
#drawer .v-list-item:hover>.v-list-item__overlay {
  opacity: calc(0.2 * var(--v-theme-overlay-multiplier));
}

.deletion-action-button:focus {
  outline: 1px white solid;
}

.white-text {
  /* like rainbow-text but only white */
  -webkit-text-fill-color: lightgray;
}
</style>
