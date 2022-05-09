<template>
  <v-card flat border rounded="0">
    <div class="track-card">
      <v-avatar class="ma-3" size="125" rounded="0">
        <v-img v-bind:src="image"></v-img>
      </v-avatar>
      <div>
        <v-card-header>
          <v-card-header-text>
            <v-card-title class="text-h5"> {{ name }} </v-card-title>
            <v-card-subtitle style="opacity: 1">
              {{ artists.join(", ") }}
              <v-chip
                v-if="isIndie"
                :text="$t('track.indie')"
                color="green"
                label
                text-color="white"
                style="margin: 5px"
              >
              </v-chip>
              <v-chip
                v-else
                :text="$t('track.popular')"
                color="cyan"
                label
                text-color="white"
                style="margin: 5px"
              >
              </v-chip>
            </v-card-subtitle>
          </v-card-header-text>
        </v-card-header>
        <v-card-text>
          <v-chip
            v-for="genre in genres.slice(0, 3)"
            :key="genre"
            :text="genre.toUpperCase()"
            label
            style="margin: 5px"
          >
          </v-chip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on">
                Button
              </v-btn>
            </template>
            <span>Tooltip</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-if="genres.length > 3"
                :text="`+${genres.length - 3}`"
                label
                style="margin: 5px"
                v-bind="attrs"
                v-on="on"
              >
              </v-chip>
            </template>
            <span>Tooltip</span>
          </v-tooltip>
        </v-card-text>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "TrackCard",
  props: {
    id: String,
    name: String,
    image: String,
    artists: Array,
    genres: Object,
    isIndie: Boolean,
  },
};
</script>
<style scoped>
.track-card {
  display: flex !important;
}
</style>