<template>
  <!-- Part which extend on the playlist detail -->
  <div v-if="playlistsStore.selectedPlaylistId != null && playlistsStore.playlists[playlistsStore.selectedPlaylistId]"
    id="header-blocks">

    <!-- Info about the playlist -->
    <div id="playlist-info" @click="openPlaylistOnSpotify">
      <v-img id="playlist-image" v-bind:src="playlistsStore.playlists[playlistsStore.selectedPlaylistId].images[0].url"
        :lazy-src="loadingCover" alt="Cover image" cover rel="preconnect">
      </v-img>
      <div id="info-embedded">
        <div id="title">
          <h3 style="margin-right: 5px" class="text-truncate rainbow-text">
            {{ playlistsStore.playlists[playlistsStore.selectedPlaylistId].name }}
          </h3>

          <v-tooltip location="bottom">
            <template v-slot:activator="{ props: visibilityTooltip }">
              <h3 v-bind="visibilityTooltip">{{ getEmojiFromVisibility }}</h3>
            </template>
            <span>{{ getTextFromVisibility }}</span>
          </v-tooltip>
        </div>

        <p id="description" class="text-truncate">
          {{
                    playlistsStore.playlists[playlistsStore.selectedPlaylistId].description.replace(/(<([^>]+)>)/ig, '')
          }}
        </p>
        <p style="opacity: 0.8">
          {{ $t("playlist.created-by") }} {{ usernameToDisplay }}
        </p>
      </div>
    </div>

    <!-- Buttons to manage playlist options -->
    <div id="action-buttons">
      <!-- Playlist modification menu -->
      <v-menu open-on-hover :location="userOwnsPlaylist? 'bottom': 'bottom end'">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props">
            %% update playlist %%
          </v-btn>
        </template>
        <v-list>

          <!-- 1. Update playlist privacy -->
          <div v-if="userOwnsPlaylist && !playlistsStore.playlists[playlistsStore.selectedPlaylistId].collaborative">
            <v-list-item v-if="playlistsStore.playlists[playlistsStore.selectedPlaylistId].public"
              @click="setPlaylistPrivate">
              <v-list-item-title>{{ $t("playlist.set-private") }} {{ $t("_emojis.private") }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-else @click="setPlaylistPublic">
              <v-list-item-title>{{ $t("playlist.set-public") }} {{ $t("_emojis.public") }}</v-list-item-title>
            </v-list-item>
          </div>

          <!-- 2. Duplicate playlist -->
          <v-tooltip location="bottom"
            v-if="playlistsStore.playlists[playlistsStore.selectedPlaylistId].tracks.length > 1">
            <template v-slot:activator="{ props: visibilityTooltip }">
              <v-list-item v-bind="visibilityTooltip" @click="createNewPlaylist">
                <v-list-item-title>{{ $t("playlist.duplicate.button") }}</v-list-item-title>
              </v-list-item>
            </template>
            <span> {{ $t("playlist.duplicate.tooltip") }} </span>
          </v-tooltip>

          <!-- 3. Export Image -->
          <v-list-item @click="exportPreview"
            v-if="playlistsStore.playlists[playlistsStore.selectedPlaylistId].tracks.length > 3">
            <!-- (At least 4 tracks to download image) -->
            <v-list-item-title>{{ $t("playlist.export-preview") }}</v-list-item-title>
          </v-list-item>

          <!-- 4. Playlist deletion -->
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
                  {{ playlistsStore.playlists[playlistsStore.selectedPlaylistId].name }}
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
                <v-btn v-if="!waitingForDeletion" plain color="success" @click="unfollowPlaylist">
                  {{ $t('playlist.delete.agree') }}
                </v-btn>

                <v-progress-circular v-else indeterminate color="red"></v-progress-circular>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-list>
      </v-menu>

      <!-- Sorting menu -->
      <v-menu open-on-hover location="bottom end" v-if="userOwnsPlaylist">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props">
            %% réordonner %%
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="sortPlaylistTracksByGenres">
            <v-list-item-title>%% sort genre %%</v-list-item-title>
          </v-list-item>
          <v-list-item @click="sortPlaylistTracksByArtistPopularity">
            <v-list-item-title>%% sort artist pop %%</v-list-item-title>
          </v-list-item>
          <v-list-item @click="sortPlaylistTracksByArtistName">
            <v-list-item-title>%% sort artist name %%</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>

  <DuplicatorPopup v-if="startDuplication"
    :playlistId="playlistsStore.playlists[playlistsStore.selectedPlaylistId!].id" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import DuplicatorPopup from '@/components/navbar/DuplicatorPopup.vue'
import makeAndDownloadImage from '@/services/playlistImageMaker'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'NavbarPlaylistSelected',
  components: { DuplicatorPopup },
  setup() {
    const userStore = useUserStore()
    const playlistsStore = usePlaylistsStore()

    const currentUserUsername = userStore.username

    return { currentUserUsername, playlistsStore }
  },
  data() {
    return {
      isDeleteModalOpen: false,
      startDuplication: false,
      visibilityTooltip: null,
      duplicateTooltip: null,
      waitingForDeletion: false
    }
  },
  computed: {
    usernameToDisplay(): string {
      const playlistCreator =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId!]
          .owner.display_name

      return this.currentUserUsername === playlistCreator
        ? this.$t('me')
        : playlistCreator
    },
    userOwnsPlaylist(): boolean {
      return (
        this.currentUserUsername ===
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId!]
          .owner.display_name
      )
    },
    getEmojiFromVisibility(): string {
      const playlist =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId!]

      if (playlist.collaborative) return this.$t('_emojis.collaborative')
      if (playlist.public) return this.$t('_emojis.public')
      return this.$t('_emojis.private')
    },
    getTextFromVisibility(): string {
      const playlist =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId!]

      if (playlist.collaborative) return this.$t('playlist.collaborative') + ' ' + this.$t('_emojis.collaborative')
      if (playlist.public) return this.$t('playlist.public') + ' ' + this.$t('_emojis.public')
      return this.$t('playlist.private') + ' ' + this.$t('_emojis.private')
    },
    loadingCover(): string {
      return require('@/assets/default_cover.jpg')
    }
  },
  methods: {
    openPlaylistOnSpotify() {
      window.location.href =
        this.playlistsStore.playlists[
          this.playlistsStore.selectedPlaylistId!
        ].uri
    },
    async exportPreview() {
      makeAndDownloadImage(this.playlistsStore.selectedPlaylistId!)
    },
    createNewPlaylist() {
      this.startDuplication = true
    },
    async unfollowPlaylist() {
      this.isDeleteModalOpen = false
      this.waitingForDeletion = true
      const toDeletePlaylistId = this.playlistsStore.selectedPlaylistId!
      await this.playlistsStore.unfollowPlaylist(toDeletePlaylistId)
      this.playlistsStore.selectedPlaylistId = null
      this.waitingForDeletion = false
      this.$router.push({ name: 'Explore' })
    },
    async setPlaylistPublic() {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistsStore.selectedPlaylistId!,
        true
      )
    },
    async sortPlaylistTracksByGenres() {
      await this.playlistsStore.sortPlaylistTracksByGenres(
        this.playlistsStore.selectedPlaylistId!
      )
    },
    async sortPlaylistTracksByArtistPopularity() {
      await this.playlistsStore.sortPlaylistTracksByArtistPopularity(
        this.playlistsStore.selectedPlaylistId!
      )
    },
    async sortPlaylistTracksByArtistName() {
      await this.playlistsStore.sortPlaylistTracksByArtistName(
        this.playlistsStore.selectedPlaylistId!
      )
    },
    async setPlaylistPrivate() {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistsStore.selectedPlaylistId!,
        false
      )
    }
  }
})
</script>
<style>
#title {
  display: inline-flex;
}

