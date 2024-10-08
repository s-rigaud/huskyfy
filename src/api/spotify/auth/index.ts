import axios, { AxiosResponse } from 'axios'

import { useAuthStore } from '@/stores/auth'
import { SpotifyAuthResponse } from '../types/responses'

const CLIENT_ID: string = import.meta.env.VITE_APP_SPOTIFY_CLIENT_ID as string
const CLIENT_SECRET: string = import.meta.env.VITE_APP_SPOTIFY_CLIENT_SECRET as string

if (!CLIENT_ID || !CLIENT_SECRET) {
  alert('Spotify client ID or secret not found in .env file')
  throw new Error('Spotify client ID or secret not found in .env file')
}

const ENCODED_CREDENTIALS = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
const REDIRECT_URL = `${import.meta.env.VITE_APP_BASE_SERVER_URL}/login`
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

  // SDK (listening to the song)
  // 'streaming'
].join(' ')

/**
 * Return a randomly generated string with letters and numbers
 *
 * @param length - length of the string to be generated
 */
const generateRandomString = (length: number): string => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

/**
 * Encode text to standard SHA256 format
 */
const sha256 = async (text: string): Promise<ArrayBuffer> => {
  const data = new TextEncoder().encode(text)
  return window.crypto.subtle.digest('SHA-256', data)
}

/**
 * Encode text buffer to Base64 format compatible for urls
 */
const base64urlencode = (buffer: ArrayBuffer): string => {
  const encoded = btoa(
    String.fromCharCode.apply(null, [...new Uint8Array(buffer)])
  )
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export default {
  /**
   * Return Spotify OAuth url
   * By going to this url, the user can accept terms and scope and a temporary token is returned
   */
  async getOAuthUrl (): Promise<string> {
    const authStore = useAuthStore()

    const STATE_AUTHORIZATION_CODE = generateRandomString(15)
    const CODE_VERIFIER = generateRandomString(128)
    const SECRET_CODE_CHALLENGE = base64urlencode(await sha256(CODE_VERIFIER))

    authStore.$patch({
      stateAuthorizationCode: STATE_AUTHORIZATION_CODE,
      secretCodeChallenge: SECRET_CODE_CHALLENGE,
      codeVerifier: CODE_VERIFIER
    })

    const BASE_URL = 'https://accounts.spotify.com/authorize'
    const QUERY_PARAMS = [
      'response_type=code',
      `client_id=${CLIENT_ID}`,
      `scope=${SCOPES}`,
      `redirect_uri=${REDIRECT_URL}`,
      `state=${STATE_AUTHORIZATION_CODE}`,
      'code_challenge_method=S256',
      `code_challenge=${SECRET_CODE_CHALLENGE}`
    ]

    return `${BASE_URL}?${QUERY_PARAMS.join('&')}`
  },

  /**
   * Request first access token from the previous temporary token received
   */
  async requestFirstAccessToken () {
    const authStore = useAuthStore()
    const data = [
      'grant_type=authorization_code',
      `code=${authStore.temporaryToken}`,
      `redirect_uri=${REDIRECT_URL}`,
      `code_verifier=${authStore.codeVerifier}`
    ].join('&')

    await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: `Basic ${ENCODED_CREDENTIALS}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data
    }).then(function ({ data }: AxiosResponse<SpotifyAuthResponse, SpotifyAuthResponse>) {
      authStore.$patch({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,

        // Delete old token not useful anymore
        temporaryToken: '',
        stateAuthorizationCode: '',
        codeVerifier: '',
        secretCodeChallenge: ''
      })
    })
  },

  /**
   * Refresh new access token
   */
  async requestNewAccessToken (): Promise<string | void> {
    console.log('trying to refresh token before retrying call')

    /*  const authStore = useAuthStore()
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
    }) */

    // Instead get a new fresh token
    window.location.href = await this.getOAuthUrl()
  }
}
