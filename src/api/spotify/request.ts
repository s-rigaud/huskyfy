import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const request = axios.create({
  baseURL: 'https://api.spotify.com/v1/'
})

// Add Headers headers on every request when connected
request.interceptors.request.use(function (config) {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers!.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
}, async (error) => {
  console.error(error)
})

request.interceptors.response.use(response => {
  // Log every request
  console.log(response.config.url, response)
  return response
}, async (error) => {
  const { status } = error.response
  const config = error.config

  // Handle access token refresh for 401
  if (error.response && status === 401) {
    const res: any = await api.spotify.auth.requestNewAccessToken()
    if (res.data.access_token) {
      const authStore = useAuthStore()
      authStore.accessToken = res.data.access_token

      config.headers.Authorization = `Bearer ${res.data.access_token}`
      return request(config)
    }
  }

  // Handle access token refresh for 401
  if (error.response && status === 429) {
    console.error(error)
    console.error(config)
    // return request(config);
  }

  console.log('Exception while trying to handle error')
  return Promise.reject(error)
})

export default request
