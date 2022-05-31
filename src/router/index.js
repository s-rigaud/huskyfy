import api from "@/api";
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import AboutView from '@/views/AboutView.vue';
import LoginView from '@/views/LoginView.vue';
import NotFound from '@/views/NotFound.vue';
import PlaylistDetail from '@/views/PlaylistDetail.vue';
import PlaylistExplorer from '@/views/PlaylistExplorer.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { usePlaylistsStore } from "@/stores/playlists";


const routes = [
    { path: '/', redirect: '/explore' },
    {
        path: "/login",
        name: "LoginView",
        component: LoginView,
    },
    {
        path: "/explore",
        name: "Explore",
        component: PlaylistExplorer,
    },
    {
        path: "/playlist/:playlistId",
        name: "Explore playlist",
        component: PlaylistDetail,
        props: true,
    },
    {
        path: "/about",
        name: "About",
        component: AboutView,
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach(async function (to, from, next) {
    const authStore = useAuthStore()

    // Does not allow to visit other pages while not connected
    if (!authStore.accessToken && to.name !== "LoginView" && to.name !== "About") {
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

        const userPicture = (data.images.length > 0) ? data.images[0].url : ''
        useUserStore().$patch({
            id: data.id,
            username: data.display_name,
            profilePicture: userPicture,
            isPremium: data.product == "premium",
            mail: data.email,
            country: data.country,
            connected: true,
        });
        next({ name: "Explore" });

    } else if (to.name != "Explore playlist"){
        usePlaylistsStore().selectedPlaylistId = null
        next();
    }else {
        // Default routing
        next();
    }
});

export default router;