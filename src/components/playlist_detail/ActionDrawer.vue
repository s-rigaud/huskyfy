<template>
  <v-navigation-drawer
    id="drawer"
    v-model="isOpen"
    temporary
    location="right"
    :image="starImage"
    elevation="20"
  >
    <v-list>
      <v-list-subheader v-if="canUpdatePlaylistName">
        {{ $t('drawer.update-playlist') }}
      </v-list-subheader>
      <!-- 1.1 Update playlist privacy -->
      <div v-if="(userOwnsPlaylist || spotifyOwnsPlaylist) && !playlist.collaborative && isNotMyMusicPlaylist">
        <v-list-item
          v-if="playlist.public"
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
      >
        <template #activator="{ props }">
          <v-list-item v-bind="props">
            <v-list-item-title>{{ $t("playlist.unfollow") }}</v-list-item-title>
          </v-list-item>
        </template>
        <v-card id="deletion-dialog">
          <v-card-title class="text-h5 rainbow-text font-weight-bold">
            {{ $t('playlist.delete.delete') }}
            <span class="font-italic white-text"> {{ playlist.name }} </span>
          </v-card-title>
          <v-card-text class="rainbow-text">
            {{ $t('playlist.delete.confirm-message') }}
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="var(--text-color)"
              @click="isDeleteModalOpen = false"
            >
              {{ $t('playlist.delete.disagree') }}
            </v-btn>
            <v-btn
              id="validateDeletionButton"
              :loading="waitingForDeletion"
              class="rainbow-v-btn font-weight-bold"
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
        <!-- 2.1 Sort by genre -->
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
      <div v-if="playlist.tracks.length >= 4 && playlistsStore.getTopGenres(playlistId).length >= 4">
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
                indeterminate
                color="var(--text-color)"
              />
            </div>
          </template>
        </v-img>
        <v-slider
          v-if="maxTick > 0"
          id="generate-image-size-slider"
          v-model="generateImageSize"
          :ticks="ticks"
          :max="maxTick"
          step="1"
          show-ticks="always"
          tick-size="4"
          color="var(--text-color)"
          prepend-icon="mdi-arrange-send-to-back"
          @touchstart.stop
        />
        <div id="sliders">
          <v-switch
            v-model="generateImageDisplayTitle"
            color="var(--text-color)"
            class="generate-image-switch"
          >
            <template #label>
              <p :class="generateImageDisplayTitle ? 'rainbow-text' : ''">
                {{ $t('drawer.image-display-title') }}
              </p>
            </template>
          </v-switch>
          <v-switch
            v-model="generateImageDisplayStats"
            color="var(--text-color)"
            class="generate-image-switch"
          >
            <template #label>
              <p :class="generateImageDisplayStats ? 'rainbow-text' : ''">
                {{ $t('drawer.image-display-stats') }}
              </p>
            </template>
          </v-switch>
        </div>
        <div id="generate-image-button">
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
    :playlist-id="playlist.id"
    :new-tracks="[]"
    :filter-tag="''"
    @on-end="startDuplication = false"
  />
</template>
<script lang="ts">
import { storeToRefs } from 'pinia'
import { defineComponent, toRef } from 'vue'

