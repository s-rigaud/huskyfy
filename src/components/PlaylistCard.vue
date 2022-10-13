<template>
  <!-- Playlist representation as a card -->
  <v-card flat @click="displayDetails" class="playlist-card">
    <v-img rel="preconnect" :src="images![0].url" alt="Playlist cover" :lazy-src="loadingCover" height="400px" cover>
    </v-img>

    <v-card-title>
      <p class="text-truncate rainbow-text"> {{ name }} </p>
    </v-card-title>

    <v-card-subtitle class="pad-title-0">
      <p>{{ $t("playlist.created-by") }} {{ owner }}</p>
    </v-card-subtitle>
    <v-card-subtitle class="pad-title-0 visibility-status">
      <p v-if="collaborative">{{ $t("playlist.collaborative") }} {{ $t("_emojis.collaborative") }}</p>
      <p v-else-if="public">{{ $t("playlist.public") }} {{ $t("_emojis.public") }}</p>
      <p v-else> {{ $t("playlist.private") }} {{ $t("_emojis.private") }}</p>
    </v-card-subtitle>
    <v-img rel="preconnect" width="30" :src="horus" alt="Horus Image" class="horus-img"></v-img>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { SpotifyImage } from '@/api/spotify/types/entities'

export default defineComponent({
  name: 'PlaylistCard',
  props: {
    id: String,
    name: String,
    images: {
      type: Array as () => SpotifyImage[]
    },
    owner: String,
    public: Boolean,
    collaborative: Boolean
  },
  computed: {
    loadingCover(): string {
      return require('@/assets/default_cover.jpg')
    },
    horus(): string {
      return require('@/assets/oeil-dhorus.png')
    }
  },
  methods: {
    displayDetails() {
      this.$router.push({
        name: 'Explore playlist',
        params: { playlistId: this.id }
      })
    }
  }
})
</script>
<style>
/*

/!\ Not scoped css as v-card__overlay is only define internally in Vuetify

*/
@keyframes playlist-append {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.playlist-card {
  width: 250px;
  height: 250px;
  background-color: initial;
  margin: 0px 3px 85px 3px;
  background-color: initial;
  padding: 10px;
  display: flex;
  flex-direction: column;
  color: var(--text-color) !important;
  animation: playlist-append 500ms linear;
  animation-fill-mode: forwards;
  opacity: 0
}

.playlist-card .v-img .v-img__img--cover {
  transition: filter 0.2s ease-in-out;
  filter: brightness(1);
}

.playlist-card:hover .v-img__img--cover {
  filter: brightness(0.8);
}

.playlist-card .v-card__overlay {
  height: 322px;
}

.playlist-card .v-card-title {
  padding: 0;
  letter-spacing: 0;
  white-space: nowrap;
}

.playlist-card .v-card__overlay {
  opacity: 0.1;
  transition: 0.5s opacity ease;
}

.playlist-card:hover .v-card__overlay {
  opacity: 0.2;
}

/* Horus symbol on cards */
.horus-img {
  position: relative;
  opacity: 0;
  bottom: 25px;
  left: 200px;
  transition: 0.5s opacity linear;
}

.playlist-card:hover .horus-img {
  opacity: 1;
}

.pad-title-0 {
  padding: 0;
}

.visibility-status {
  padding: 0;
  letter-spacing: 0;
  white-space: nowrap;
}

@media (max-width: 992px) {
  .playlist-card {
    width: 150px;
    height: 150px;
  }

  .playlist-card .v-card__overlay {
    height: 222px;
  }
}
</style>
