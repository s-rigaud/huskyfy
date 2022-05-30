<template>
  <div id="about-content">
    <h1>Horus playlist manager</h1>
    <p>
      Horus is a small web project that aims to provide new functionalities when
      manipulating Spotify playlists. Right now, it is not possible to create
      sub-playlists on Spotify filtering by track genres or artists. Moreover,
      indie artists are not really promoted on the platform so Horus try to
      highlight their work.
    </p>

    <h2>Spotify connection and account access</h2>
    <p>
      This website is using well designed Spotify OAuth2 access account which
      allow the website to access your data safely. There is no data stored on
      the Horus platform or anywhere on the website so you are totally safe when
      browsing or exiting the website without signing out.
    </p>

    <h2>How it works</h2>
    <p>
      Horus is using the really open Spotify API to gather genres and data about
      artists, genre and tracks of your playlists. Once done, the app tries to
      provide a nice interface for you to filter and create new playlists from
      previous ones easily.
    </p>

    <h2>Creator</h2>
    <p>
      This website was created by
      <a href="https://github.com/s-rigaud" target="_blank">me</a>
      as a side project during my studies. I hope you will find it useful ! If
      you find any bug or you want new functionalities do not hesitate to report
      it
      <a
        href="mailto:horus-project-bugtracker@gmail.com?subject=Horus%20improvement%20request"
      >
        to me
      </a>
      😃
    </p>
  </div>

  <v-btn id="exit-button" @click="backToPreviousPage">X</v-btn>
</template>

<script>
export default {
  name: "AboutView",
  methods: {
    backToPreviousPage() {
      this.$router.go(-1);
    },
  },
};
</script>
<style scoped>
#about-content {
  margin: 0% 25%;
}
#exit-button {
  width: 50px;
  height: 66px;
  font-size: larger;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>