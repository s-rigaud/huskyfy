<template>
  <!-- Language selector -->
  <div class="select">
    <select @change="updateLocale">
      <option v-for="locale in sortedLocales" :key="locale" :label="locale" :value="locale" type="text"></option>
    </select>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/user'

export default {
  name: 'LocaleSelector',
  setup () {
    const userStore = useUserStore()
    return { userStore }
  },
  computed: {
    sortedLocales () {
      // Set current locale first (preselected option)
      let locales = this.$i18n.availableLocales
      const currentLocale = this.$i18n.locale
      locales = locales.filter((l) => l !== currentLocale)
      locales.unshift(currentLocale)
      return locales
    }
  },
  methods: {
    updateLocale (event) {
      const locale = event.target.value
      this.$i18n.locale = locale
      this.userStore.locale = locale
    }
  }
}
</script>
<style scoped>
.select {
  position: relative;
  display: flex;
  width: 60px;
  height: 30px;
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
  padding: 7px 7px;
  background: #3c3e3e;
  cursor: pointer;
  pointer-events: none;
  transition: 0.25s all ease;
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
