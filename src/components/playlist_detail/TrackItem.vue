<template>
  <v-list-item class="track-item" :style="trackAnimationDelay" link @click="openTrackOnSpotify">
    <template v-slot:prepend>
      <p class="track-index">{{ trackIndex + 1 }}</p>
      <v-avatar class="ma-3 track-image" size="90" rounded="0">
        <v-img rel="preconnect" v-bind:src="image" lazy-src='@/assets/default_cover.jpg' alt="Cover image"
          :option="{ rootMargin: '0px 100px 0px 0px' }"></v-img>
      </v-avatar>
    </template>

    <v-list-item-title class="rainbow-text text-h6"> {{ name }} </v-list-item-title>
    <div class="second-line">
      <div v-for="(artist, index) in artists" class="artist-names" :key="artist.id"
        @click.stop="openArtistOnSpotify(artist)">
        <v-list-item-subtitle class="artist-name text-truncate" v-ripple.stop>
          {{ addCommaDivider(artist.name, index) }}
        </v-list-item-subtitle>
      </div>
      <v-chip v-if="isIndie" :text="$tc('track.indie', artists.length)" color="green" label text-color="white"
        size="small" class="popularity-chip">
      </v-chip>
      <v-chip v-else :text="$tc('track.popular', artists.length)" color="cyan" label size="small"
        class="popularity-chip">
      </v-chip>
    </div>

    <div v-if="genres.length > 0" class="chips">
      <v-chip v-for="(genre, index) in genres.slice(0, MAXIMUM_GENRE_DISPLAYED)" :key="genre"
        :text="genre.toUpperCase()" label size="small" class="genre-chip" :style="getGenreAnimationDelay(index)"
        :color="getColorForGenre(genre)">
      </v-chip>
      <v-chip v-if="genres.length > MAXIMUM_GENRE_DISPLAYED && !displayAllGenres" label size="small" text="+"
        class="genre-chip" :style="getGenreAnimationDelay(MAXIMUM_GENRE_DISPLAYED)"
        @click.stop="displayAllGenres = true">
      </v-chip>
      <div v-if="displayAllGenres">
        <v-chip v-for="(genre, index) in genres.slice(MAXIMUM_GENRE_DISPLAYED)" :key="genre" :text="genre.toUpperCase()"
          label size="small" class="genre-chip" :style="getGenreAnimationDelay(index)" :color="getColorForGenre(genre)">
        </v-chip>
      </div>
    </div>
    <v-list-item-subtitle v-else style="min-height: 20px;">
      {{ $t("track.no-genre") }}
    </v-list-item-subtitle>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent, PropType, StyleValue } from 'vue'

import { SpotifyArtist } from '@/api/spotify/types/entities'
import { usePlaylistsStore } from '@/stores/playlists'

export default defineComponent({
  name: 'TrackItem',
  props: {
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
  },
  setup () {
    const playlistsStore = usePlaylistsStore()
    return { playlistsStore }
  },
  data () {
    return {
      displayAllGenres: false,
      MAXIMUM_GENRE_DISPLAYED: 2
    }
  },
  mounted () {
    let genreToDisplay = 2
    if (window.innerWidth > 900) genreToDisplay = 8
    else if (window.innerWidth > 700) genreToDisplay = 6
    else if (window.innerWidth > 500) genreToDisplay = 4
    this.MAXIMUM_GENRE_DISPLAYED = genreToDisplay
  },
  computed: {
    // Delay animation so items appear one after another
    trackAnimationDelay (): StyleValue {
      const limit = (window.innerWidth > 500) ? 20 : 10
      const delay = (this.trackIndex < limit) ? `${300 * this.trackIndex}ms` : '0ms'
      return { 'animation-delay': delay }
    }
  },
  methods: {
    addCommaDivider (artistName: string, index: number): string {
      return (index === this.artists.length - 1) ? artistName : `${artistName},`
    },
    getGenreAnimationDelay (index: number): StyleValue {
      return { 'animation-delay': `${index * 400}ms` }
    },
    openTrackOnSpotify () {
      window.location.href = this.trackURI
    },
    openArtistOnSpotify (artist: SpotifyArtist) {
      window.location.href = artist.uri
    },
    getColorForGenre (genre: string): string {
      return this.playlistsStore.genreColorMapping[genre]
    }
  }
})
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
    opacity: 1
  }
}

.track-item {
  width: 100%;
  padding: 0 !important;
  opacity: 0;

  border-bottom: 1px grey solid;
  border-radius: 5px;

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
  animation: genres-appear 2000ms linear;
  animation-fill-mode: forwards;
  opacity: 0;
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
