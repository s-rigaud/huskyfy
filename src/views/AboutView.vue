<template>
  <h1>{{ $t("about.header") }}</h1>
  <v-btn @click="backToPreviousPage">{{ $t("about.home-button") }}</v-btn>
</template>

<script>
export default {
  name: "AboutView",
  methods: {
    backToPreviousPage() {
      this.$router.go(-1);
    },
  },
};
</script>