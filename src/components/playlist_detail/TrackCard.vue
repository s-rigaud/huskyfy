<template>
  <!-- Card to represent a track, many of them are stacks -->
  <v-card flat border rounded="0" @click="openTrackOnSpotify" class="track-card" :style="trackAnimationDelay">
    <div class="card-content">
      <p style="margin: 5px">{{ trackIndex + 1 }}</p>
      <!-- Cover -->
      <v-avatar class="ma-3" size="80" rounded="0" style="min-width: 80px">
        <v-img rel="preconnect" v-bind:src="image" :lazy-src="loadingCover" alt="Cover image"></v-img>
      </v-avatar>

      <div>
        <v-card-header>
          <v-card-header-text>
            <!-- All track info -->
            <v-card-title class="rainbow-text text-h6"> {{ name }} </v-card-title>
            <a v-for="artist in artists" class="artist-name" :key="artist.id" :href="artist.uri">
              <v-card-subtitle style="display: inline-flex">{{ addComma(artist.name) }}</v-card-subtitle>
            </a>
            <v-chip v-if="isIndie" :text="$t('track.indie')" color="green" label text-color="white" size="small"
              class="popularity-chip">
            </v-chip>
            <v-chip v-else :text="$t('track.popular')" color="cyan" label size="small" class="popularity-chip">
            </v-chip>
          </v-card-header-text>
        </v-card-header>

        <!-- TODO -->
        <!-- Genre chips (Should be VSlideGroup but not yet implemented in Vuetify Beta 3.0.X)
          <v-slide-group show-arrows>
            <v-slide-group-item v-for="(genre, index) in genres" :key="genre">
              <v-chip :text="genre.toUpperCase()" label size="small" class="genre-chip"
                :style="genreAnimationDelay(index)">
              </v-chip>
            </v-slide-group-item>
          </v-slide-group>-->

        <v-card-text v-if="genres.length > 0">
          <v-chip v-for="(genre, index) in genres" :key="genre" :text="genre.toUpperCase()" label size="small"
            class="genre-chip" :style="genreAnimationDelay(index)">
          </v-chip>
        </v-card-text>
        <v-card-subtitle v-else> {{ $t("track.no-genre") }}</v-card-subtitle>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { SpotifyArtist } from '@/api/spotify/types/entities'
import { defineComponent, PropType, StyleValue } from 'vue'

export default defineComponent({
  name: 'TrackCard',
  props: {
    id: String,
    name: String,
    image: String,
    artists: {
      type: Array as PropType<SpotifyArtist[]>,
      required: true
    },
    genres: {
      type: Array as PropType<string[]>,
      required: true
    },
    isIndie: Boolean,
    trackURI: {
      type: String,
      required: true
    },
    trackIndex: {
      type: Number,
      required: true
    }
  },
  computed: {
    addComma () {
      return (artistName: string): string => {
        if (this.artists[this.artists.length - 1].name === artistName) {
          return artistName
        }
        return `${artistName},`
      }
    },
    loadingCover (): string {
      return require('@/assets/default_cover.jpg')
    },
    // Delay animation so cards appear one after another
    trackAnimationDelay (): StyleValue {
      const duration = (this.trackIndex < 50) ? `${300 * this.trackIndex}ms` : '0ms'
      return { 'animation-delay': duration }
    },
    genreAnimationDelay () {
      return (index: number): StyleValue => {
        return { 'animation-delay': `${index * 500}ms` }
      }
    }
  },
  methods: {
    openTrackOnSpotify () {
      window.location.href = this.trackURI
    }
  }
})
</script>
<style scoped>
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
    opacity: 1
  }
}

.track-card {
  animation: track-append 200ms linear;
  animation-fill-mode: forwards;
  opacity: 0
}

.card-content {
  display: flex !important;
  align-items: center;
}

.v-card {
  width: 100%;
  color: var(--text-color);
  background-color: var(--primary-color);
}

.v-card:hover {
  color: var(--link-color);
}

.v-card-header {
  padding: 0;
}

.v-card-text {
  padding: 0;
}

.v-img {
  border-radius: 10%;
}

.v-avatar {
  margin: 5px !important;
}

.artist-name {
  margin-right: 5px;
  padding-bottom: 7px;
  text-decoration: none;
  color: var(--link-color);
}

.genre-chip {
  margin: 0 5px 2px 0px;
  animation: genres-appear 2000ms linear;
  animation-fill-mode: forwards;
  opacity: 0
}

.popularity-chip {
  font-family: "Righteous" !important;
  opacity: 1 !important;
  margin-bottom: 5px;
}

.text-h6 {
  font-family: "Oswald" !important;
}
</style>
