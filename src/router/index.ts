import { createRouter, createWebHistory } from 'vue-router'

import api from '@/api'
import { t } from '@/i18n'

import { useAuthStore } from '@/stores/auth'
import { NotificationType, useNotificationsStore } from '@/stores/notifications'
import { useUserStore } from '@/stores/user'

export const ROUTE_NAME_LOGIN = 'Login'
const routes = [
  { path: '/', redirect: '/explore' },
  {
    path: '/login',
    name: ROUTE_NAME_LOGIN,
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('../views/PlaylistExplorer.vue')
  },
  {
    path: '/playlist/:playlistId',
    name: 'Explore playlist',
    component: () => import('../views/PlaylistDetail.vue'),
    props: true
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('../views/NotFound404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior () {
    // always scroll to top
    return { top: 0, behavior: 'smooth' }
  }
})

const DEFAULT_USER_PICTURE = new URL('./../assets/no-user.png', import.meta.url).href

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
