<template>
  <!-- Playlist representation as a card -->
  <v-card flat @click="displayDetails" class="playlist-card">
    <v-img rel="preconnect" :src="images[0].url" alt="Playlist cover" :lazy-src="loadingCover" cover>
    </v-img>
    <v-card-title>
      <p class="text-truncate rainbow-text card-title"> {{ name }} </p>
    </v-card-title>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { SpotifyImage } from '@/api/spotify/types/entities'

export default defineComponent({
  name: 'PlaylistCard',
  props: {
    id: String,
    name: String,
    images: {
      type: Array as PropType<SpotifyImage[]>,
      required: true
    }
  },
  computed: {
    loadingCover(): string {
      return require('@/assets/default_cover.jpg')
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
  width: max(150px, 45%);
  height: auto;
  margin: 0px 3px 15px 3px;
  padding: 10px 10px 0px 10px;

  color: var(--text-color) !important;
  background-color: initial;

  display: flex;
  flex-direction: column;

  animation: playlist-append 500ms linear;
  animation-fill-mode: forwards;
  opacity: 0;
}

.playlist-card .card-title {
  font-size: large;
}

.playlist-card .v-img {
  z-index: 1;
}

.playlist-card .v-img .v-img__img--cover {
  transition: filter 0.2s ease-in-out;
  filter: brightness(1);
}

.playlist-card:hover .v-img__img--cover {
  filter: brightness(0.8);
}

.playlist-card .v-card-title {
  letter-spacing: 0;
  white-space: nowrap;
  line-height: normal;
  padding: 5px 0px;
}

.playlist-card .v-card__overlay {
  opacity: 0.1;
  transition: 0.5s opacity ease;
}

.playlist-card:hover .v-card__overlay {
  opacity: 0.3;
}

@media only screen and (min-width: 768px) {
  .playlist-card {
    width: 30%;
  }
}

@media only screen and (min-width: 992px) {
  .playlist-card {
    width: 24%;
  }

  .playlist-card .v-card-title {
    padding: 7px 0px;
  }
}

@media only screen and (min-width: 1200px) {
  .playlist-card {
    width: 16%;
  }

  .playlist-card .v-card-title {
    padding: 5px 0px;
  }
}
</style>
