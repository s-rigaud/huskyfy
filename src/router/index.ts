import api from '@/api'
import VueI18n from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'
import AboutView from '@/views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'
import PlaylistDetail from '@/views/PlaylistDetail.vue'
import PlaylistExplorer from '@/views/PlaylistExplorer.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/explore' },
  {
    path: '/login',
    name: 'LoginView',
    component: LoginView
  },
  {
    path: '/explore',
    name: 'Explore',
    component: PlaylistExplorer
  },
  {
    path: '/playlist/:playlistId',
    name: 'Explore playlist',
    component: PlaylistDetail,
    props: true
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  { path: '/:pathMatch(.*)*', redirect: '/explore' }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior () {
    // always scroll to top
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach(async function (to, from, next) {
  const authStore = useAuthStore()

  // Does not allow to visit other pages while not connected
  if (!authStore.accessToken && to.name !== 'LoginView' && to.name !== 'About') {
    next({ name: 'LoginView' })

    // Intercept and autolog user when code is received
  } else if (to.name === 'LoginView' && to.query.code) {
    const code = to.query.code

    if (to.query.state !== authStore.stateAuthorizationCode) {
      console.error(
        'Possibly a CSRF, state received from Spotify ' +
        'is not the one used to make request for authentification'
      )
      next({ name: 'LoginView' })
    }

    authStore.temporaryToken = code

    // Retrieving access token
    await api.spotify.auth.requestFirstAccessToken()

    // Getting user info
    const response = await api.spotify.users.getUserProfile()
    const data = response.data

    const userPicture = (data.images.length > 0) ? data.images[0].url : require('@/assets/no-user.png')
    useUserStore().$patch({
      id: data.id,
      username: data.display_name,
      profilePicture: userPicture,
      isPremium: data.product === 'premium',
      country: data.country,
      connected: true,
      wantsToChangeAccount: false
    })
    next({ name: 'Explore' })

    // Selecting selected playlist
  } else if (to.name === 'Explore playlist') {
    usePlaylistsStore().selectedPlaylistId = (to.params.playlistId as string)
    next()

    // Default routing
  } else {
    usePlaylistsStore().$patch({ selectedPlaylistId: null, filteredTracks: [], selectedGenres: [] })
    next()
  }
})

router.afterEach((to, from) => {
  const translationKey = to.path.split('/')[1]
  if (translationKey !== 'playlist') {
    document.title = VueI18n.t(`page-title.${translationKey}`) + ' - Horus'
  } else {
    const playlistStore = usePlaylistsStore()
    const playlistName = playlistStore.playlists[playlistStore.selectedPlaylistId!].name
    document.title = `${playlistName} - Horus`
  }
})

export default router
