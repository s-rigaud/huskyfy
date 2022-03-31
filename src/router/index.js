import ExploreView from '@/views/ExploreView.vue';
import HomePage from '@/views/HomePage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/modules/auth';


const routes = [
    {
        path: "/",
        name: "HomePage",
        component: HomePage,
    },
    {
        path: "/callback",
        name: "Callback",
        component: HomePage,
    },
    {
        path: "/explore",
        name: "Explore",
        component: ExploreView,
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach(function (to, from, next) {
    const authStore = useAuthStore()
    // Does not allow to visit other pages while not connected
    if (!authStore.accessToken && to.name !== "HomePage") {
        next(false);
    }
    next();
});

export default router;