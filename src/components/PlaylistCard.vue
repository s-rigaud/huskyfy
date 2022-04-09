<template>
  <v-card @click="displayDetails" style="min-width: 23%; min-height: 23%">
    <v-parallax
      v-bind:src="image"
      height="400px"
      cover
      scale="1.1"
    ></v-parallax>

    <v-card-title> {{ name }} </v-card-title>

    <v-card-subtitle> {{ id }} </v-card-subtitle>

    <v-card-actions> </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "PlaylistCard",
  props: {
    id: String,
    name: String,
    image: String,
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
