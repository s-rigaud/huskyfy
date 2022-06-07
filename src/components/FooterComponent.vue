<template>
  <v-footer id="footer" v-if="userStore.connected">
    <v-row justify="center" no-gutters>
      <router-link to="/explore">
        <v-btn> Home </v-btn>
      </router-link>
      <router-link to="/about">
        <v-btn> About </v-btn>
      </router-link>

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

<script>
import { useUserStore } from '@/stores/user'

export default {
  name: 'FooterComponent',
  setup () {
    const userStore = useUserStore()
    return { userStore }
  }
}
</script>
<style scoped>
#footer {
  max-height: 100px;
  background-color: #A33327 !important;
  color: #dff9fb !important;
  display: table;
}

button {
  background-color: #A33327;
  color: #dff9fb !important;
  font-weight: 700;
}

#github-link {
  color: #130f40;
  text-decoration: none;
}

.v-btn--variant-contained {
  box-shadow: none;
}

a {
  text-decoration: none;
}
</style>