import DuplicatorPopup from '@/components/playlist_detail/DuplicatorPopup.vue'
import { downloadImage, GridSize, makeImage } from '@/services/playlistImageMaker'
import { MY_MUSIC_PLAYLIST_ID, usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'ActionDrawer',
  components: { DuplicatorPopup },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    playlistId: {
      type: String,
      required: true
    }
  },
  emits: ['onClose', 'onSortEnd'],
  setup (props) {
    const playlistsStore = usePlaylistsStore()
    const currentUserUsername = useUserStore().username

    // Shorthand
    const { playlists } = storeToRefs(playlistsStore)
    const playlist = toRef(playlists.value, props.playlistId)

    return {
      playlistsStore,
      playlist,
      currentUserUsername
    }
  },
  data () {
    return {
      isOpen: false,
      isDeleteModalOpen: false,
      waitingForDeletion: false,

      generateImageSize: 0,
      generateImageDisplayTitle: true,
      generateImageDisplayStats: true,

      imagePreview: '',

      startDuplication: false
    }
  },
  computed: {
    isNotMyMusicPlaylist (): boolean {
      return this.playlist.id !== MY_MUSIC_PLAYLIST_ID
    },
    starImage (): string {
      return require('@/assets/stars.jpg')
    },
    userOwnsPlaylist (): boolean {
      return this.currentUserUsername === this.playlist.owner.display_name
    },
    spotifyOwnsPlaylist (): boolean {
      return this.playlist.owner.id === 'spotify'
    },
    ticks (): Record<number, string> {
      const trackNumber = this.playlistsStore.getTopArtists(this.playlistId).length
      const ticks: Record<number, string> = {}
      if (trackNumber >= 4) ticks[0] = '2x2'
      if (trackNumber >= 9) ticks[1] = '3x3'
      if (trackNumber >= 16) ticks[2] = '4x4'
      return ticks
    },
    maxTick (): number {
      return Object.keys(this.ticks).length - 1
    },
    allTracksLoaded (): boolean {
      return this.playlist.tracks.length === this.playlist.total
    },
    canCreateExportImage (): boolean {
      return this.playlist.tracks.length >= 4 && this.playlistsStore.getTopGenres(this.playlistId).length >= 4
    },
    canUpdatePlaylistName (): boolean {
      return ((this.userOwnsPlaylist || this.spotifyOwnsPlaylist) && !this.playlist.collaborative && this.isNotMyMusicPlaylist) ||
        this.allTracksLoaded ||
        this.isNotMyMusicPlaylist
    }
  },
  watch: {
    // Have to use this to synchronise props as I can't use props as VModel
    open (newValue: boolean) {
      this.isOpen = newValue
      this.updateImagePreview()
    },
    isOpen (newValue: boolean) {
      !newValue && this.$emit('onClose')
    },
    generateImageSize () { this.updateImagePreview() },
    generateImageDisplayTitle () { this.updateImagePreview() },
    generateImageDisplayStats () { this.updateImagePreview() },
    isDeleteModalOpen (newValue: boolean) {
      // 💩 Dirty code
      // 1. Using ref return the Vuetify button instance which is not easily focusable
      // 2. As the modal is injected into the DOM, we need to wait some time before being able to select the element
      // 3. nextTick does not work
      newValue && setTimeout(
        () => {
          const deleteButton = (document.getElementById('validateDeletionButton') as HTMLButtonElement)
          deleteButton.focus()
        },
        500
      )
    }
  },
  methods: {
    startDuplicationProcess () {
      this.isOpen = false
      this.startDuplication = true
    },
    updateImagePreview () {
      if (!this.canCreateExportImage) return

      makeImage(
        this.playlistId,
        ([2, 3, 4] as GridSize[])[this.generateImageSize],
        this.generateImageDisplayTitle,
        this.generateImageDisplayStats,
        (rawImageData: string) => { this.imagePreview = rawImageData }
      )
    },
    async updatePlaylistPrivacy (isPublic: boolean) {
      await this.playlistsStore.updatePlaylistPrivacy(this.playlistId, isPublic)
      this.isOpen = false
    },
    async sortPlaylistTracksByGenres () {
      await this.playlistsStore.sortPlaylistTracksByGenres(this.playlistId)
      this.$emit('onSortEnd')
    },
    async sortPlaylistTracksByArtistTrackInPlaylist () {
      await this.playlistsStore.sortPlaylistTracksByArtistTrackInPlaylist(
        this.playlistId
      )
      this.$emit('onSortEnd')
    },
    async sortPlaylistTracksByArtistName () {
      await this.playlistsStore.sortPlaylistTracksByArtistName(
        this.playlistId
      )
      this.$emit('onSortEnd')
    },
    async exportArtistPreview () {
      makeImage(
        this.playlistId,
        ([2, 3, 4] as GridSize[])[this.generateImageSize],
        this.generateImageDisplayTitle,
        this.generateImageDisplayStats,
        (rawImageData: string) => { downloadImage(rawImageData, this.playlist.name) }
      )
    },
    async unfollowPlaylist () {
      this.isDeleteModalOpen = false
      this.waitingForDeletion = true
      const toDeletePlaylistId = this.playlistId
      await this.playlistsStore.unfollowPlaylist(toDeletePlaylistId)
      this.waitingForDeletion = false
      this.$router.push({ name: 'Explore' })
    }
  }
})
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
  height: 30px;

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
  color: var(--text-color);
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

.white-text {
  /* like rainbow-text but only white */
  -webkit-text-fill-color: lightgray;
}
</style>
