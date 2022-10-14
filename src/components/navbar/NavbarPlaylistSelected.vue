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

        <p id="description" class="text-truncate"> {{ formattedDescription }} </p>
        <p style="opacity: 0.8"> {{ $t("playlist.created-by") }} {{ usernameToDisplay }} </p>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'NavbarPlaylistSelected',
  setup () {
    const userStore = useUserStore()
    const playlistsStore = usePlaylistsStore()

    const currentUserUsername = userStore.username

    return { currentUserUsername, playlistsStore }
  },
  data () {
    return {
      visibilityTooltip: null
    }
  },
  computed: {
    usernameToDisplay (): string {
      const playlistCreator =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId!]
          .owner.display_name

      return this.currentUserUsername === playlistCreator
        ? this.$t('me')
        : playlistCreator
    },
    getEmojiFromVisibility (): string {
      const playlist =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId!]

      if (playlist.collaborative) return this.$t('_emojis.collaborative')
      if (playlist.public) return this.$t('_emojis.public')
      return this.$t('_emojis.private')
    },
    getTextFromVisibility (): string {
      const playlist =
        this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId!]

      if (playlist.collaborative) return this.$t('playlist.collaborative') + ' ' + this.$t('_emojis.collaborative')
      if (playlist.public) return this.$t('playlist.public') + ' ' + this.$t('_emojis.public')
      return this.$t('playlist.private') + ' ' + this.$t('_emojis.private')
    },
    loadingCover (): string {
      return require('@/assets/default_cover.jpg')
    },
    formattedDescription (): string {
      const playlist = this.playlistsStore.playlists[this.playlistsStore.selectedPlaylistId!]
      return playlist.description.replace(/(<([^>]+)>)/ig, '')
    }
  },
  methods: {
    openPlaylistOnSpotify () {
      window.location.href =
        this.playlistsStore.playlists[
          this.playlistsStore.selectedPlaylistId!
        ].uri
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
