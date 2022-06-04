<template>
  <v-card flat border rounded="0" @click="openTrackOnSpotify">
    <div class="track-card">
      <v-avatar class="ma-3" size="80" rounded="0">
        <v-img v-bind:src="image" :lazy-src="loadingCover"></v-img>
      </v-avatar>
      <div>
        <v-card-header>
          <v-card-header-text>
            <v-card-title class="text-h6"> {{ name }} </v-card-title>
            <v-card-subtitle style="display: inline-flex">
              <a
                v-for="artist in artists"
                class="artist-name"
                :key="artist"
                v-text="addComma(artist.name)"
                :href="artist.uri"
              ></a>
            </v-card-subtitle>

            <v-chip
              v-if="isIndie"
              :text="$t('track.indie')"
              color="green"
              label
              text-color="white"
              size="small"
              class="popularity-chip"
            >
            </v-chip>
            <v-chip
              v-else
              :text="$t('track.popular')"
              color="cyan"
              label
              size="small"
              class="popularity-chip"
            >
            </v-chip>
          </v-card-header-text>
        </v-card-header>
        <div v-if="genres.length > 0">
          <v-card-text>
            <v-chip
              v-for="genre in genres.slice(0, 3)"
              :key="genre"
              :text="genre.toUpperCase()"
              label
              size="small"
              class="genre-chip"
            >
            </v-chip>
            <v-chip
              v-if="genres.length > 3"
              :text="`+${genres.length - 3}`"
              label
              size="small"
              class="genre-chip"
            >
            </v-chip>
          </v-card-text>
        </div>
        <v-card-subtitle v-else>No genre provided</v-card-subtitle>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'TrackCard',
  props: {
    id: String,
    name: String,
    image: String,
    artists: Array,
    genres: Object,
    isIndie: Boolean,
    trackURI: String
  },
  computed: {
    addComma () {
      return (artistName) => {
        if (this.artists[this.artists.length - 1].name === artistName) {
          return artistName
        }
        return `${artistName},`
      }
    },
    loadingCover () {
      return require('@/assets/default_cover.jpg')
    }
  },
  data () {
    return {
      isActive: true
    }
  },
  methods: {
    openTrackOnSpotify () {
      window.location.href = this.trackURI
    }
  }
}
</script>
<style scoped>
.track-card {
  display: flex !important;
  align-items: center;
}
.v-card {
  width: 100%;
  background-color: #ecf0f1;
}
.v-card:hover {
  background-color: white !important;
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
  text-decoration: none;
  color: black;
}
.genre-chip {
  margin: 0 5px 2px 0px;
}
.popularity-chip {
  font-family: "Righteous" !important;
  opacity: 1 !important;
}
.text-h6 {
  font-family: "Oswald" !important;
}
</style>
