<template>
  <!-- Language selector -->
  <v-menu open-on-hover transition="slide-y-transition">
    <template v-slot:activator="{ props }">
      <v-btn class="select-btn rainbow-v-btn" v-bind="props">
        <v-img :src="currentLocaleIcon" alt="Country flag" width="50"></v-img>
      </v-btn>
    </template>
    <v-list id="locale-list">
      <v-list-item class="locale-item" v-for="(locale, index) in sortedLocales" :key="index" :item-value="locale"
        @click="updateLocale">
        <v-list-item-avatar size="small">
          <v-img :src="getIconForLocale(locale)" :alt="locale"></v-img>
        </v-list-item-avatar>
        <v-list-item-title class="locale-text">{{ locale }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/user'
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const userStore = useUserStore()
    return { userStore }
  },
  computed: {
    sortedLocales (): string[] {
      // Set current locale first (preselected option)
      let locales: Array<string> = this.$i18n.availableLocales
      const currentLocale: string = this.$i18n.locale
      locales = locales.filter((l) => l !== currentLocale)
      locales.unshift(currentLocale)
      return locales
    },
    currentLocaleIcon (): string {
      return this.getIconForLocale(this.$i18n.locale)
    },
    getIconForLocale () {
      return (locale: string): string => {
        return require(`@/assets/${locale}.png`)
      }
    }
  },
  methods: {
    updateLocale (event: Event) {
      // Recursively retrieve list-item as the event can occur in child nodes
      let node = (event.target as HTMLElement)
      while (!node!.getAttribute('item-value')) {
        node = (node.parentNode as HTMLElement)
      }
      const locale: string = (node.getAttribute('item-value') as string)
      this.$i18n.locale = locale
      this.userStore.locale = locale
    }
  }
})
</script>
<style scoped>
#locale-list {
  width: 80px;
}

.locale-text {
  font-size: medium;
  padding-left: 7px;
}

.locale-item {
  padding: 7px !important;
}

.select-btn {
  padding: 15px;
}
</style>
