<template>
  <v-footer app id="footer" v-if="userStore.connected">
    <v-row justify="center" no-gutters>
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
import { useUserStore } from "@/stores/user";

export default {
  name: "FooterComponent",
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
};
</script>
<style scoped>
#footer {
  max-height: 100px;
  background-color: #30336b;
  color: #dff9fb;
}
#github-link {
  color: #f0932b;
  text-decoration: none;
}
</style>