<template>
  <apexchart
    width="500"
    type="bar"
    :options="options"
    :series="series"
  ></apexchart>

  <PlaylistCard
    key="liked-song"
    id="liked-song"
    name="Liked song"
    image="https://community.spotify.com/t5/image/serverpage/image-id/104727iC92B541DB372FBC7?v=v2"
  />

  <PlaylistCard
    v-for="playlist in playlists"
    :key="playlist.id"
    :id="playlist.id"
    :name="playlist.name"
    :image="playlist.image"
  />
  <v-btn @click="requestPlaylists" v-if="playlists.length < playlistTotal">
    Load more playlists
  </v-btn>
</template>

<script>
import api from "@/api";
import PlaylistCard from "@/components/PlaylistCard.vue";

export default {
  name: "PlaylistList",
  components: { PlaylistCard },
  setup() {},
  mounted() {
    this.requestPlaylists();
  },
  methods: {
    async requestPlaylists() {
      const response = await api.spotify.playlists.getUserPlaylists(
        this.requestLimit,
        this.requestOffset
      );
      console.log(response.data);
      this.playlistTotal = response.data.total;

      for (let playlistObject of response.data.items) {
        this.playlists.push({
          id: playlistObject.id,
          name: playlistObject.name,
          image: playlistObject.images[0].url,
        });
      }
      this.requestOffset += this.requestLimit;
    },
  },
  data() {
    return {
      playlists: [],
      requestLimit: 50,
      requestOffset: 0,
      playlistTotal: 50,
      options: {
        chart: {
          id: "vuechart-example",
        },
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
        },
      },
      series: [
        {
          name: "series-1",
          data: [30, 40, 45, 50, 49, 60, 70, 91],
        },
      ],
    };
  },
};
</script>