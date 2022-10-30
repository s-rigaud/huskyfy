<template>
  <section>
    <h1 class="rainbow-text title-404">{{ $t('404.title.part1') }}</h1>
    <h2 class="title-404"><span class="rainbow-text">{{ $t('404.title.part2') }}</span>😕</h2>
    <v-btn @click="backToPreviousPage" class="rainbow-v-btn" append-icon="mdi-map-search-outline">
      {{ $t('404.button') }}
    </v-btn>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NotFound404',
  computed: {
  },
  methods: {
    backToPreviousPage () {
      this.$router.go(-1)
    }
  }
})
</script>
<style scoped>
section {
  height: 100%;
  width: 100%;
  display: flex;
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
</style>
