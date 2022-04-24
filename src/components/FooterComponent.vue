<template>
  <v-footer
    app
    style="max-height: 100px; background-color: #30336b; color: #dff9fb"
    v-if="userStore.connected"
  >
    <v-row justify="center" no-gutters>
      <v-col class="primary lighten-2 py-4 text-center white--text" cols="12">
        {{ new Date().getFullYear() }} —
        <strong>
          Built with ♥ by
          <a
            href="https://github.com/s-rigaud"
            target="_blank"
            style="color: #f0932b; text-decoration: none"
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
