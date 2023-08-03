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
          tabindex="-1"
          variant="text"
        >
          {{ $t('page-title.about') }}
        </v-btn>
      </router-link>

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
</script>

<style scoped>
#footer {
  max-height: 100px;
  background-color: var(--primary-color) !important;
  color: var(--text-color) !important;
  display: table;
}

.footer-link {
  margin: 2px;
}

.footer-link:focus {
  outline: 3px var(--text-color) solid;
}

button {
  background-color: var(--primary-color);
  color: var(--text-color) !important;
  font-weight: 700;
}

#github-link {
  color: var(--link-color);
  text-decoration: none;
}

#github-link:focus {
  outline: 3px var(--link-color) solid;
}

.v-btn--variant-contained {
  box-shadow: none;
}

a {
  text-decoration: none;
}
</style>
