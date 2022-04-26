<template>
  <v-card color="#1F7087" flat border rounded="0" style="width: 25%">
    <div
      style="display: flex !important; flex-wrap: wrap; flex-direction: column"
    >
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
                text="🌴 Indie"
                color="green"
                label
                text-color="white"
                style="margin: 5px"
              >
              </v-chip>
              <v-chip
                v-else
                text="🔥 Popular"
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
            v-for="genre in genres"
            :key="genre"
            :text="genre.toUpperCase()"
            label
            style="margin: 5px"
          >
          </v-chip>
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
