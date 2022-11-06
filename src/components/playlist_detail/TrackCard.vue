<template>
  <!-- Card to represent a track, many of them are stacks -->
  <v-list-item class="track-card" :style="trackAnimationDelay">
    <template v-slot:prepend>
      <p class="track-index">{{ trackIndex + 1 }}</p>
      <v-avatar class="ma-3 track-image" size="90" rounded="0" @click="openTrackOnSpotify">
        <v-img rel="preconnect" v-bind:src="image" lazy-src='@/assets/default_cover.jpg' alt="Cover image"></v-img>
      </v-avatar>
    </template>

    <v-list-item-title class="rainbow-text text-h6" @click="openTrackOnSpotify"> {{ name }} </v-list-item-title>
    <div class="second-line">
      <a v-for="artist in artists" class="artist-names" :key="artist.id" :href="artist.uri">
        <v-card-subtitle class="artist-name text-truncate">
          {{ addComma(artist.name) }}
        </v-card-subtitle>
      </a>
      <v-chip v-if="isIndie" :text="$tc('track.indie', artists.length)" color="green" label text-color="white"
        size="small" class="popularity-chip">
      </v-chip>
      <v-chip v-else :text="$tc('track.popular', artists.length)" color="cyan" label size="small"
        class="popularity-chip">
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
      <v-chip v-for="(genre, index) in genres.slice(0, MAXIMUM_GENRE_DISPLAYED)" :key="genre"
        :text="genre.toUpperCase()" label size="small" class="genre-chip" :style="genreAnimationDelay(index)">
      </v-chip>
      <v-chip v-if="genres.length > MAXIMUM_GENRE_DISPLAYED && !displayAllGenres" label size="small" text="+"
        class="genre-chip" :style="genreAnimationDelay(MAXIMUM_GENRE_DISPLAYED)" @click.stop="displayAllGenres = true">
      </v-chip>
      <div v-if="displayAllGenres">
        <v-chip v-for="(genre, index) in genres.slice(MAXIMUM_GENRE_DISPLAYED)" :key="genre" :text="genre.toUpperCase()"
          label size="small" class="genre-chip" :style="genreAnimationDelay(index)">
        </v-chip>
      </div>
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
  data () {
    return {
      displayAllGenres: false,
      MAXIMUM_GENRE_DISPLAYED: 2
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
    // Delay animation so cards appear one after another
    trackAnimationDelay (): StyleValue {
      const limit = (window.innerWidth > 500) ? 20 : 10
      const delay = (this.trackIndex < limit) ? `${300 * this.trackIndex}ms` : '0ms'
      return { 'animation-delay': delay }
    },
    genreAnimationDelay () {
      return (index: number): StyleValue => {
        return { 'animation-delay': `${index * 400}ms` }
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
  opacity: 0;
  border-bottom: 1px grey solid;
  padding: 0 !important;
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
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.v-img {
  border-radius: 10%;
}

.v-avatar {
  margin: 5px !important;
}

.artist-names {
  margin-right: 5px;
  text-decoration: none;
  color: var(--link-color);
  max-width: 100%;
  padding: 0 !important;
}

.artist-name {
  padding: 0 !important;
}

.artist-name:hover {
  text-decoration: underline;
}

.genre-chip {
  margin: 0 5px 2px 0px;
  animation: genres-appear 2000ms linear;
  animation-fill-mode: forwards;
  opacity: 0;
}

.popularity-chip {
  font-family: "Righteous", Helvetica, Sans-serif !important;
  opacity: 1 !important;
  margin-bottom: 5px;
}

.text-h6 {
  width: fit-content;
  max-width: 100%;

  font-family: "Oswald", Helvetica, Sans-serif !important;
  cursor: pointer;
  text-decoration: underline;
}

.track-index {
  margin: 5px;
}

.track-image {
  min-width: 80px;
  cursor: pointer;
}

.second-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
