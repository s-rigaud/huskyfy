<template>
  <!-- General page with info about the app -->
  <div id="about-content">
    <div id="text">
      <div style="display: inline-flex">
        <v-img width="40" :src="horus" alt="Horus Image"></v-img>
        <h1 class="rainbow-text">{{ $t("about.description.title") }}</h1>
      </div>
      <p> {{ $t("about.description.content.part1") }} </p>
      <p> {{ $t("about.description.content.part2") }}{{ $t("_emojis.indie") }} </p>

      <h2 class="subtitle rainbow-text">{{ $t("about.connection.title") }}</h2>
      <h2>🔒</h2>
      <p>{{ $t("about.connection.content") }} </p>

      <h2 class="subtitle rainbow-text">{{ $t("about.process.title") }}</h2>
      <p> {{ $t("about.process.content") }}</p>

      <h2 class="subtitle rainbow-text">{{ $t("about.expose-liked-songs.title") }}</h2>
      <h2>{{ $t("_emojis.public") }}</h2>
      <p>
        {{ $t("about.expose-liked-songs.content.part1") }} {{ $t("_emojis.collaborative") }}
        <br />
        <a :href="myMusicLink">
          {{ $t("about.expose-liked-songs.content.part2") }}
          <v-img id="my-song-img" width="20" :src="myMusicImage" alt="My Music playlist"></v-img>
        </a>
      </p>

      <h2 class="subtitle rainbow-text">{{ $t("about.creator.title") }}</h2>
      <h2>😃</h2>

      <p>
        {{ $t("about.creator.content.part1") }}
        <a href="https://github.com/s-rigaud" target="_blank" rel="noopener">
          {{ $t("about.creator.content.part2") }}
        </a>
        {{ $t("about.creator.content.part3") }}
        <a href="mailto:horusproject.bugtracker@gmail.com?subject=Horus%20improvement%20request">
          {{ $t("about.creator.content.part4") }} 📧
        </a>
      </p>
    </div>

    <a href="https://github.com/s-rigaud" target="_blank" rel="noopener">
      <v-img width="70" :src="githubImg" alt="Github Image"></v-img>
    </a>
  </div>

  <v-btn id="exit-button" @click="backToPreviousPage" class="rainbow-v-btn">
    <v-icon>mdi-home</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AboutView',
  computed: {
    githubImg(): string {
      return require('@/assets/github.png')
    },
    horus(): string {
      return require('@/assets/oeil-dhorus.png')
    },
    myMusicImage(): string {
      return require('@/assets/my-music.jpeg')
    },
    myMusicLink(): string {
      return process.env.VUE_APP_BASE_SERVER_URL + '/playlist/my-music'
    }
  },
  methods: {
    backToPreviousPage() {
      this.$router.go(-1)
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

#my-song-img {
  display: inline-block;
  top: 5px;
}

h1 {
  font-size: xxx-large;
  background: -webkit-linear-gradient(var(--text-color), var(--link-color));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 10px
}

h2 {
  display: inline-block;
}

.subtitle {
  background: -webkit-linear-gradient(var(--text-color), var(--link-color));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  margin-bottom: 20px;
}

a {
  text-decoration: none;
  color: var(--link-color) !important;
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
