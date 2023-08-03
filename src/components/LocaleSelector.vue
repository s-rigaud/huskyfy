<template>
  <v-menu
    open-on-hover
    transition="fade-transition"
  >
    <template #activator="{ props }">
      <v-btn
        class="select-btn rainbow-v-btn"
        v-bind="props"
      >
        <v-img
          :src="currentLocaleIcon"
          alt="Country flag"
          width="50"
        />
      </v-btn>
    </template>
    <v-list id="locale-list">
      <v-list-item
        v-for="(locale, index) in sortedLocales"
        :key="index"
        :item-value="locale"
        class="locale-item"
        @click="updateLocale"
      >
        <v-img
          :alt="locale"
          :src="getIconForLocale(locale)"
          width="50"
        />
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">

import { i18n, locale } from '@/i18n'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

enum HandledLocale {
  FR = 'fr',
  EN = 'en',
}

const userStore = useUserStore()

/**
 * Retrieve list of all available locales.
 * The current one is set as first for the UI.
 */
const sortedLocales = computed((): HandledLocale[] => {
  let locales = [HandledLocale.FR, HandledLocale.EN]
  const currentLocale = locale
  locales = locales.filter((l) => l !== currentLocale)
  locales.unshift(currentLocale as HandledLocale)
  return locales
})

const currentLocaleIcon = computed((): string => {
  return getIconForLocale(locale as HandledLocale)
})

const getIconForLocale = (locale: HandledLocale): string => {
  return {
    en: new URL('./../assets/en.png', import.meta.url).href,
    fr: new URL('./../assets/fr.png', import.meta.url).href
  }[locale]
}

/**
 * Update UI locale for i18n.
 * All the website instantly update each element without reloading the page.
 */
const updateLocale = (event: Event) => {
  // Recursively retrieve list-item as the event can occur in child nodes
  let node = event.target as HTMLElement
  while (!node.getAttribute('item-value')) {
    node = node.parentNode as HTMLElement
  }
  const newLocale = (node.getAttribute('item-value') as string)
  i18n.global.locale = newLocale
  userStore.locale = newLocale
}

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
