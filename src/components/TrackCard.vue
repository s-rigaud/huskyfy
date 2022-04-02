<template>
  <v-col cols="12">
    <v-card color="#1F7087" theme="dark">
      <div class="d-flex flex-no-wrap justify-space-between">
        <div>
          <v-card-title class="text-h5"> {{ id }} </v-card-title>

          <v-card-subtitle>{{ name }}</v-card-subtitle>

          <v-card-actions>
            <v-btn class="ml-2" variant="outlined" size="small">
              START RADIO
            </v-btn>
          </v-card-actions>
        </div>

        <v-avatar class="ma-3" size="125" rounded="0">
          <v-img
            src="https://cdn.vuetifyjs.com/images/cards/foster.jpg"
          ></v-img>
        </v-avatar>
      </div>
    </v-card>
  </v-col>
</template>

<script>
export default {
  name: "TrackCard",
  props: {
    id: String,
    name: String,
    image: String,
  },
};
</script>
