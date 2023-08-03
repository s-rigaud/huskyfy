<template>
  <v-card
    class="playlist-card"
    elevation="10"
    tabindex="0"
    @click="displayDetails"
  >
    <v-img
      :src="images[0].url"
      alt="Playlist cover"
      cover
      lazy-src="@/assets/default_cover.jpg"
      rel="preconnect"
    />

    <v-tooltip
      :text="name"
      class="name-tooltip"
      location="bottom"
    >
      <template #activator="{ props }">
        <v-card-title v-bind="props">
          <p class="text-truncate card-title">
            {{ name }}
          </p>
        </v-card-title>
      </template>
    </v-tooltip>
  </v-card>
</template>

<script setup lang="ts">
import { PropType } from 'vue'

import { SpotifyImage } from '@/api/spotify/types/entities'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  images: {
    type: Array as PropType<SpotifyImage[]>,
    required: true
  },
  trackCount: {
    type: Number,
    required: true
  }
})

const displayDetails = () => {
  router.push({
    name: 'Explore playlist',
    params: { playlistId: props.id }
  })
}
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

  display: flex;
  flex-direction: column;

  color: var(--text-color) !important;
  background-color: initial;
  overflow: unset;
  opacity: 0;

  animation: playlist-append 500ms linear;
  animation-fill-mode: forwards;
}

.playlist-card:hover {
  outline: 3px #F3920099 solid;
}

.playlist-card:focus {
  outline: 3px #F3920099 solid;
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
  filter: brightness(1.15);
}

.playlist-card .v-card-title {
  letter-spacing: 0;
  white-space: nowrap;
  line-height: normal;
  padding: 5px 0px;
}

.playlist-card .v-card__overlay {
  opacity: 0.3;
  background: radial-gradient(circle, var(--primary-color) 40%, #F39200 100%);

  transition: 0.5s opacity ease;
}

.playlist-card:hover .v-card__overlay {
  opacity: 0.3;
}

.name-tooltip .v-overlay__content {
  color: var(--text-color);
  background-color: black;
  border: var(--text-color) .5px solid;
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
