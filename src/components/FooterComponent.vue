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
        to="/explore"
        class="footer-link"
      >
        <v-btn
          variant="text"
          tabindex="-1"
        >
          {{ $t('page-title.explore') }}
        </v-btn>
      </router-link>
      <router-link
        to="/about"
        class="footer-link"
      >
        <v-btn
          variant="text"
          tabindex="-1"
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
            target="_blank"
            rel="noopener"
          >
            Hylectrif
          </a>
        </strong>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { useUserStore } from '@/stores/user'

// Footer with simple links at the bottom of the page
export default defineComponent({
  name: 'FooterComponent',
  setup () {
    const userStore = useUserStore()
    return { userStore }
  }
})
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
