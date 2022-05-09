<template>
  <v-card flat @click="displayDetails" class="playlist-card">
    <v-img v-bind:src="image" height="400px" cover></v-img>

    <v-card-title style="padding: 0"> {{ name }} </v-card-title>
    <v-card-subtitle style="padding: 0">
      <p>{{ $t("playlist.created-by") }} {{ owner }}</p>
      <p v-if="this.collaborative">⠀•⠀{{ $t("playlist.collaborative") }}</p>
      <p v-else-if="this.public">⠀•⠀{{ $t("playlist.public") }}</p>
      <p v-else-if="!this.public && owner === 'me'">
        ⠀•⠀{{ $t("playlist.private") }}
      </p>
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
<style scoped>
.playlist-card {
  width: 23%;
  min-height: 23%;
  margin-bottom: 10px;
  background-color: initial;
}
</style>