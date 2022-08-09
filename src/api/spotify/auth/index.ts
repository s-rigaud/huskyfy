import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import axios, { AxiosResponse } from 'axios'
import { Base64 } from 'js-base64'
import { SpotifyAuthResponse } from '../model'

const CLIENT_ID: string = process.env.VUE_APP_SPOTIFY_CLIENT_ID
const CLIENT_SECRET: string = process.env.VUE_APP_SPOTIFY_CLIENT_SECRET
const ENCODED_CREDENTIALS = Base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`)

const REDIRECT_URL = `${process.env.VUE_APP_BASE_SERVER_URL}/login`
const SCOPES = [
  // Read all tracks and playlists
  'user-library-read',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-read-private',

  // Create & Update playlist tracks and images
  'playlist-modify-public',
  'playlist-modify-private',
  'ugc-image-upload'
].join(' ')

const generateRandomString = function (length: number): string {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789_,-~'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

export default {
  // Return Spotify OAuth url
  // On this url, the user can accept terms and scope and a temporary token is returned
  getOAuthUrl (): string {
    const authStore = useAuthStore()
    authStore.stateAuthorizationCode = generateRandomString(15)

    const BASE_URL = 'https://accounts.spotify.com/authorize'
    const QUERY_PARAMS = [
      'response_type=code',
      `client_id=${CLIENT_ID}`,
      `scope=${SCOPES}`,
      `redirect_uri=${REDIRECT_URL}`,
      `show_dialog=${useUserStore().wantsToChangeAccount}`,
      `state=${authStore.stateAuthorizationCode}`
    ].join('&')
    return `${BASE_URL}?${QUERY_PARAMS}`
  },

  // Request first access token from the previous temporary token received
  async requestFirstAccessToken () {
    const authStore = useAuthStore()
    await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: `Basic ${ENCODED_CREDENTIALS}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `code=${authStore.temporaryToken}&redirect_uri=${REDIRECT_URL}&grant_type=authorization_code`
    }).then(
      function ({ data }: AxiosResponse<SpotifyAuthResponse, SpotifyAuthResponse>) {
        // Delete old tokens not useful anymore
        authStore.$patch({
          temporaryToken: '',
          stateAuthorizationCode: '',
          accessToken: data.access_token,
          refreshToken: data.refresh_token
        })
      })
  },

  // Refresh new access token
  async requestNewAccessToken (): Promise<string | void> {
    const authStore = useAuthStore()
    console.log('trying to refresh token before retrying call')

    return await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: `Basic ${ENCODED_CREDENTIALS}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `grant_type=refresh_token&refresh_token=${authStore.refreshToken}`
    }).then(function ({ data }: AxiosResponse<SpotifyAuthResponse, SpotifyAuthResponse>) {
      return data.access_token
    }).catch(function (err: Error) {
      console.log('Error while fetching new access token', err)
    })
  }
}
