import api from "@/api";
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import LoginView from '@/views/LoginView.vue';
import NotFound from '@/views/NotFound.vue';
import PlaylistDetail from '@/views/PlaylistDetail.vue';
import PlaylistList from '@/views/PlaylistList.vue';
import { createRouter, createWebHistory } from 'vue-router';


const routes = [
    {
        path: "/login",
        name: "LoginView",
        component: LoginView,
    },
    {
        path: "/explore",
        name: "Explore",
        component: PlaylistList,
    },
    {
        path: "/playlist/:playlistId",
        name: "Explore playlist",
        component: PlaylistDetail,
        props: true,
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach(async function (to, from, next) {
    const authStore = useAuthStore()
    const userStore = useUserStore()

    // Does not allow to visit other pages while not connected
    if (!authStore.accessToken && to.name !== "LoginView") {
        next({ name: 'LoginView' })
    }

    // Intercept and autolog user when code is received
    else if (to.name == "LoginView" && to.query.code) {
        const code = to.query.code;
        authStore.temporaryToken = code;

        // Retrieving access token
        await api.spotify.auth.requestFirstAccessToken();

        // Getting user info
        const response = await api.spotify.users.getUserProfile();
        const data = response.data;

        userStore.$patch({
            id: data.id,
            username: data.display_name,
            profilePicture: data.images[0].url,
            isPremium: data.product == "premium",
            mail: data.email,
            country: data.country,
            connected: true,
        });
        next({ name: "Explore" });

    } else {
        // Default routing
        next();
    }
});

export default router;