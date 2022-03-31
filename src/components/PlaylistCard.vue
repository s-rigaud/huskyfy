<template>
  <p>{{ this.id }} - {{ this.name }}</p>
</template>

<script>
export default {
  name: "PlaylistCard",
  props: {
    id: String,
    name: String,
  },
  setup() {},
  data() {
    return {};
  },
};
</script>