#description {
  width: 90%;
}

#header-blocks {
  display: flex;
  justify-content: space-between;
  border-top: 2px var(--text-color) solid;
  margin: 0px 5px;
  width: 100%;
  transition: 55s all ease;
}

#playlist-info {
  display: flex;
  flex-direction: row;
  max-height: 72px;
  /* Image is 70px and 2 buttons of 100px */
  width: calc(100% - 200px);
  cursor: pointer;
}

#info-embedded {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* Image is 70px and 2 buttons of 100px */
  width: calc(100% - 270px);
}

#playlist-image {
  width: 70px !important;
  max-width: 70px !important;
  height: 70px !important;
  max-height: 70px !important;
  margin: 1px 10px 1px 0px;
}

#header-blocks .v-btn {
  margin: 0px 2px;
}

#header-blocks .v-btn.v-btn--density-default {
  height: 30px;
  padding: 0px 5px
}

#action-buttons {
  display: flex;
  height: 72px;
}

#action-buttons button {
  height: 100% !important;
  border: none;
  margin: 0;
  border-radius: 0;
  /*width: 100px !important;*/
}

#action-buttons button:hover {
  /* rainbow-v-btn */
  color: var(--text-color) !important;
  background: linear-gradient(180deg, var(--text-color) 20%, var(--link-color) 51%, var(--text-color) 86%) !important;
}
</style>
