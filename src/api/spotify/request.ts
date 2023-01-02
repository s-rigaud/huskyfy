import axios, { AxiosHeaders } from 'axios'

import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { NotificationType, useNotificationsStore } from '@/stores/notifications'

const request = axios.create({
  baseURL: 'https://api.spotify.com/v1/'
})

// Add Headers headers on every request when connected
request.interceptors.request.use(function (config) {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    // TODO Update when this PR will be fixed https://github.com/axios/axios/issues/5416
    config.headers = { ...config.headers } as AxiosHeaders
    config.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
  }
  return config
})

request.interceptors.response.use(response => {
  // Log every request
  // console.log(response)
  return response
}, async (error) => {
  const { status = 500 } = error.response
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
  } else {
    const errorMsg = (error.response?.data?.error?.message || error as string)
    useNotificationsStore().notifications.push(
      {
        message: `Spotify error when accessing API : ${errorMsg}`,
        type: NotificationType.error
      }
    )
  }

  return Promise.reject(error)
})

export default request
