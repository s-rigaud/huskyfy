<template>
  <v-col cols="12">
    <v-hover>
      <v-card color="#1F7087" theme="dark">
        <div class="d-flex flex-no-wrap justify-space-between">
          <div>
            <v-card-title class="text-h5"> {{ name }} </v-card-title>
            <v-card-subtitle>{{ id }}</v-card-subtitle>
            <p>From {{ artists }}</p>
            <v-chip
              v-for="genre in genres"
              :key="genre"
              :text="genre"
              label
              style="margin: 5px"
            >
            </v-chip>
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
          </div>
          <v-avatar class="ma-3" size="125" rounded="0">
            <v-img v-bind:src="image"></v-img>
          </v-avatar>
        </div>
      </v-card>
    </v-hover>
  </v-col>
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
