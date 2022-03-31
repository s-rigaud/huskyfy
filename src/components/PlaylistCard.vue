<template>
  <router-link
    :to="{ name: 'Explore playlist', params: { playlistId: this.id } }"
  >
    <p>{{ this.id }} - {{ this.name }}</p>
    <img .src="this.image" alt="Playlist cover" />
  </router-link>
</template>

<script>
export default {
  name: "PlaylistCard",
  props: {
    id: String,
    name: String,
    image: String,
  },
  setup() {},
  data() {
    return { requestLimit: 5, requestOffset: 0, trackTotal: 5 };
  },
};
</script>
