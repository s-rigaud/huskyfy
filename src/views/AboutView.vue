<template>
  <div id="about-content">
    <div id="text">
      <div style="display: inline-flex">
        <v-img width="40" :src="horus" alt="Horus Image"></v-img>
        <h1 style="margin-right: 10px">{{ $t("about.title.description") }}</h1>
      </div>
      <p> {{ $t("about.content.description") }} </p>

      <h2>{{ $t("about.title.connection") }}</h2>
      <p>{{ $t("about.content.connection") }} </p>

      <h2>{{ $t("about.title.process") }}</h2>
      <p> {{ $t("about.content.process") }} </p>

      <h2>{{ $t("about.title.creator") }}</h2>
      <p>
        {{ $t("about.content.creator1") }}
        <a href="https://github.com/s-rigaud" target="_blank">{{ $t("me") }}</a>
        {{ $t("about.content.creator2") }}
        <a href="mailto:horusproject.bugtracker@gmail.com?subject=Horus%20improvement%20request">
          {{ $t("about.content.creator3") }}
        </a>
        😃
      </p>
    </div>
    <a href="https://github.com/s-rigaud" target="_blank">
      <v-img width="70" :src="githubImg" alt="Github Image"></v-img>
    </a>
  </div>

  <v-btn id="exit-button" @click="backToPreviousPage">X</v-btn>
</template>

<script>
export default {
  name: 'AboutView',
  computed: {
    githubImg () {
      return require('@/assets/github.png')
    },
    horus () {
      return require('@/assets/oeil-dhorus.png')
    }
  },
  methods: {
    backToPreviousPage () {
      this.$router.go(-1)
    }
  }
}
</script>
<style scoped>
#about-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#text {
  margin: auto;
  max-width: 700px;
  text-align: justify;
}

#exit-button {
  width: 50px;
  height: 66px;
  font-size: larger;
  border-radius: 50%;
  position: fixed;
  top: 70px;
  right: 10px;
}

h1 {
  font-size: xxx-large;
}
p {
  margin-bottom: 20px;
}
a{
  text-decoration: none;
  color: #F0932B
}

@media (max-width: 992px) {
  h1{
    font-size: xx-large;
  }
  h2 {
    font-size: large;
  }

  #exit-button {
    display: none;
  }
}
</style>
