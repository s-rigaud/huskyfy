<template>
  <v-card
    flat
    @click="displayDetails"
    style="
      width: 23%;
      min-height: 23%;
      margin-bottom: 10px;
      background-color: initial;
    "
  >
    <v-img v-bind:src="image" height="400px" cover></v-img>

    <v-card-title style="padding: 0"> {{ name }} </v-card-title>
    <v-card-subtitle style="padding: 0">
      <p v-if="this.public">📣</p>
      <p v-if="this.collaborative">🤝</p>
      <p>Created by {{ owner }}</p>
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
    owner: String,
    public: Boolean,
    collaborative: Boolean,
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
