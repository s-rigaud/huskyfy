import api from "@/api";
import { useAuthStore } from '@/stores/modules/auth';
import { useUserStore } from '@/stores/modules/user';
import ExploreView from '@/views/ExploreView.vue';
import HomePage from '@/views/HomePage.vue';
import NotFound from '@/views/NotFound.vue';
import PlaylistView from '@/views/PlaylistView.vue';
import { createRouter, createWebHistory } from 'vue-router';




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
        children: [
            {
                path: "playlist/:playlistId",
                name: "Explore playlist",
                component: PlaylistView,
                props: true,
            }
        ]
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

    // Intercept and autolog user when code is received
    console.log(to, from, next);
    if (to.name == "HomePage" && to.query.code) {
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
    }

    // Does not allow to visit other pages while not connected
    if (!authStore.accessToken && to.name !== "HomePage") {
        next(false);
    }
    next();
});

export default router;