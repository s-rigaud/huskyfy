<template>
  <v-navigation-drawer v-model="isOpen" temporary location="right"
    image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg">
    <v-list>
      <v-list-subheader class="font-weight-bold">{{ $t('drawer.update-playlist') }}</v-list-subheader>
      <!-- 1.1 Update playlist privacy -->
      <div v-if="userOwnsPlaylist && !playlistsStore.playlists[playlistId].collaborative">
        <v-list-item v-if="playlistsStore.playlists[playlistId].public" @click="setPlaylistPrivate">
          <v-list-item-title>{{ $t("playlist.set-private") }} {{ $t("_emojis.private") }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-else @click="setPlaylistPublic">
          <v-list-item-title>{{ $t("playlist.set-public") }} {{ $t("_emojis.public") }}</v-list-item-title>
        </v-list-item>
      </div>

      <!-- 1.2 Duplicate playlist -->
      <v-tooltip location="bottom" v-if="playlistsStore.playlists[playlistId].tracks.length > 1">
        <template v-slot:activator="{ props: visibilityTooltip }">
          <v-list-item v-bind="visibilityTooltip" @click="$emit('duplicatePlaylist')">
            <v-list-item-title>{{ $t("playlist.duplicate.button") }}</v-list-item-title>
          </v-list-item>
        </template>
        <span> {{ $t("playlist.duplicate.tooltip") }} </span>
      </v-tooltip>

      <!-- 1.3 Playlist deletion -->
      <v-dialog v-model="isDeleteModalOpen">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props">
            <v-list-item-title>{{ $t("playlist.unfollow") }}</v-list-item-title>
          </v-list-item>
        </template>
        <v-card>
          <v-card-title class="text-h5 rainbow-text font-weight-bold">
            {{ $t('playlist.delete.delete') }}
            '<span class="font-italic">
              {{ playlistsStore.playlists[playlistId].name }}
            </span>'
          </v-card-title>
          <v-card-text class="rainbow-text">
            {{ $t('playlist.delete.confirm-message') }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" plain @click="isDeleteModalOpen = false">
              {{ $t('playlist.delete.disagree') }}
            </v-btn>
            <v-btn :loading="!waitingForDeletion" plain color="success" @click="unfollowPlaylist">
              {{ $t('playlist.delete.agree') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-divider></v-divider>

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

      <!-- (At least 4 tracks to download image) -->
      <div v-if="playlistsStore.playlists[playlistId].tracks.length > 3">
        <v-list-subheader>
          {{ $t('drawer.export-image') }}
        </v-list-subheader>
        <!-- 3.1 Export Image -->
        <v-slider :ticks="{0: '2x2', 1: '3x3', 2: '4x4'}" :max="2" step="1" show-ticks="always" tick-size="4"
          color="var(--text-color)" prepend-icon="mdi-arrange-send-to-back" v-model="generateImageSize" @touchstart.stop
          id="generate-image-size-slider">
        </v-slider>
        <v-switch v-model="generateImageDisplayTitle" color="var(--link-color)" class="generate-image-switch">
          <template v-slot:label>
            <p :class="(generateImageDisplayTitle)?'rainbow-text':''">{{ $t('drawer.image-display-title') }}</p>
          </template>
        </v-switch>
        <v-switch v-model="generateImageDisplayStats" color="var(--link-color)" value="var(--link-color)"
          class="generate-image-switch">
          <template v-slot:label>
            <p :class="(generateImageDisplayStats)?'rainbow-text':''">{{ $t('drawer.image-display-stats') }}</p>
          </template>
        </v-switch>
        <div id="generate-image-button">
          <v-btn @click="exportArtistPreview" class="rainbow-v-btn">{{ $t("playlist.export-preview") }}</v-btn>
        </div>
      </div>

    </v-list>
  </v-navigation-drawer>
</template>
<script lang="ts">
import makeAndDownloadImage from '@/services/playlistImageMaker'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ActionDrawer',
  emits: ['onClose', 'duplicatePlaylist'],
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
  setup() {
    const playlistsStore = usePlaylistsStore()
    const currentUserUsername = useUserStore().username

    return {
      playlistsStore,
      currentUserUsername
    }
  },
  watch: {
    // Have to use this to synchronise props as I can't use props as VModel
    open(newValue: boolean) {
      this.isOpen = newValue
    },
    isOpen(newValue: boolean) {
      if (newValue === false) {
        this.$emit('onClose')
      }
    }
  },
  data() {
    return {
      isOpen: false,
      isDeleteModalOpen: false,
      waitingForDeletion: false,

      generateImageSize: 0,
      generateImageDisplayTitle: true,
      generateImageDisplayStats: false
    }
  },
  methods: {
    async setPlaylistPrivate() {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistId,
        false
      )
    },
    async setPlaylistPublic() {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistId,
        true
      )
    },
    async sortPlaylistTracksByGenres() {
      await this.playlistsStore.sortPlaylistTracksByGenres(
        this.playlistId
      )
    },
    async sortPlaylistTracksByArtistTrackInPlaylist() {
      await this.playlistsStore.sortPlaylistTracksByArtistTrackInPlaylist(
        this.playlistId
      )
    },
    async sortPlaylistTracksByArtistName() {
      await this.playlistsStore.sortPlaylistTracksByArtistName(
        this.playlistId
      )
    },
    async exportArtistPreview() {
      makeAndDownloadImage(
        this.playlistId,
        ['2x2', '3x3', '4x4'][this.generateImageSize],
        this.generateImageDisplayTitle,
        this.generateImageDisplayStats
      )
    },
    async unfollowPlaylist() {
      this.isDeleteModalOpen = false
      this.waitingForDeletion = true
      const toDeletePlaylistId = this.playlistId
      await this.playlistsStore.unfollowPlaylist(toDeletePlaylistId)
      this.waitingForDeletion = false
      this.$router.push({ name: 'Explore' })
    }
  },
  computed: {
    userOwnsPlaylist(): boolean {
      return (
        this.currentUserUsername ===
        this.playlistsStore.playlists[this.playlistId]
          .owner.display_name
      )
    }
  }
})
</script>
<style scoped>
#generate-image-size-slider {
  width: 90%;
  margin: 0 0 0 3px;
  height: 50px
}

.generate-image-switch {
  height: 40px;
  margin-left: 10px
}

#generate-image-button {
  display: flex;
  align-items: center;
  flex-direction: column;
}
</style>