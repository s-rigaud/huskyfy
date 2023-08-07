<template>
  <v-footer
    v-if="userStore.connected"
    id="footer"
  >
    <v-row
      justify="center"
      no-gutters
    >
      <router-link
        class="footer-link"
        to="/explore"
      >
        <v-btn
        prepend-icon="mdi-compass"
          tabindex="-1"
          variant="text"
        >
          {{ $t('page-title.explore') }}
        </v-btn>
      </router-link>
      <router-link
        class="footer-link"
        to="/about"
      >
        <v-btn
        prepend-icon="mdi-information-outline"
          tabindex="-1"
          variant="text"
        >
          {{ $t('page-title.about') }}
        </v-btn>
      </router-link>
      <v-btn
      prepend-icon="mdi-bug-outline"
        tabindex="-1"
        variant="text"
        @click="openBugReport"
      >
        {{ $t('footer.report-bug') }}
      </v-btn>

      <v-col
        class="primary lighten-2 py-4 text-center white--text"
        cols="12"
      >
        <strong>
          {{ new Date().getFullYear() }} - {{ $t("footer.built") }}
          <a
            id="github-link"
            href="https://github.com/s-rigaud"
            rel="noopener"
            target="_blank"
          >
            Hylectrif
          </a>
        </strong>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const openBugReport = () => {
  const email = 'mailto:huskyfy.bugtracker@gmail.com?subject=Huskyfy%20improvement%20request'
  window.open(email, '_blank')?.focus()
}
</script>

<style scoped>
#footer {
  max-height: 100px;
  background-color: var(--huskyfy-black) !important;
  color: var(--huskyfy-orange) !important;
  display: table;
}

.footer-link {
  margin: 2px;
}

.footer-link:focus {
  outline: 3px var(--huskyfy-orange) solid;
}

button {
  background-color: var(--huskyfy-black);
  color: var(--huskyfy-orange) !important;
  font-weight: 700;
}

#github-link {
  color: var(--huskyfy-yellow-color);
  text-decoration: none;
}

#github-link:focus {
  outline: 3px var(--huskyfy-yellow-color) solid;
}

.v-btn--variant-contained {
  box-shadow: none;
}

a {
  text-decoration: none;
}
</style>
