<template>
  <!-- Card to represent a track, many of them are stacks -->
  <v-list-item @click="openTrackOnSpotify" class="track-card" :style="trackAnimationDelay">
    <template v-slot:prepend>
      <p class="track-index">{{ trackIndex + 1 }}</p>
      <v-avatar class="ma-3 track-image" size="90" rounded="0">
        <v-img rel="preconnect" v-bind:src="image" :lazy-src="loadingCover" alt="Cover image"></v-img>
      </v-avatar>
    </template>

    <v-list-item-title class="rainbow-text text-h6"> {{ name }} </v-list-item-title>
    <div class="second-line">
      <a v-for="artist in artists" class="artist-names" :key="artist.id" :href="artist.uri">
        <v-card-subtitle class="artist-name">
          {{ addComma(artist.name) }}
        </v-card-subtitle>
      </a>
      <v-chip v-if="isIndie" :text="$t('track.indie')" color="green" label text-color="white" size="small"
        class="popularity-chip">
      </v-chip>
      <v-chip v-else :text="$t('track.popular')" color="cyan" label size="small" class="popularity-chip">
      </v-chip>
    </div>

    <!-- All track info -->
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
      <v-chip v-for="(genre, index) in genres.slice(0,3)" :key="genre" :text="genre.toUpperCase()" label size="small"
        class="genre-chip" :style="genreAnimationDelay(index)">
      </v-chip>
      <v-chip v-if="genres.length > 3 && !displayAllGenres" label size="small" text="..." class="genre-chip"
        :style="genreAnimationDelay(3)" @click.stop="displayAllGenres = true">
      </v-chip>
      <v-chip v-if="displayAllGenres" v-for="(genre, index) in genres.slice(3)" :key="genre" :text="genre.toUpperCase()"
        label size="small" class="genre-chip" :style="genreAnimationDelay(index)">
      </v-chip>
    </v-card-text>
    <v-card-subtitle v-else> {{ $t("track.no-genre") }}</v-card-subtitle>
  </v-list-item>
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
  data() {
    return {
      displayAllGenres: false
    }
  },
  computed: {
    addComma() {
      return (artistName: string): string => {
        if (this.artists[this.artists.length - 1].name === artistName) {
          return artistName
        }
        return `${artistName},`
      }
    },
    loadingCover(): string {
      return require('@/assets/default_cover.jpg')
    },
    // Delay animation so cards appear one after another
    trackAnimationDelay(): StyleValue {
      const delay = (this.trackIndex < 30) ? `${300 * this.trackIndex}ms` : '0ms'
      return { 'animation-delay': delay }
    },
    genreAnimationDelay() {
      return (index: number): StyleValue => {
        return { 'animation-delay': `${index * 400}ms` }
      }
    }
  },
  methods: {
    openTrackOnSpotify() {
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
  opacity: 0;
  border-bottom: 1px grey solid;
  padding: 0 !important;
}

.track-card:first-child {
  border-top: 1px grey solid;
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

.v-card-text {
  padding: 0;
}

.v-img {
  border-radius: 10%;
}

.v-avatar {
  margin: 5px !important;
}

.artist-names {
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

.track-index {
  margin: 5px
}

.track-image {
  min-width: 80px
}

.second-line {
  display: flex;
}

.artist-name {
  display: inline-flex;
  padding: 0 !important
}
</style>
