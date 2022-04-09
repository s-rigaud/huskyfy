<template>
  <p>Genres {{ genres }}</p>
  <v-btn>Split by genre</v-btn>
  <p>Indie like tracks {{ indieTracks }}</p>
  <v-btn>Split by genre</v-btn>
  <p>Languages xx language % xx</p>
  <v-btn>Split by languages</v-btn>
  <TrackCard
    v-for="track of tracks"
    :key="track.id"
    :id="track.id"
    :name="track.name"
    :image="track.image"
    :artists="track.artists"
    :genre="track.genre"
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
      console.log(response.data);
      for (let res of response.data.items) {
        const track = {
          id: res.track.id,
          name: res.track.name,
          image: res.track.album.images[0].url,
          artists: res.track.artists.map((artist) => artist.name),
          isindie: res.track.popularity < 30 ? true : false,
        };
        const genre =
          await api.the_audio_db.genre.getGenreForArtistAndTrackName(
            track.artists[0],
            track.name
          );
        track.genre = genre;
        this.genres[genre] += 1;
        this.indieTracks += track.isindie;
        this.tracks.push(track);
      }
      this.requestOffset += this.requestLimit;
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