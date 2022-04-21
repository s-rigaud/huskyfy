<template>
  <v-chip
    v-for="genre in genreLabels"
    :key="genre"
    :text="genre"
    label
    style="margin: 5px"
  >
  </v-chip>

  <v-btn>Split by genre</v-btn>
  <p>Indie like tracks {{ indieTracks }}</p>
  <v-btn>Split by genre</v-btn>
  <p>Languages xx language % xx</p>
  <v-btn>Split by languages</v-btn>

  <!--apexcharts-->

  <TrackCard
    v-for="track of tracks"
    :key="track.id"
    :id="track.id"
    :name="track.name"
    :image="track.image"
    :artists="track.artists.map((artist) => artist.name)"
    :genres="track.genres"
    :isIndie="track.isIndie"
  />
  <v-btn @click="requestPlaylistTracks" v-if="tracks.length < tracksTotal">
    Load more Tracks
  </v-btn>
</template>

<script>
import api from "@/api";
import TrackCard from "@/components/TrackCard.vue";

export default {
  name: "PlaylistDetail",
  props: {
    playlistId: String,
  },
  components: {
    TrackCard,
  },
  mounted() {
    this.requestPlaylistTracks();
  },
  methods: {
    async requestPlaylistTracks() {
      const response = await this.callCorrespondingAPIEndpoint();
      this.tracksTotal = response.data.total;
      this.requestOffset += this.requestLimit;
      console.log(response.data);

      const artistIds = [];
      const responseTracks = [];
      for (let res of response.data.items) {
        console.log(res.track.artists.map((a) => a.id));
        artistIds.push(...res.track.artists.map((a) => a.id));
        console.log(artistIds);
        const track = {
          id: res.track.id,
          name: res.track.name,
          image: res.track.album.images[0].url,
          artists: res.track.artists,
        };
        responseTracks.push(track);
      }

      let spotifyArtistInfos = await api.spotify.artists.getMultipleArtists(
        Array.from(new Set(artistIds))
      );
      console.log("artist infos", spotifyArtistInfos);

      const artistMap = new Map();
      for (let artist of spotifyArtistInfos) {
        artistMap.set(artist.id, [artist.genres, artist.followers.total]);
      }
      console.log(artistMap);

      for (let track of responseTracks) {
        const artists = track.artists;
        let allArtistIndie = true;
        for (let artist of artists) {
          const genres = artistMap.get(artist.id)[0];
          track.genres = genres;
          for (let genre of genres) {
            this.genres[genre] += 1;
          }

          const followerCount = artistMap.get(artist.id)[1];
          if (followerCount > 500_000) {
            allArtistIndie = false;
          }
        }
        track.isIndie = allArtistIndie;
        this.indieTracks += allArtistIndie;
      }
      this.tracks.push(...responseTracks);
    },
    async callCorrespondingAPIEndpoint() {
      if (this.playlistId == "liked-song") {
        return await api.spotify.playlists.getUserSavedTracks(
          this.requestLimit,
          this.requestOffset
        );
      } else {
        return await api.spotify.playlists.getPlaylistTracks(
          this.playlistId,
          this.requestLimit,
          this.requestOffset
        );
      }
    },
  },
  computed: {
    genreLabels() {
      const genreLabels = [];
      for (const label in this.genres) {
        genreLabels.push([label, this.genres[label]]);
      }
      genreLabels.sort(function (a, b) {
        return a[1] - b[1];
      });
      // .map((genre) => genre[0])
      return genreLabels.reverse().filter((genre) => genre[1] > 2);
    },
  },
  data() {
    return {
      tracks: [],
      // default dict with 0 as default value
      genres: new Proxy(
        {},
        {
          get: (target, name) => (name in target ? target[name] : 0),
        }
      ),
      indieTracks: 0,
      requestLimit: 50,
      requestOffset: 0,
      tracksTotal: 50,
    };
  },
};
</script>