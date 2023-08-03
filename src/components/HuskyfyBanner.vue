<template>
  <div id="main-banner">
    <h1
      id="main-title"
      class="rainbow-text"
    >
      {{ $t('playlist.explorer-title') }}
    </h1>
    <img
      :src="starImg"
      alt="Stars"
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const starImg = computed((): string => {
  return new URL('./../assets/stars.jpg', import.meta.url).href
})
</script>

<style scoped>
#main-banner {
  padding: 0px 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;

  overflow: hidden;
  position: relative;
}

#main-banner img {
  width: 100%;
  height: auto;

  position: absolute;
  left: 0;
  top: 0;

  opacity: 0.6;
  transform: rotateY(180deg);
}

#main-banner h1 {
  text-align: center;
  z-index: 1;
}
</style>
