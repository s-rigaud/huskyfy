<template>
  <v-select
    :items="sortedLocales"
    label="Locale"
    @input="updateLocale"
    value="sortedLocales[0]"
    type="text"
    dense
  ></v-select>
</template>

<script>
import { useUserStore } from "@/stores/user";

export default {
  name: "LocaleSelector",
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  computed: {
    sortedLocales() {
      // Set current locale first (preselected option)
      let locales = this.$i18n.availableLocales;
      const currentLocale = this.$i18n.locale;
      locales = locales.filter((l) => l != currentLocale);
      locales.unshift(currentLocale);
      return locales;
    },
  },
  methods: {
    updateLocale(newLocale) {
      console.error("pomme");
      this.$i18n.locale = newLocale;
      this.userStore.locale = newLocale;
    },
  },
};
</script>