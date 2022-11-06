<template>
  <v-navigation-drawer id="drawer" v-model="isOpen" temporary location="right" image='@/assets/stars.jpg'
    elevation="20">
    <v-list>
      <v-list-subheader>{{ $t('drawer.update-playlist') }}</v-list-subheader>
      <!-- 1.1 Update playlist privacy -->
      <div v-if="(userOwnsPlaylist || spotifyOwnsPlaylist) && !playlistsStore.playlists[playlistId].collaborative">
        <v-list-item v-if="playlistsStore.playlists[playlistId].public" @click="setPlaylistPrivate">
          <v-list-item-title>{{ $t("playlist.set-private") }} {{ $t("_emojis.private") }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-else @click="setPlaylistPublic">
          <v-list-item-title>{{ $t("playlist.set-public") }} {{ $t("_emojis.public") }}</v-list-item-title>
        </v-list-item>
      </div>

      <!-- 1.2 Duplicate playlist -->
      <v-list-item @click="$emit('duplicatePlaylist')">
        <v-list-item-title>{{ $t("playlist.duplicate.button") }}</v-list-item-title>
      </v-list-item>

      <!-- 1.3 Playlist deletion -->
      <v-dialog v-model="isDeleteModalOpen">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props">
            <v-list-item-title>{{ $t("playlist.unfollow") }}</v-list-item-title>
          </v-list-item>
        </template>
        <v-card id="deletion-dialog">
          <v-card-title class="text-h5 rainbow-text font-weight-bold">
            {{ $t('playlist.delete.delete') }}
            <span class="font-italic">
              {{ playlistsStore.playlists[playlistId].name }}
            </span>
          </v-card-title>
          <v-card-text class="rainbow-text">
            {{ $t('playlist.delete.confirm-message') }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="var(--text-color)" @click="isDeleteModalOpen = false">
              {{ $t('playlist.delete.disagree') }}
            </v-btn>
            <v-btn :loading="waitingForDeletion" class="rainbow-v-btn font-weight-bold" @click="unfollowPlaylist">
              {{ $t('playlist.delete.agree') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider></v-divider>

      <div v-if="userOwnsPlaylist">
        <v-list-subheader> {{ $t('drawer.reorder-playlist') }} </v-list-subheader>
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

        <v-divider></v-divider>
      </div>

      <!-- (At least 4 tracks to download image) -->
      <div v-if="playlistsStore.playlists[playlistId].tracks.length > 3">
        <v-list-subheader>
          {{ $t('drawer.export-image') }}
        </v-list-subheader>
        <!-- 3.1 Export Image -->

        <v-img id="live-image-preview" :src="imagePreview" lazy-src='@/assets/loading-image-preview.jpg'>
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate color="var(--text-color)"></v-progress-circular>
            </div>
          </template>
        </v-img>
        <v-switch v-model="generateImageDisplayTitle" color="var(--text-color)" class="generate-image-switch">
          <template v-slot:label>
            <p :class="(generateImageDisplayTitle) ? 'rainbow-text' : ''">{{ $t('drawer.image-display-title') }}</p>
          </template>
        </v-switch>
        <v-switch v-model="generateImageDisplayStats" color="var(--text-color)" class="generate-image-switch">
          <template v-slot:label>
            <p :class="(generateImageDisplayStats) ? 'rainbow-text' : ''">{{ $t('drawer.image-display-stats') }}</p>
          </template>
        </v-switch>
        <v-slider v-if="maxTick > 0" :ticks="ticks" :max="maxTick" step="1" show-ticks="always" tick-size="4"
          color="var(--text-color)" prepend-icon="mdi-arrange-send-to-back" v-model="generateImageSize" @touchstart.stop
          id="generate-image-size-slider">
        </v-slider>
        <div id="generate-image-button">
          <v-btn @click="exportArtistPreview" class="rainbow-v-btn">{{ $t("playlist.export-preview") }}</v-btn>
        </div>
      </div>

    </v-list>
  </v-navigation-drawer>
</template>
<script lang="ts">
import { downloadImage, makeImage } from '@/services/playlistImageMaker'

import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ActionDrawer',
  emits: ['onClose', 'duplicatePlaylist', 'onSortEnd'],
  props: {
    open: {
      type: Boolean,
      required: true
    },
    playlistId: {
      type: String,
      required: true
    },
    filteredTrackLength: Number
  },
  setup () {
    const playlistsStore = usePlaylistsStore()
    const currentUserUsername = useUserStore().username

    return {
      playlistsStore,
      currentUserUsername
    }
  },
  watch: {
    // Have to use this to synchronise props as I can't use props as VModel
    open (newValue: boolean) {
      this.isOpen = newValue
      this.updateImagePreview()
    },
    isOpen (newValue: boolean) {
      if (newValue === false) {
        this.$emit('onClose')
      }
    },
    generateImageSize () { this.updateImagePreview() },
    generateImageDisplayTitle () { this.updateImagePreview() },
    generateImageDisplayStats () { this.updateImagePreview() }
  },
  data () {
    return {
      isOpen: false,
      isDeleteModalOpen: false,
      waitingForDeletion: false,

      generateImageSize: 0,
      generateImageDisplayTitle: true,
      generateImageDisplayStats: true,

      imagePreview: ''
    }
  },
  computed: {
    userOwnsPlaylist (): boolean {
      return (
        this.currentUserUsername ===
        this.playlistsStore.playlists[this.playlistId]
          .owner.display_name
      )
    },
    spotifyOwnsPlaylist (): boolean {
      return this.playlistsStore.playlists[this.playlistId].owner.id === 'spotify'
    },
    ticks () {
      const trackNumber = this.playlistsStore.getTopArtists(this.playlistId).length
      const ticks: { 0?: '2x2', 1?: '3x3', 2?: '4x4' } = {}
      if (trackNumber >= 4) ticks[0] = '2x2'
      if (trackNumber >= 9) ticks[1] = '3x3'
      if (trackNumber >= 16) ticks[2] = '4x4'
      return ticks
    },
    maxTick (): number {
      return Object.keys(this.ticks).length - 1
    }
  },
  methods: {
    updateImagePreview () {
      makeImage(
        this.playlistId,
        ['2x2', '3x3', '4x4'][this.generateImageSize],
        this.generateImageDisplayTitle,
        this.generateImageDisplayStats,
        (dataUrl: string) => {
          this.imagePreview = dataUrl
        }
      )
    },
    async setPlaylistPrivate () {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistId,
        false
      )
    },
    async setPlaylistPublic () {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistId,
        true
      )
    },
    async sortPlaylistTracksByGenres () {
      await this.playlistsStore.sortPlaylistTracksByGenres(
        this.playlistId
      )
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
        ['2x2', '3x3', '4x4'][this.generateImageSize],
        this.generateImageDisplayTitle,
        this.generateImageDisplayStats,
        (dataUrl: string) => {
          downloadImage(
            dataUrl,
            this.playlistsStore.playlists[this.playlistId].name)
        }
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
  z-index: 3000 !important;
  min-width: 30%;
}

#drawer .v-slider__container {
  width: 90%;
}

#drawer .generate-image-switch {
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

#drawer .v-list-subheader {
  font-size: large;

  /* rainbow-text here required */
  background: linear-gradient(180deg, var(--text-color) 20%, var(--link-color) 51%, var(--text-color) 86%);
  background-size: 100%;
  background-repeat: repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
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
  max-width: fit-content;
  margin: auto;
}

#live-image-preview {
  margin: 0px 5px;
}

#drawer .v-list-item:hover>.v-list-item__overlay {
  opacity: calc(0.2 * var(--v-theme-overlay-multiplier));
}
</style>
