<template>
  <!-- Footer with simple links at the bottom of the page -->
  <v-footer id="footer" v-if="userStore.connected">
    <v-row justify="center" no-gutters>
      <router-link to="/explore">
        <v-btn> Home </v-btn>
      </router-link>
      <router-link to="/about">
        <v-btn> About </v-btn>
      </router-link>

      <!-- Created with ♥ -->
      <v-col class="primary lighten-2 py-4 text-center white--text" cols="12">
        {{ new Date().getFullYear() }} —
        <strong>
          {{ $t("footer.built") }}
          <a id="github-link" href="https://github.com/s-rigaud" target="_blank">
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

button {
  background-color: var(--primary-color);
  color: var(--text-color) !important;
  font-weight: 700;
}

#github-link {
  color: var(--link-color);
  text-decoration: none;
}

.v-btn--variant-contained {
  box-shadow: none;
}

a {
  text-decoration: none;
}
</style>
