<template>
  <v-card
    @click="displayDetails"
    style="width: 23%; min-height: 23%; margin-bottom: 10px"
    color="#f0932b"
  >
    <v-parallax
      v-bind:src="image"
      height="400px"
      cover
      scale="1.1"
    ></v-parallax>

    <v-card-title> {{ name }} </v-card-title>
    <v-card-subtitle style="margin-bottom: inherit">
      {{ description }}
    </v-card-subtitle>
  </v-card>
</template>

<script>
export default {
  name: "PlaylistCard",
  props: {
    id: String,
    name: String,
    image: String,
    description: String,
    public: Boolean,
  },
  methods: {
    displayDetails() {
      this.$router.push({
        name: "Explore playlist",
        params: { playlistId: this.id },
      });
    },
  },
};
</script>
