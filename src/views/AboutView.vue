<template>
  <!-- General page with info about the app -->
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
        <a href="https://github.com/s-rigaud" target="_blank">{{ $t("about.content.creator2") }}</a>
        {{ $t("about .content.creator3") }}
        <a href="mailto:horusproject.bugtracker@gmail.com?subject=Horus%20improvement%20request">
          {{ $t("about.content.creator4") }} 📧
        </a>
      </p>
    </div>
    <a href="https://github.com/s-rigaud" target="_blank">
      <v-img width="70" :src="githubImg" alt="Github Image"></v-img>
    </a>
  </div>
  <!-- @click="getAppStats" -->
  <button>Add app stats later</button>

  <v-btn id="exit-button" @click="backToPreviousPage">X</v-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import api from '@/api'
import TitleMixin from '@/mixins/TitleMixin'

export default defineComponent({
  name: 'AboutView',
  mixins: [TitleMixin],
  created () {
    this.title = 'Horus | About'
  },
  computed: {
    githubImg (): string {
      return require('@/assets/github.png')
    },
    horus (): string {
      return require('@/assets/oeil-dhorus.png')
    }
  },
  methods: {
    backToPreviousPage () {
      this.$router.go(-1)
    },
    async getAppStats () {
      await api.spotify.stats.getAppStats()
    }
  }
})
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

h1,
h2 {
  color: var(--primary-color) !important;
}

p {
  margin-bottom: 20px;
}

a {
  text-decoration: none;
  color: var(--primary-color) !important;
}

@media (max-width: 992px) {
  h1 {
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
