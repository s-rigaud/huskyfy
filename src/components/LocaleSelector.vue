<template>
  <select @change="updateLocale">
    <option
      v-for="locale in sortedLocales"
      :key="locale"
      :label="locale"
      :value="locale"
      type="text"
    ></option>
  </select>
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
    updateLocale(event) {
      const locale = event.target.value;
      this.$i18n.locale = locale;
      this.userStore.locale = locale;
    },
  },
};
</script>
<style scoped>
select {
  background-color: #f0932b;
  background-image: url("../assets/arrow.svg");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: auto 30%;
  border-radius: 5px;
  border: none;
  color: black;
  outline: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  height: 40px;
  width: 45px;
  margin: 10px;
  padding: 0px 6px;
}
</style>