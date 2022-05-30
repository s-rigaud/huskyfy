<template>
  <v-app>
    <NavbarComponent />
    <v-main
      v-bind:class="{
        'no-padding': true,
        'small-padding-top': ['Explore', 'About'].includes($router.currentRoute.value.name),
        'huge-padding-top': $router.currentRoute.value.name === 'Explore playlist'
      }"
    >
      <v-container id="container" fluid>
        <router-view />
      </v-container>
    </v-main>
    <FooterComponent />
  </v-app>
</template>

<script>
import FooterComponent from "@/components/FooterComponent.vue";
import NavbarComponent from "@/components/NavbarComponent.vue";

export default {
  name: "App",
  components: { NavbarComponent, FooterComponent },
  mounted(){
    console.log(this.$router.currentRoute.value.name === "Explore");
  }
};
</script>
<style scoped>
#container {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: stretch;
  align-content: space-between;
  justify-content: space-around;
  background-color: #f6e58d !important;
  font-family: "Oswald";
}

@font-face {
  font-family: "Righteous";
  src: local("Righteous"),
    url(./fonts/righteous/Righteous-j7av.ttf) format("truetype");
}

@font-face {
  font-family: "Oswald";
  src: local("Oswald"), url(./fonts/oswald/Oswald-Medium.ttf) format("truetype");
}

.no-padding {
  padding: 0 !important;
}
.small-padding-top {
  padding: 64px 0 0 0 !important;
}
.huge-padding-top {
  padding: 160px 0 0 0 !important;
}
</style>
