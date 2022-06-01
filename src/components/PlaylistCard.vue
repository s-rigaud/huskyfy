<template>
  <v-card flat @click="displayDetails" class="playlist-card">
    <v-img
      v-bind:src="images[0].url"
      :lazy-src="loadingCover"
      height="400px"
      cover
    ></v-img>

    <v-card-title class="text-truncate"> {{ name }} </v-card-title>
    <v-card-subtitle style="padding: 0">
      <p>{{ $t("playlist.created-by") }} {{ owner }}</p>
    </v-card-subtitle>
    <v-card-subtitle style="padding: 0">
      <p v-if="this.collaborative">{{ $t("playlist.collaborative") }}</p>
      <p v-else-if="this.public">{{ $t("playlist.public") }}</p>
      <p v-else-if="!this.public && owner === 'me'">
        {{ $t("playlist.private") }}
      </p>
    </v-card-subtitle>
  </v-card>
</template>

<script>
export default {
  name: 'PlaylistCard',
  props: {
    id: String,
    name: String,
    images: Array,
    owner: String,
    public: Boolean,
    collaborative: Boolean
  },
  computed: {
    loadingCover () {
      return require('@/assets/default_cover.jpg')
    }
  },
  methods: {
    displayDetails () {
      this.$router.push({
        name: 'Explore playlist',
        params: { playlistId: this.id }
      })
    }
  }
}
</script>
<style>
/*

/!\ Not scoped css as v-card__overlay is only define internally in Vuetify

*/
.playlist-card {
  width: 250px;
  height: 250px;
  background-color: initial;
  margin: 0px 3px 85px 3px;
  background-color: initial;
}
.playlist-card .v-img .v-img__img--cover {
  transition: filter 0.2s ease-in-out;
  filter: brightness(1);
}
.playlist-card:hover .v-img__img--cover {
  filter: brightness(1.2);
}
.playlist-card .v-card__overlay {
  height: 322px;
}
.playlist-card .v-card-title {
  padding: 0;
  letter-spacing: 0;
  white-space: nowrap;
}
.playlist-card:hover .v-card__overlay {
  opacity: 0.2;
}
</style>
