<template>
  <section>
    <h1 class="rainbow-text title-404">
      {{ $t('404.title.part1') }}
    </h1>
    <h2 class="title-404">
      <span class="rainbow-text">{{ $t('404.title.part2') }}</span>😕
    </h2>
    <v-btn
      id="back-button"
      append-icon="mdi-map-search-outline"
      class="rainbow-v-btn"
      @click="backToPreviousPage"
    >
      {{ $t('404.button') }}
    </v-btn>
  </section>
</template>

<script setup lang="ts">
import { useMeta } from 'vue-meta'
import { useRouter } from 'vue-router'

const router = useRouter()

useMeta({
  title: '404',
  link: [
    { rel: 'canonical', href: `${import.meta.env.VITE_APP_BASE_SERVER_URL}/404` }
  ]
})

const backToPreviousPage = () => {
  router.go(-1)
}
</script>

<style scoped>
section {
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: center;
}

h1,
h2 {
  text-align: center;
}

.title-404 {
  margin: 10px 0px;
  padding: 0px 0px;

  font-size: xx-large;
  display: block;
}

#back-button {
  color: var(--huskyfy-black);
}
</style>
