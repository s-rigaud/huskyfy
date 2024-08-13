<template>
  <div id="about-content">
    <div id="text">
      <div id="main-title">
        <v-img
          id="main-title-image"
          alt="Huskyfy Image"
          src="@/assets/large-logo-circle.png"
          width="60"
        />
        <h1 class="rainbow-text">
          {{ $t("about.description.title") }}
        </h1>
      </div>
      <p style="margin-bottom: 5px">
        {{ $t("about.description.content.part1") }}
        <span
          style="color: var(--huskyfy-yellow-color); cursor: pointer;"
          @mouseover="drawConfettis"
        >
          Huskyfy !
        </span>
        {{ $t("about.description.content.part2") }}
      </p>
      <v-chip
        id="indie-chip"
        :text="$t('track.indie')"
        color="green"
        label
        size="large"
        text-color="white"
        @click="drawStars"
      />

      <div class="subtitle">
        <h2 class="rainbow-text">
          {{ $t("about.connection.title") }}
        </h2>
        <h2>🔒</h2>
      </div>
      <v-divider />
      <p>{{ $t("about.connection.content") }} </p>

      <div class="subtitle">
        <h2 class="rainbow-text">
          {{ $t("about.process.title") }}
        </h2>
        <h2>💻</h2>
      </div>
      <v-divider />
      <p> {{ $t("about.process.content") }}</p>

      <div class="subtitle">
        <h2 class="rainbow-text">
          {{ $t("about.expose-liked-songs.title") }}
        </h2>
        <h2>{{ $t("_emojis.public") }}</h2>
      </div>
      <v-divider />
      <p>
        {{ $t("about.expose-liked-songs.content.part1") }} {{ $t("_emojis.collaborative") }}
        <br>
        <span
          id="open-my-music"
          @click="openMyMusicOnSpotify"
        >
          {{ $t("about.expose-liked-songs.content.part2") }}
          <v-img
            id="my-song-img"
            alt="My Music playlist"
            src="@/assets/my-music.jpeg"
            width="20"
          />
        </span>
      </p>

      <div class="subtitle">
        <h2 class="rainbow-text">
          {{ $t("about.creator.title") }}
        </h2>
        <h2>😃</h2>
      </div>
      <v-divider />
      <p>
        {{ $t("about.creator.content.part1") }}
        <a
          href="https://github.com/s-rigaud"
          rel="noopener"
          target="_blank"
        >
          {{ $t("about.creator.content.part2") }}
        </a>
        {{ $t("about.creator.content.part3") }}
        <a href="mailto:huskyfy.bugtracker@gmail.com?subject=Huskyfy%20improvement%20request">
          {{ $t("about.creator.content.part4") }} 📧
        </a>
      </p>

      <div class="subtitle">
        <h2 class="rainbow-text">
          {{ $t("about.copyright.title") }}
        </h2>
        <h2
          class="rainbow-text"
          style="margin-left: 5px"
        >
          ©️
        </h2>
      </div>
      <v-divider />
      <p>
        {{ $t("about.copyright.content") }}
        <a
          href="https://www.flaticon.com/fr/icones-gratuites/husky-siberien"
          rel="noopener"
          target="_blank"
          title="husky sibérien icônes"
        >
          FlatIcon.com
        </a>.
      </p>

      <div id="github-icon">
        <div>
          <a
            href="https://github.com/s-rigaud/huskyfy"
            rel="noopener"
            style="color: var(--huskyfy-orange) !important;"
            target="_blank"
          >
            <v-img
              alt="Huskyfy Image"
              src="@/assets/large-logo-circle.png"
              width="70"
            />
            <p style="color: var(--huskyfy-orange); margin: 0px 15px;">Huskyfy version {{ version }}</p>
          </a>
        </div>
        <div>
          <a
            href="https://github.com/s-rigaud"
            rel="noopener"
            style="color: white !important;"
            target="_blank"
          >
            <v-img
              alt="Github Image"
              src="@/assets/github.png"
              width="70"
            />
            <p style="color: white; margin: 0px 15px; white-space: nowrap;">@s-rigaud</p>
          </a>
        </div>
        <div>
          <a
            href="https://twitter.com/HuskyfyWebsite/with_replies"
            rel="noopener"
            style="color: #55ADEE !important;"
            target="_blank"
          >
            <v-img
              alt="Twitter Image"
              src="@/assets/twitter.png"
              width="70"
            />
            <p style="color: #55ADEE; margin: 0px 15px;">@Huskyfy Website</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import confetti from 'canvas-confetti'
