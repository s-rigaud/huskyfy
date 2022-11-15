import api from '@/api'
import { t } from '@/i18n'

import { useAuthStore } from '@/stores/auth'
import { usePlaylistsStore } from '@/stores/playlists'
import { useUserStore } from '@/stores/user'

import AboutView from '@/views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'
import NotFound404 from '@/views/NotFound404.vue'
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
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: NotFound404
  }
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

  // Intercept and autolog user when code is received
  if (to.name === 'LoginView' && to.query.code) {
    if (to.query.state !== authStore.stateAuthorizationCode) {
      console.error(
        'Possibly a CSRF, state received from Spotify ' +
        'is not the one used to make request for authentification'
      )
      next({ name: 'LoginView' })
    }
    authStore.temporaryToken = to.query.code

    // Retrieving access token
    await api.spotify.auth.requestFirstAccessToken()

    // Getting user info
    const response = await api.spotify.users.getUserProfile()
    const data = response.data
    const userPicture = data.images ? data.images[0].url : require('@/assets/no-user.png')
    useUserStore().$patch({
      id: data.id,
      username: data.display_name,
      profilePicture: userPicture,
      country: data.country,
      connected: true,
      uri: data.uri
    })
    next({ name: 'Explore' })

    // Does not allow to visit other pages while not connected
  } else if (!authStore.accessToken && to.name !== 'LoginView' && to.name !== 'About') {
    next({ name: 'LoginView' })

    // Redirect user to main page if already connected
  } else if (to.name === 'LoginView' && authStore.accessToken) {
    next({ name: 'Explore' })
  } else {
    next()
  }
})

router.afterEach((to) => {
  const translationKey = to.path.split('/')[1]
  if (translationKey !== 'playlist') {
    if (t(`page-title.${translationKey}`) === `page-title.${translationKey}`) {
      document.title = '404 - Huskyfy'
    } else {
      document.title = t(`page-title.${translationKey}`) + ' - Huskyfy'
    }
  } else {
    const playlistName = usePlaylistsStore().playlists[(to.params.playlistId as string)].name
    document.title = `${playlistName} - Huskyfy`
  }
})

export default router
