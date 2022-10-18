import { useAuthStore } from '@/stores/auth'
import axios, { AxiosResponse } from 'axios'
import { SpotifyAuthResponse } from '../types/responses'

const CLIENT_ID: string = process.env.VUE_APP_SPOTIFY_CLIENT_ID
const CLIENT_SECRET: string = process.env.VUE_APP_SPOTIFY_CLIENT_SECRET

const ENCODED_CREDENTIALS = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
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

const generateRandomString = (length: number): string => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)

  return window.crypto.subtle.digest('SHA-256', data)
}

const base64urlencode = (a: ArrayBuffer): string => {
  const encoded = btoa(
    String.fromCharCode.apply(null, [...new Uint8Array(a)])
  )
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export default {
  // Return Spotify OAuth url
  // On this url, the user can accept terms and scope and a temporary token is returned
  async getOAuthUrl(): Promise<string> {
    const authStore = useAuthStore()

    const STATE_AUTHORIZATION_CODE = generateRandomString(15)

    // 2bscelmwgoqewakfzyua7t4blfcsubfa27ej655g6w96dt8hmxpagbtw24dhiyj31if93fxowut2lxfjz8r4tmhexbf559pbjrugktzlxaggemosne1qly4okmys9r1t
    // const CODE_VERIFIER = generateRandomString(128)

    const CODE_VERIFIER = "2bscelmwgoqewakfzyua7t4blfcsubfa27ej655g6w96dt8hmxpagbtw24dhiyj31if93fxowut2lxfjz8r4tmhexbf559pbjrugktzlxaggemosne1qly4okmys9r1t"
    alert("verifier " + CODE_VERIFIER);


    // hZ48M0x2iw3b_ovtGyp9jdTeNNVzX-CrBQM5s0yGPF0
    const SECRET_CODE_CHALLENGE = base64urlencode(await sha256(CODE_VERIFIER))
    alert("code challenge " + SECRET_CODE_CHALLENGE);

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

  // Request first access token from the previous temporary token received
  async requestFirstAccessToken() {
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
      // Delete old token not useful anymore
      authStore.$patch({
        temporaryToken: '',
        stateAuthorizationCode: '',
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      })
    })
  },

  // Refresh new access token
  async requestNewAccessToken(): Promise<string | void> {
    console.log('trying to refresh token before retrying call')

    // The following should work but since I implemented PCKE, I'm not able to use the refresh token normally
    /*
      const authStore = useAuthStore()
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
    */

    // Instead get a new fresh token
    window.location.href = await this.getOAuthUrl()
  }
}