import { useMeta } from 'vue-meta'

import packageInfo from '@/../package.json'
import { t } from '@/i18n'

const version = packageInfo.version
const BASE_SERVER_URL = import.meta.env.VITE_APP_BASE_SERVER_URL

useMeta({
  title: t('page-title.about'),
  link: [
    { rel: 'canonical', href: `${BASE_SERVER_URL}/about` }
  ]
})

const openMyMusicOnSpotify = () => {
  window.location.href = `${BASE_SERVER_URL}/playlist/my-music`
}

/**
 * Draw some stars on the screens with a nice animation
 */
const drawStars = () => {
  const chip = document.getElementById('indie-chip') as HTMLElement
  const rect = chip.getBoundingClientRect()
  const origin = {
    x: (rect.left + rect.right) / 2 / window.innerWidth,
    y: (rect.top + rect.bottom) / 2 / window.innerHeight
  }
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'],
    origin,
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
  }

  const shoot = () => {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star']
    })

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle']
    })
  }

  setTimeout(shoot, 0)
  setTimeout(shoot, 100)
  setTimeout(shoot, 200)
}

/**
 * Draw some confettis on the screens with a nice animation
 */
const drawConfettis = () => {
  const duration = 1500
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  const randomInRange = (min: number, max: number): number => {
    return Math.random() * (max - min) + min
  }

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
  }, 250)
}
</script>

<style scoped>
#about-content {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  /* Monochromatic for --huskyfy-grey */
  background-color: #464646;
}

#text {
  max-width: 800px;
  padding: 10px 30px;

  text-align: justify;

  background-color: var(--huskyfy-grey);
  box-shadow: 14px 2px 20px 1px rgba(0, 0, 0, 0.5), -14px 2px 20px 1px rgba(0, 0, 0, 0.5);
  -webkit-box-shadow: 14px 2px 20px 1px rgba(0, 0, 0, 0.5), -14px 2px 20px 1px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 14px 2px 20px 1px rgba(0, 0, 0, 0.5), -14px 2px 20px 1px rgba(0, 0, 0, 0.5);
}

#main-title {
  width: 100%;

  display: flex;
  align-items: center;
}

#main-title-image {
  max-width: 60px !important;
  margin-right: 10px;

  animation-name: rotate-slowly;
  animation-duration: 4s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
  animation-play-state: paused;
  cursor: pointer;
}

#main-title-image:hover {
  animation-play-state: running;

}

@keyframes rotate-slowly {
  0% {
    transform: rotate(0deg);
  }

  20% {
    transform: rotate(90deg);
  }

  60% {
    transform: rotate(-90deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

#my-song-img {
  margin-left: 5px;

  display: inline-block;
  top: 5px;
}

h1 {
  font-size: 25px;
}

.subtitle {
  display: flex;
  flex-wrap: wrap;
}

.subtitle h2 {
  font-size: large;
}

h2+h2 {
  margin-left: 5px;
}

p {
  margin-bottom: 30px;

  color: lightgray;
}

a {
  text-decoration: none;
  color: var(--huskyfy-yellow-color) !important;
}

a:hover {
  text-decoration: underline;
}

#indie-chip {
  margin-bottom: 20px;
}

#github-icon {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-around;
}

#github-icon p {
  text-align: center;
}

#github-icon .v-img {
  margin: auto;
}

#open-my-music {
  cursor: pointer;
  color: var(--huskyfy-yellow-color);
}

#open-my-music:hover {
  text-decoration: underline;
}

@media only screen and (min-width: 768px) {
  h1 {
    font-size: 40px;
  }

  .subtitle h2 {
    font-size: 30px;
  }

  p {
    font-size: 17px;
  }

  #github-icon {
    margin: 50px;

    align-items: flex-end;
  }
}
</style>
