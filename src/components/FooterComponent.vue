<template>
  <v-footer
    app
    color="primary lighten-1"
    style="max-height: 100px"
    v-if="userStore.connected"
  >
    <v-row justify="center" no-gutters>
      <v-col class="primary lighten-2 py-4 text-center white--text" cols="12">
        {{ new Date().getFullYear() }} —
        <strong>Built with ♥ by Hylectrif</strong>
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
