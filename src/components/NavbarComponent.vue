<template>
  <nav class="navbar box" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <img
          src="http://www.miage.fr/wp-content/uploads/2020/11/MIAGE_LOGO-SEUL_COULEURS.png"
          width="112"
          height="28"
        />
      </a>

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        :class="{ 'is-active': mobileMenuActive }"
        @click="mobileMenuActive = !mobileMenuActive"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': mobileMenuActive }">
      <div class="navbar-start">
        <router-link
          id="home"
          class="navbar-item"
          to="/"
          @click="mobileMenuActive = !mobileMenuActive"
        >
          🏠 Accueil
        </router-link>
        <router-link
          id="explorer"
          class="navbar-item"
          to="/explore"
          @click="mobileMenuActive = !mobileMenuActive"
        >
          ⚙️ Explore
        </router-link>
      </div>
    </div>

    <div v-if="this.userStore.connected" class="navbar-end">
      <img .src="this.userStore.profilePicture" alt="Profile picture" />
      <p>{{ this.userStore.username }}</p>
      <p>{{ this.userStore.isPremium }}</p>
    </div>
  </nav>
</template>

<script>
import { useUserStore } from "@/stores/modules/user";

export default {
  name: "NavbarComponent",
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  data() {
    return {
      mobileMenuActive: false,
    };
  },
};
</script>

<style scoped>
.navbar {
  height: 70px;
  padding: 0px;
  margin-bottom: 0px;
}
.navbar-brand-img {
  margin-left: 10px;
  height: 50px;
  width: 35px;
}

.navbar-item {
  color: black !important;
}
.router-link-active {
  font-weight: 900;
}

.animated {
  position: relative;
  z-index: 0;
  margin-right: 5px;
  margin-left: 5px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
}

.animated::before {
  content: "";
  position: absolute;
  z-index: -2;
  left: -50%;
  top: -50%;
  width: 200%;
  height: 200%;
  background-color: #399953;
  background-repeat: no-repeat;
  background-size: 50% 50%, 50% 50%;
  background-position: 0 0, 100% 0, 100% 100%, 0 100%;
  background-image: linear-gradient(#7fff00, #32cd32),
    linear-gradient(#32cd32, #228b22), linear-gradient(#f4a460, #a0522d),
    linear-gradient(#a0522d, #800000);
  animation: rotate 4s linear infinite;
}

.animated::after {
  content: "";
  position: absolute;
  z-index: -1;
  left: 6px;
  top: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  background: white;
  border-radius: 5px;
}

@keyframes rotate {
  100% {
    transform: rotate(1turn);
  }
}
</style>
