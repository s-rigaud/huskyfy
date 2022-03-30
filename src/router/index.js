import HomePage from '@/views/HomePage.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/modules/auth';

const routes = [
    {
        path: "/",
        name: "HomePage",
        component: HomePage
    },
]


const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach(function (to, from, next) {
    const store = useAuthStore()
    // Does not allow to visit other pages while not connected
    if (!store.access_token && to.name !== "HomePage") {
        next(false);
    }
    next();
});

export default router;