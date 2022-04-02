<template>
  <v-card class="mx-auto" max-width="344" @click="displayDetails">
    <v-img .src="image" height="200px" cover></v-img>

    <v-card-title> {{ id }} </v-card-title>

    <v-card-subtitle> {{ name }} </v-card-subtitle>

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
