<template>
  <!-- General page with info about the app -->
  <div id="about-content">
    <div id="text">
      <div id="main-title">
        <v-img id="main-title-image" width="60" :src="huskyfyCircle" alt="Huskyfy Image"></v-img>
        <h1 class="rainbow-text">{{ $t("about.description.title") }}</h1>
      </div>
      <p style="margin-bottom: 0">
        {{ $t("about.description.content.part1") + ' ' + $t("about.description.content.part2") }}
      </p>
      <v-chip id="indie-chip" :text="$t('track.indie')" color="green" label text-color="white" size="small">
      </v-chip>

      <div class="subtitle">
        <h2 class="rainbow-text">{{ $t("about.connection.title") }}</h2>
        <h2>🔒</h2>
      </div>
      <v-divider></v-divider>
      <p>{{ $t("about.connection.content") }} </p>

      <div class="subtitle">
        <h2 class="rainbow-text">{{ $t("about.process.title") }}</h2>
      </div>
      <v-divider></v-divider>
      <p> {{ $t("about.process.content") }}</p>

      <div class="subtitle">
        <h2 class="rainbow-text">{{ $t("about.expose-liked-songs.title") }}</h2>
        <h2>{{ $t("_emojis.public") }}</h2>
      </div>
      <v-divider></v-divider>
      <p>
        {{ $t("about.expose-liked-songs.content.part1") }} {{ $t("_emojis.collaborative") }}
        <br />
        <a :href="myMusicLink">
          {{ $t("about.expose-liked-songs.content.part2") }}
          <v-img id="my-song-img" width="20" :src="myMusicImage" alt="My Music playlist"></v-img>
        </a>
      </p>

      <div class="subtitle">
        <h2 class="rainbow-text">{{ $t("about.creator.title") }}</h2>
        <h2>😃</h2>
      </div>
      <v-divider></v-divider>
      <p>
        {{ $t("about.creator.content.part1") }}
        <a href="https://github.com/s-rigaud" target="_blank" rel="noopener">
          {{ $t("about.creator.content.part2") }}
        </a>
        {{ $t("about.creator.content.part3") }}
        <a href="mailto:huskyfy.bugtracker@gmail.com?subject=Huskyfy%20improvement%20request">
          {{ $t("about.creator.content.part4") }} 📧
        </a>
      </p>

      <div class="subtitle">
        <h2 class="rainbow-text">{{ $t("about.copyright.title") }}</h2>
      </div>
      <v-divider></v-divider>
      <p>
        {{ $t("about.copyright.content") }}
        <a href="https://www.flaticon.com/fr/icones-gratuites/husky-siberien" title="husky sibérien icônes"
          target="_blank" rel="noopener">
          FlatIcon.com
        </a>
      </p>

      <div id="github-icon">
        <a href="https://github.com/s-rigaud" target="_blank" rel="noopener">
          <v-img width="70" :src="githubImg" alt="Github Image"></v-img>
        </a>
      </div>
    </div>
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
    huskyfyCircle(): string {
      return require('@/assets/large-logo-circle.png')
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
  margin: 20px;
  max-width: 700px;
  text-align: justify;
}

#main-title {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

#main-title-image {
  max-width: 60px !important;
  margin-right: 10px;
}

#exit-button {
  width: 50px;
  height: 66px;
  font-size: larger;
  border-radius: 50%;
  position: fixed;
  top: 70px;
  right: 10px;
  display: none;
}

#my-song-img {
  display: inline-block;
  top: 5px;
}

h1 {
  font-size: 25px;
}

h2 {
  font-size: large;
}

.subtitle {
  display: flex;
  flex-wrap: wrap;
}

p {
  margin-bottom: 30px;
}

a {
  text-decoration: none;
  color: var(--link-color) !important;
}

#indie-chip {
  margin-bottom: 20px;
}

#github-icon .v-img {
  margin: auto;
}

@media only screen and (min-width: 768px) {
  h1 {
    font-size: 40px;
  }

  h2 {
    font-size: 30px;
  }

  p {
    font-size: 15px;
  }
}
</style>
