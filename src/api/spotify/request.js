import api from "@/api";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const request = axios.create({
    baseURL: "https://api.spotify.com/v1/"
});

request.interceptors.request.use(function (config) {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
        config.headers.common["Authorization"] = `Bearer ${authStore.accessToken}`;
    }
    return config;
}, null);

// Handle access token refresh for 401
request.interceptors.response.use(response => {
    console.log(response);
    return response
}, async (error) => {
    const { status } = error.response;
    const config = error.config;

    if (error.response && status === 401) {
        let res = await api.spotify.auth.requestNewAccessToken();
        if (res.data.access_token) {
            const authStore = useAuthStore()
            authStore.accessToken = res.data.access_token;

            config.headers["Authorization"] = `Bearer ${res.data.access_token}`;
            return request(config);
        }
    }
    console.log("Exception while trying to handle error")
    return Promise.reject(error)
});

export default request;
