<template>
  <v-col cols="12">
    <v-card color="#1F7087" theme="dark">
      <div class="d-flex flex-no-wrap justify-space-between">
        <div>
          <v-card-title class="text-h5"> {{ name }} </v-card-title>
          <v-card-subtitle>{{ id }}</v-card-subtitle>
          <p>{{ artists }}</p>
          <p>{{ genre }}</p>
          <p>{{ isIndie }}</p>
        </div>

        <v-avatar class="ma-3" size="125" rounded="0">
          <v-img v-bind:src="image"></v-img>
        </v-avatar>
      </div>
    </v-card>
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
    genre: String,
    isIndie: Boolean,
  },
};
</script>
