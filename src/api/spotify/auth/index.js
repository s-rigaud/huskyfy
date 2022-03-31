import { useAuthStore } from "@/stores/modules/auth";
import axios from "axios";
const Base64 = require('js-base64').Base64;

const CLIENT_ID = "0c26ab311d744f8faae1f5c8ccc4ae21"
const CLIENT_SECRET = "144c002f948a438a958b25783f2835fe"
const REDIRECT_URI = "http://localhost:8080";
const ENCODED_CREDENTIALS = Base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`)
const SCOPES = 'user-read-private user-read-email user-follow-read user-library-read playlist-read-collaborative playlist-read-private';

export default {
    // https://developer.spotify.com/documentation/general/guides/authorization/code-flow/

    // https://accounts.spotify.com/authorize?response_type=code&client_id=0c26ab311d744f8faae1f5c8ccc4ae21&scope=user-read-private%20user-read-email%20user-follow-read%20user-library-read%20playlist-read-collaborative%20playlist-read-private&redirect_uri=http://localhost:8080
    makeOAuthRequest() {
        const PARAMS = {
            response_type: "code",
            client_id: CLIENT_ID,
            scope: SCOPES,
            redirect_uri: REDIRECT_URI,
        }
        axios({
            method: 'get',
            url: 'https://accounts.spotify.com/authorize',
            params: PARAMS,
        })
    },

    requestFirstAccessToken() {
        const authStore = useAuthStore();

        console.log("Token: " + authStore.temporaryToken);
        console.log("Encoded credentials: " + ENCODED_CREDENTIALS)

        axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                Authorization: `Basic ${ENCODED_CREDENTIALS}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: `code=${authStore.temporaryToken}&redirect_uri=${REDIRECT_URI}&grant_type=authorization_code`,
        }).then(function (response) {
            authStore.accessToken = response.data.access_token
            authStore.refreshToken = response.data.refresh_token
            return response;
        })
    },

    requestNewAccessToken() {
        const authStore = useAuthStore();
        console.log("trying to refresh token before retrying call")

        axios({
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
            console.log(err);
        });
    }
};
