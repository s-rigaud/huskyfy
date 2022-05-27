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
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20256%20448%22%20enable-background%3D%22new%200%200%20256%20448%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E.arrow%7Bfill%3A@{arrow}%3B%7D%3C%2Fstyle%3E%3Cpath%20class%3D%22arrow%22%20d%3D%22M255.9%20168c0-4.2-1.6-7.9-4.8-11.2-3.2-3.2-6.9-4.8-11.2-4.8H16c-4.2%200-7.9%201.6-11.2%204.8S0%20163.8%200%20168c0%204.4%201.6%208.2%204.8%2011.4l112%20112c3.1%203.1%206.8%204.6%2011.2%204.6%204.4%200%208.2-1.5%2011.4-4.6l112-112c3-3.2%204.5-7%204.5-11.4z%22%2F%3E%3C%2Fsvg%3E%0A");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: auto 30%;
  border-radius: 7px;
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