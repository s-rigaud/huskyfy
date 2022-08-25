<template>
  <!-- Language selector -->
  <div class="select" :style="sizeStyle">
    <select @change="updateLocale">
      <option v-for="locale in sortedLocales" :key="locale" :label="locale" :value="locale" type="text"></option>
    </select>
  </div>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/user'
import { defineComponent, StyleValue } from 'vue'

export default defineComponent({
  name: 'LocaleSelector',
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  props: {
    width: { type: Number, default: 60 },
    height: { type: Number, default: 30 }
  },
  computed: {
    sortedLocales() {
      // Set current locale first (preselected option)
      let locales: Array<string> = this.$i18n.availableLocales
      const currentLocale: string = this.$i18n.locale
      locales = locales.filter((l) => l !== currentLocale)
      locales.unshift(currentLocale)
      return locales
    },
    sizeStyle(): StyleValue {
      return { 'width': `${this.width}px`, 'height': `${this.height}px` }
    },
  },
  methods: {
    updateLocale(event: Event) {
      const locale: string = (event.target as HTMLInputElement).value
      this.$i18n.locale = locale
      this.userStore.locale = locale
    }
  }
})
</script>
<style scoped>
.select {
  position: relative;
  display: flex;
  line-height: 1;
  background: #5c6664;
  overflow: hidden;
  border-radius: 0.25em;
  margin: 10px;
}

.select::after {
  content: "\25BC";
  position: absolute;
  top: 0;
  right: 0;
  padding: 7px 5px;
  background: #3c3e3e;
  cursor: pointer;
  pointer-events: none;
  transition: 0.25s all ease;
  height: 100%;
}

.select:hover::after {
  color: var(--primary-color);
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-appearance: none;
  appearance: none;
  outline: 0;
  box-shadow: none;
  border: 0 !important;
  background: #5c6664;
  background-image: none;
  flex: 1;
  padding: 0 0.5em;
  color: #fff;
  cursor: pointer;
  font-size: 1em;
}

select::-ms-expand {
  display: none;
}
</style>
