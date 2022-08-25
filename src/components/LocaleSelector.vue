<template>
  <!-- Language selector -->
  <div id="select-container">
    <select id="select-country" class="rainbow-v-btn" @change="updateLocale" :style="sizeStyle">
      <option v-for="locale in sortedLocales" :key="locale" :label="locale" :value="locale" type="text"></option>
    </select>
    <div id="select-flag">
      <v-img id="country-flag" :src="flag" alt="Country flag" width="30"></v-img>
    </div>
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
    width: { type: Number, default: 100 },
    height: { type: Number, default: 50 }
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
    flag(): string {
      return require(`@/assets/${this.$i18n.locale}.png`)
    }
  },
  methods: {
    updateLocale(event: Event) {
      const locale: string = (event.target as HTMLInputElement).value
      this.$i18n.locale = locale
      this.userStore.locale = locale
    }
  },
  data() {
    return {
      isSelectOpen: false
    }
  }
})
</script>
<style scoped>
#select-container {
  padding: 10px;
}

select {
  font-size: 100%;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5%;
  border: none;
  color: black;
  appearance: none;
  padding: 10px;
  padding-right: 20px;
  -webkit-appearance: none;
  -moz-appearance: none;
  transition: color 0.3s ease;
}

select:hover {
  color: var(--primary-color);
}


/* For IE <= 11 */
select::-ms-expand {
  display: none;
}

#select-flag {
  position: absolute;
  width: 50px;
  height: 100%;
  top: 0;
  right: 0;
  display: flex;
  border-left: 5px var(--primary-color) dotted;
}
</style>
