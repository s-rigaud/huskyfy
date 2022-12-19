<template>
  <v-menu open-on-hover transition="fade-transition">
    <template v-slot:activator="{ props }">
      <v-btn class="select-btn rainbow-v-btn" v-bind="props">
        <v-img :src="currentLocaleIcon" alt="Country flag" width="50"></v-img>
      </v-btn>
    </template>
    <v-list id="locale-list">
      <v-list-item class="locale-item" v-for="(locale, index) in sortedLocales" :key="index" :item-value="locale"
        @click="updateLocale">
        <v-img width="50" :src="getIconForLocale(locale)" :alt="locale"></v-img>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useUserStore } from '@/stores/user'

export default defineComponent({
  name: 'LocaleSelector',
  setup () {
    const userStore = useUserStore()
    return { userStore }
  },
  computed: {
    sortedLocales (): string[] {
      // Set current locale first (preselected option)
      let locales = this.$i18n.availableLocales
      const currentLocale = this.$i18n.locale
      locales = locales.filter((l) => l !== currentLocale)
      locales.unshift(currentLocale)
      return locales
    },
    currentLocaleIcon (): string {
      return this.getIconForLocale(this.$i18n.locale)
    }
  },
  methods: {
    getIconForLocale (locale: string): string {
      return require(`@/assets/${locale}.png`)
    },
    updateLocale (event: Event) {
      // Recursively retrieve list-item as the event can occur in child nodes
      let node = (event.target as HTMLElement)
      while (!node.getAttribute('item-value')) {
        node = (node.parentNode as HTMLElement)
      }
      const locale = (node.getAttribute('item-value') as string)
      this.$i18n.locale = locale
      this.userStore.locale = locale
    }
  }
})
</script>
<style scoped>
#locale-list {
  background-color: var(--text-color);
}

.locale-text {
  font-size: medium;
  padding-left: 7px;
}

.locale-item {
  padding: 7px !important;
  background: linear-gradient(180deg, var(--text-color) 20%, var(--link-color) 51%, var(--text-color) 86%) !important;
}

.locale-item:hover {
  background-color: black !important;
}

.select-btn {
  padding: 6px;
  height: 44px;
}
</style>
