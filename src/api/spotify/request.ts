import api from '@/api'
import router, { ROUTE_NAME_LOGIN } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { Relevance, useNotificationsStore } from '@/stores/notifications'
import axios from 'axios'

const request = axios.create({
  baseURL: 'https://api.spotify.com/v1/'
})

// Add Headers headers on every request when connected
request.interceptors.request.use(function (config) {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    // eslint-disable-next-line
    config.headers!.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
})

request.interceptors.response.use(response => {
  // Log every request
  // console.info(response)
  return response
}, async (error) => {
  const { status } = error.response
  const config = error.config

  // Handle access token refresh for 401
  if (error.response && status === 401) {
    const accessToken = await api.spotify.auth.requestNewAccessToken()
    if (accessToken) {
      const authStore = useAuthStore()
      authStore.accessToken = accessToken

      config.headers.Authorization = `Bearer ${accessToken}`
      return request(config)
    }
  }

  if (
    status === 403 &&
    error.response.data === 'User not registered in the Developer Dashboard'
  ) {
    useNotificationsStore().notifications.push(
      {
        message: 'Sorry Huskyfy is in beta now and is not open for everyone. ' +
          'If you want access to the website send a mail to huskyfy.bugtracker@gmail.com',
        type: Relevance.warning
      }
    )
    // Delete obsolete already collected tokens
    useAuthStore().reset()
    router.push({ name: ROUTE_NAME_LOGIN })
  }

  console.log('Exception while trying to handle error')

  return Promise.reject(error)
})

export default request
