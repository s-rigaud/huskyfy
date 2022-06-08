<template>
  <!-- Part which extend on the playlist detail -->
  <div v-if="playlistsStore.selectedPlaylistId != null && playlistsStore.playlists[playlistsStore.selectedPlaylistId]"
    id="header-blocks">

    <!-- Info about the playlist -->
    <div id="playlist-info">
      <v-img v-bind:src="
        playlistsStore.playlists[playlistsStore.selectedPlaylistId].images[0]
          .url
      " id="playlist-image" :lazy-src="loadingCover" cover></v-img>
      <div>
        <div id="title">
          <h3 style="margin-right: 5px">
            {{ playlistsStore.playlists[playlistsStore.selectedPlaylistId].name }}
          </h3>

          <v-tooltip location="top">
            <template v-slot:activator="{ props: tooltip }">
              <h3 v-bind="tooltip">{{ getEmojiFromVisibility }}</h3>
            </template>
            <span>{{ gettextFromVisibility }}</span>
          </v-tooltip>
        </div>

        <p>
          {{
              playlistsStore.playlists[playlistsStore.selectedPlaylistId]
                .description.replace( /(<([^>]+)>)/ig, '')
          }}
        </p>
        <p style="opacity: 0.5">
          {{ $t("playlist.created-by") }} {{ usernameToDisplay }}
        </p>
      </div>
    </div>

    <!-- Buttons to manage playlist options -->
    <div style="
        position: fixed;
        right: 0;
        bottom: 0;
        margin-top: 5px;
        padding: 3px;
        display: flex;
      ">
      <div id="update-playlist-privacy" v-if="
        userOwnsPlaylist &&
        !playlistsStore.playlists[playlistsStore.selectedPlaylistId]
          .collaborative
      ">
        <v-btn @click="setPlaylistPrivate" v-if="
          playlistsStore.playlists[playlistsStore.selectedPlaylistId].public
        " variant="outlined">
          {{ $t("playlist.set-private") }}
        </v-btn>
        <v-btn v-else @click="setPlaylistPublic" variant="outlined">
          {{ $t("playlist.set-public") }}
        </v-btn>
      </div>

      <v-btn id="duplicate-playlist-button" variant="outlined"
        v-if="playlistsStore.playlists[playlistsStore.selectedPlaylistId].tracks.length > 1" @click="createNewPlaylist">
        {{ $t("playlist.duplicate.button") }}
      </v-btn>

      <v-btn @click="exportPreview" variant="outlined" v-bind="tooltip">
        {{ $t("playlist.export-preview") }}
      </v-btn>
      <v-btn @click="openPlaylistOnSpotify" id="open-spotify-playlist-button" variant="outlined">
        {{ $t("playlist.open-on-spotify") }}
        <v-img width="25" :src="spotifyLogo" alt="Spotify Logo" />
      </v-btn>

      <v-dialog persistent v-model="isDeleteModalOpen">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="outlined">
            {{ $t("playlist.unfollow") }}
          </v-btn>
        </template>

        <!-- DELETE MODAL -->
        <v-card>
          <v-card-title class="text-h5">
            {{ $t('playlist.delete.delete') }}
            '{{ playlistsStore.playlists[playlistsStore.selectedPlaylistId].name }}'
          </v-card-title>
          <v-card-text>
            {{ $t('playlist.delete.confirm-message') }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="isDeleteModalOpen = false">
              {{ $t('playlist.delete.disagree') }}
            </v-btn>
            <v-btn v-if="!waitingForDeletion" color="red darken-1" text @click="unfollowPlaylist">
              {{ $t('playlist.delete.agree') }}
            </v-btn>
            <v-progress-circular v-else indeterminate color="red"></v-progress-circular>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>

  <DuplicatorPopup v-if="startDuplication"
    :playlistId="playlistsStore.playlists[playlistsStore.selectedPlaylistId].id" />
</template>

<script>
import DuplicatorPopup from '@/components/navbar/DuplicatorPopup.vue'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'

export default {
  name: 'NavbarPlaylistSelected',
  components: { DuplicatorPopup },
  setup () {
    const userStore = useUserStore()
    const playlistsStore = usePlaylistsStore()

    const currentUserUsername = userStore.username

    return { currentUserUsername, playlistsStore }
  },
  data () {
    return {
      isDeleteModalOpen: false,
      startDuplication: false,
      tooltip: null,
      waitingForDeletion: false
    }
  },
  computed: {
    usernameToDisplay () {
      const playlistCreator =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId]
          .owner.display_name

      return this.currentUserUsername === playlistCreator
        ? this.$t('me')
        : playlistCreator
    },
    userOwnsPlaylist () {
      return (
        this.currentUserUsername ===
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId]
          .owner.display_name
      )
    },
    spotifyLogo () {
      return require('@/assets/spotify.png')
    },
    getEmojiFromVisibility () {
      const playlist =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId]

      if (playlist.collaborative) return '🤝'
      if (playlist.public) return '📣'
      return '🔒'
    },
    gettextFromVisibility () {
      const playlist =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId]

      if (playlist.collaborative) return this.$t('playlist.collaborative')
      if (playlist.public) return this.$t('playlist.public')
      return this.$t('playlist.private')
    },
    loadingCover () {
      return require('@/assets/default_cover.jpg')
    }
  },
  methods: {
    openPlaylistOnSpotify () {
      window.location.href =
        this.playlistsStore.playlists[
          this.playlistsStore.selectedPlaylistId
        ].uri
    },
    exportPreview () {
      alert('Preview no available right now')
    },
    createNewPlaylist () {
      this.startDuplication = true
    },
    async unfollowPlaylist () {
      this.isDeleteModalOpen = false
      this.waitingForDeletion = true
      const toDeletePlaylistId = this.playlistsStore.selectedPlaylistId
      await this.playlistsStore.unfollowPlaylist(toDeletePlaylistId)
      this.playlistsStore.selectedPlaylistId = null
      this.waitingForDeletion = false
      this.$router.push({ name: 'Explore' })
    },
    async setPlaylistPublic () {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistsStore.selectedPlaylistId,
        true
      )
    },
    async setPlaylistPrivate () {
      await this.playlistsStore.updatePlaylistPrivacy(
        this.playlistsStore.selectedPlaylistId,
        false
      )
    }
  }
}
</script>
<style>
#title {
  display: inline-flex;
}

#header-blocks {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 2px #ccc solid;
  margin: 5px;
  width: 100%;
  transition: 55s all ease;
}

#playlist-info {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
  max-height: 72px;
  margin: inherit;
}

#playlist-image {
  width: 70px !important;
  max-width: 70px !important;
  height: 70px !important;
  max-height: 70px !important;
  margin: 1px 10px 1px 1px;
}

.v-btn {
  margin: 0px 2px;
}

.v-btn.v-btn--density-default {
  height: 30px;
  padding: 0px 5px
}

#open-spotify-playlist-button .v-btn__content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

#open-spotify-playlist-button .v-btn__content img {
  margin: 0px 3px;
  width: 20px;
}
</style>
