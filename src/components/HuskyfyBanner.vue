<template>
  <div id="main-banner">
    <h1 id="main-title" class="rainbow-text">{{ $t('playlist.explorer-title') }}</h1>
    <img :src="starImg" alt="Stars" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HuskyfyBanner',
  computed: {
    starImg (): string {
      return require('@/assets/stars.jpg')
    }
  }
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
