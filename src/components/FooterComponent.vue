<template>
  <v-footer id="footer" v-if="userStore.connected">
    <v-row justify="center" no-gutters>
      <router-link to="/explore">
        <v-btn text tile depressed class="my-2"> Home </v-btn>
      </router-link>
      <router-link to="/about">
        <v-btn text tile depressed class="my-2"> About </v-btn>
      </router-link>

      <v-col class="primary lighten-2 py-4 text-center white--text" cols="12">
        {{ new Date().getFullYear() }} —
        <strong>
          {{ $t("footer.built") }}
          <a
            id="github-link"
            href="https://github.com/s-rigaud"
            target="_blank"
          >
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
  background-color: #f0932b;
  color: #dff9fb;
}
button {
  background-color: #f0932b;
  color: #dff9fb;
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
footer {
  display: table;
}
</style>
