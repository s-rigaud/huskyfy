<template>
  <v-app-bar
    app
    absolute
    v-if="userStore.connected"
    fade-img-on-scroll
    color="#f4f4f4"
  >
    <router-link id="explore" to="/explore">
      <img src="logo.png" alt="" style="min-width: 100px; width: 150px" />
    </router-link>

    <v-spacer></v-spacer>

    <!-- User info part -->
    <h3 style="margin-right: 10px">{{ userStore.username }}</h3>
    <v-badge content="🎵" color="warning">
      <v-avatar style="align-items: initial">
        <v-img
          v-bind:src="this.userStore.profilePicture"
          alt="Profile picture"
        ></v-img>
      </v-avatar>
    </v-badge>

    <select @change="updateLocale($event)">
      <option
        v-for="locale in sortedLocales"
        :key="locale"
        :value="locale"
        :text="locale"
      ></option>
    </select>

    <v-btn @click="logout" color="error">
      {{ $t("navbar.logout") }}
    </v-btn>
  </v-app-bar>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";

export default {
  name: "NavbarComponent",
  setup() {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    return { authStore, userStore };
  },
  computed: {
    profilePictureOrDefault() {
      const DEFAULT_PICTURE = require("../assets/no-user.png");
      return this.userStore.profilePicture != ""
        ? this.userStore.profilePicture
        : DEFAULT_PICTURE;
    },
    sortedLocales() {
      // Set current locale first (preselected option)
      let locales = this.$i18n.availableLocales;
      const currentLocale = this.$i18n.locale;
      locales = locales.filter((l) => l != currentLocale);
      locales.unshift(currentLocale);
      return locales;
    },
  },
  methods: {
    logout() {
      this.userStore.$reset();
      this.authStore.$reset();
      this.$router.push({ name: "LoginView" });
    },
    updateLocale(event) {
      this.$i18n.locale = event.target.value;
      this.mobileMenuActive = !this.mobileMenuActive;
    },
  },
};
</script>