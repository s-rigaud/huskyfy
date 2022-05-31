import { useAuthStore } from "@/stores/auth";
import axios from "axios";
const Base64 = require('js-base64').Base64;

const CLIENT_ID = "0c26ab311d744f8faae1f5c8ccc4ae21"
const CLIENT_SECRET = "144c002f948a438a958b25783f2835fe"
const ENCODED_CREDENTIALS = Base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`)
const SCOPES = 'user-read-private user-read-email user-follow-read user-library-read playlist-read-collaborative playlist-read-private playlist-modify-public playlist-modify-private ugc-image-upload';
const REDIRECT_URL = `${process.env.VUE_APP_BASE_SERVER_URL}/login`

export default {
    // Return Spotify OAuth url
    // On this url, the user can accept terms and scope and a temporary token is returned
    getOAuthUrl() {
        const BASE_URL = 'https://accounts.spotify.com/authorize';
        let oauthUrl = `${BASE_URL}?response_type=code&client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URL}`;
        const FORCE_OAUTH_MANUAL_VALIDATION = false
        if (FORCE_OAUTH_MANUAL_VALIDATION) {
            oauthUrl += `&show_dialog=${true}`
        }
        return oauthUrl;
    },

    // Request first access token from the previous temporary token received
    async requestFirstAccessToken() {
        const authStore = useAuthStore();
        await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                Authorization: `Basic ${ENCODED_CREDENTIALS}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: `code=${authStore.temporaryToken}&redirect_uri=${REDIRECT_URL}&grant_type=authorization_code`,
        }).then(function (response) {
            // Delete old token not useful anymore
            authStore.temporaryToken = ''
            authStore.accessToken = response.data.access_token
            authStore.refreshToken = response.data.refresh_token
        })
    },

    // Refresh new access token
    async requestNewAccessToken() {
        const authStore = useAuthStore();
        console.log("trying to refresh token before retrying call")

        return await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                Authorization: `Basic ${ENCODED_CREDENTIALS}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: `grant_type=refresh_token&refresh_token=${authStore.refreshToken}`,
        }).then(function (response) {
            authStore.accessToken = response.data.access_token
            return response;
        }).catch(function (err) {
            console.log("Error while fetching new access token", err);
        });
    }
};
