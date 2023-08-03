<template>
  <v-lazy
    :options="{ rootMargin: '400px' }"
    min-height="100"
  >
    <v-list-item
      :style="trackAnimationDelay"
      class="track-item"
      link
      @click="openTrackOnSpotify"
    >
      <template #prepend>
        <p class="track-index">
          {{ trackIndex + 1 }}
        </p>
        <v-avatar
          :options="{ rootMargin: '400px' }"
          class="ma-3 track-image"
          rounded="0"
          size="90"
        >
          <v-img
            :options="{ rootMargin: '400px' }"
            :src="image"
            alt="Cover image"
            lazy-src="@/assets/default_cover.jpg"
            rel="preconnect"
          />
        </v-avatar>
      </template>

      <v-list-item-title class="rainbow-text text-h6">
        {{ name }}
      </v-list-item-title>
      <div class="second-line">
        <div
          v-for="(artist, index) in artists"
          :key="artist.id"
          class="artist-names"
          @click.stop="openArtistOnSpotify(artist)"
        >
          <v-list-item-subtitle
            v-ripple.stop
            class="artist-name text-truncate"
          >
            {{ addCommaDivider(artist.name, index) }}
          </v-list-item-subtitle>
        </div>
        <v-chip
          v-if="isIndie"
          :text="$tc('track.indie', artists.length)"
          class="popularity-chip"
          color="green"
          label
          size="small"
          text-color="white"
        />
        <v-chip
          v-else
          :text="$tc('track.popular', artists.length)"
          class="popularity-chip"
          color="cyan"
          label
          size="small"
        />
      </div>

      <div
        v-if="genres.length > 0"
        class="chips"
      >
        <v-chip
          v-for="(genre, index) in genres.slice(0, genresToDisplayCount)"
          :key="genre"
          :color="getColorForGenre(genre)"
          :style="getGenreAnimationDelay(index)"
          :text="genre.toUpperCase()"
          class="genre-chip"
          label
          size="small"
          variant="elevated"
        />
        <v-chip
          v-if="genres.length > genresToDisplayCount && !displayAllGenres"
          :style="getGenreAnimationDelay(genresToDisplayCount)"
          class="genre-chip"
          label
          size="small"
          text="+"
          variant="elevated"
          @click.stop="displayAllGenres = true"
        />
        <div v-if="displayAllGenres">
          <v-chip
            v-for="(genre, index) in genres.slice(genresToDisplayCount)"
            :key="genre"
            :color="getColorForGenre(genre)"
            :style="getGenreAnimationDelay(index)"
            :text="genre.toUpperCase()"
            class="genre-chip"
            label
            size="small"
            variant="elevated"
          />
        </div>
      </div>
      <v-list-item-subtitle
        v-else
        style="min-height: 20px;"
      >
        {{ $t("track.no-genre") }}
      </v-list-item-subtitle>
    </v-list-item>
  </v-lazy>
</template>

<script setup lang="ts">
import { PropType, ref, computed, onBeforeMount } from 'vue'

import { SpotifyArtist } from '@/api/spotify/types/entities'
import { usePlaylistsStore } from '@/stores/playlists'

const playlistsStore = usePlaylistsStore()

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  artists: {
    type: Array as PropType<SpotifyArtist[]>,
    required: true
  },
  genres: {
    type: Array as PropType<string[]>,
    required: true
  },
  isIndie: {
    type: Boolean,
    required: true
  },
  trackURI: {
    type: String,
    required: true
  },
  trackIndex: {
    type: Number,
    required: true
  }
})

const displayAllGenres = ref(false)
const genresToDisplayCount = ref(2)

// Delay animation so items appear one after another
const trackAnimationDelay = computed((): { 'animation-delay': string } => {
  const delay = (props.trackIndex < 5) ? `${300 * props.trackIndex}ms` : '0ms'
  return { 'animation-delay': delay }
})

onBeforeMount(() => {
  let genreToDisplay = 2
  if (window.innerWidth > 900) genreToDisplay = 8
  else if (window.innerWidth > 700) genreToDisplay = 6
  else if (window.innerWidth > 500) genreToDisplay = 4
  genresToDisplayCount.value = genreToDisplay
})

const addCommaDivider = (artistName: string, index: number): string => {
  return (index === props.artists.length - 1) ? artistName : `${artistName},`
}

const getGenreAnimationDelay = (index: number): { 'animation-delay': string } => {
  return { 'animation-delay': `${index * 400}ms` }
}

const openTrackOnSpotify = () => {
  window.location.href = props.trackURI
}

const openArtistOnSpotify = (artist: SpotifyArtist) => {
  window.location.href = artist.uri
}

const getColorForGenre = (genre: string): string => {
  return playlistsStore.genreColorMapping[genre]
}
</script>

<style>
@keyframes track-append {
  from {
    -webkit-transform: translate3d(0, -4px, 0);
    transform: translate3d(0, -4px, 0);
    opacity: 0;
  }

  to {
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    opacity: 1;
  }
}

@keyframes genres-appear {
  from {
    -webkit-transform: translate3d(-4px, 0, 0);
    transform: translate3d(-4px, 0, 0);
    opacity: 0
  }

  to {
    -webkit-transform: translateX(0);
    transform: translateX(0);
    opacity: 0.9
  }
}

.track-item {
  width: 100%;
  padding: 0 !important;
  opacity: 0;

  border-bottom: 1px grey solid;

  animation: track-append 200ms linear;
  animation-fill-mode: forwards;
}

.track-item .v-avatar {
  margin: 5px !important;
}

.track-item .artist-names {
  max-width: 100%;
  margin: 0px 5px 3px 0px;
  padding: 0 !important;

  color: var(--link-color);
  text-decoration: none;
}

.track-item .artist-name {
  padding: 0 !important;
  opacity: 0.8;
}

.track-item .artist-name:hover {
  text-decoration: underline;
}

.track-item .genre-chip {
  margin: 0 5px 2px 0px;

  color: black;

  opacity: 0;
  animation: genres-appear 2000ms linear;
  animation-fill-mode: forwards;
}

.track-item .popularity-chip {
  font-family: "Righteous", Helvetica, Sans-serif !important;
  opacity: 1 !important;
}

.track-item .text-h6 {
  width: fit-content;
  max-width: 100%;

  font-family: "Oswald", Helvetica, Sans-serif !important;
  cursor: pointer;
}

.track-item .track-index {
  margin: 5px;

  font-size: 20px;
}

.track-item .track-image {
  min-width: 80px;
  cursor: pointer;
}

.track-item .track-image .v-img {
  border-radius: 5px;
}

.track-item .v-list-item__content {
  margin-bottom: 5px;
}

.track-item .second-line {
  margin: 5px 0px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.track-item .chips {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

@media only screen and (min-width: 768px) {
  .track-item .track-index {
    margin: 0px 15px;
  }

  .track-item .v-list-item__content {
    margin-left: 15px;
  }
}
</style>
