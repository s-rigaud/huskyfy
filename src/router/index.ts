import api from '@/api'
import { t } from '@/i18n'

import { useAuthStore } from '@/stores/auth'
import { NotificationType, useNotificationsStore } from '@/stores/notifications'
import { useUserStore } from '@/stores/user'

import AboutView from '@/views/AboutView.vue'
import LoginView from '@/views/LoginView.vue'
import NotFound404 from '@/views/NotFound404.vue'
import PlaylistDetail from '@/views/PlaylistDetail.vue'
import PlaylistExplorer from '@/views/PlaylistExplorer.vue'

import { createRouter, createWebHistory } from 'vue-router'

export const ROUTE_NAME_LOGIN = 'Login'
const routes = [
  { path: '/', redirect: '/explore' },
  {
    path: '/login',
    name: ROUTE_NAME_LOGIN,
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

// eslint-disable-next-line
const DEFAULT_USER_PICTURE = (require('@/assets/no-user.png') as string)

/**
 * Intercept and handle routing logic according to parameters and authentification state.
 */
router.beforeEach(async function (to, _, next) {
  const authStore = useAuthStore()

  // Intercept and autolog user when code is received
  if (to.name === ROUTE_NAME_LOGIN && to.query.code) {
    if (to.query.state !== authStore.stateAuthorizationCode) {
      console.error(
        'Possibly a CSRF, state received from Spotify ' +
        'is not the one used to make request for authentification'
      )
      next({ name: ROUTE_NAME_LOGIN })
    }
    authStore.temporaryToken = to.query.code

    // Retrieving access token
    await api.spotify.auth.requestFirstAccessToken()

    // Getting user info
    const { data } = await api.spotify.users.getUserProfile()
    const userPicture = data.images[0]?.url || DEFAULT_USER_PICTURE
    useUserStore().$patch({
      id: data.id,
      username: data.display_name,
      profilePicture: userPicture,
      connected: true
    })
    useNotificationsStore().notifications.push(
      { message: t('api.refresh-succeeded'), type: NotificationType.success }
    )
    next({ name: 'Explore' })

    // Does not allow to visit other pages while not connected
  } else if (!authStore.accessToken && to.name !== ROUTE_NAME_LOGIN && to.name !== 'About') {
    next({ name: ROUTE_NAME_LOGIN })

    // Redirect user to main page if already connected
  } else if (to.name === ROUTE_NAME_LOGIN && authStore.accessToken) {
    next({ name: 'Explore' })
  } else {
    next()
  }
})

export default router
